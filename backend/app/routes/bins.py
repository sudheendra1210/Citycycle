from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.database_models import Bin, BinReading, BinType, BinStatus
from app.models.schemas import BinCreate, BinResponse, BinReadingCreate, BinReadingResponse
from app.utils.database import get_db
from app.middleware.auth import get_optional_user
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from geopy.distance import geodesic
from pydantic import BaseModel
import random
import math

router = APIRouter()


class SeedRequest(BaseModel):
    latitude: float
    longitude: float
    count: int = 10
    radius_km: float = 2.0


@router.post("/seed-nearby")
def seed_bins_nearby(data: SeedRequest, db: Session = Depends(get_db)):
    """Seed test bins within a radius around a location"""
    # Clear existing bins, readings, and collections
    db.query(BinReading).delete()
    from app.models.database_models import Collection
    db.query(Collection).delete()
    db.query(Bin).delete()
    db.commit()

    types = [BinType.RESIDENTIAL, BinType.COMMERCIAL, BinType.PUBLIC_SPACE]
    sensors = ["ultrasonic", "infrared", "weight"]
    zones = ["North", "South", "East", "West", "Central"]
    capacities = [120, 240, 360, 500]

    created_bins = []
    for i in range(1, data.count + 1):
        # Spread bins evenly in a circle with some randomness
        angle = (2 * math.pi * i / data.count) + random.uniform(-0.3, 0.3)
        distance_km = random.uniform(0.3, data.radius_km)

        # Convert polar to lat/lng offset
        # 1 degree lat ≈ 111km, 1 degree lng ≈ 111km * cos(lat)
        dlat = (distance_km * math.cos(angle)) / 111.0
        dlng = (distance_km * math.sin(angle)) / (111.0 * math.cos(math.radians(data.latitude)))

        new_bin = Bin(
            bin_id=f"BIN_{i}",
            latitude=data.latitude + dlat,
            longitude=data.longitude + dlng,
            area_name="Nearby",
            capacity_liters=random.choice(capacities),
            bin_type=types[i % 3],
            sensor_type=sensors[i % 3],
            zone=zones[i % 5],
            ward=random.randint(1, 10),
            status=BinStatus.ACTIVE,
            installation_date=datetime.utcnow()
        )
        db.add(new_bin)
        created_bins.append(new_bin.bin_id)

    # Also seed some random fill-level readings
    db.flush()
    for i in range(1, data.count + 1):
        fill = random.uniform(5, 95)
        reading = BinReading(
            bin_id=f"BIN_{i}",
            fill_level_percent=round(fill, 1),
            weight_kg=round(random.uniform(1, 50), 1),
            temperature_c=round(random.uniform(20, 40), 1),
            battery_percent=round(random.uniform(50, 100), 1),
            timestamp=datetime.utcnow()
        )
        db.add(reading)

    db.commit()
    return {"message": f"Created {len(created_bins)} bins", "bins": created_bins}


@router.get("/", response_model=List[BinResponse])
def get_all_bins(
    skip: int = 0, 
    limit: int = 100, 
    area_name: Optional[str] = None,
    db: Session = Depends(get_db),
    user: Optional[Dict] = Depends(get_optional_user)
):
    """Get all bins with their current status, optionally filtered by area"""
    query = db.query(Bin)
    if area_name:
        query = query.filter(Bin.area_name == area_name)
        
    bins = query.offset(skip).limit(limit).all()
    
    # Enrich with current fill level
    for bin in bins:
        latest_reading = db.query(BinReading).filter(
            BinReading.bin_id == bin.bin_id
        ).order_by(desc(BinReading.timestamp)).first()
        
        if latest_reading:
            bin.current_fill_level = latest_reading.fill_level_percent
        
    return bins

@router.get("/{bin_id}", response_model=BinResponse)
def get_bin(bin_id: str, db: Session = Depends(get_db)):
    """Get specific bin details"""
    bin = db.query(Bin).filter(Bin.bin_id == bin_id).first()
    if not bin:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    # Get latest reading
    latest_reading = db.query(BinReading).filter(
        BinReading.bin_id == bin_id
    ).order_by(desc(BinReading.timestamp)).first()
    
    if latest_reading:
        bin.current_fill_level = latest_reading.fill_level_percent
    
    return bin

@router.post("/", response_model=BinResponse)
def create_bin(bin: BinCreate, db: Session = Depends(get_db)):
    """Create a new bin"""
    db_bin = Bin(**bin.dict())
    db.add(db_bin)
    db.commit()
    db.refresh(db_bin)
    return db_bin

@router.get("/{bin_id}/readings", response_model=List[BinReadingResponse])
def get_bin_readings(
    bin_id: str, 
    hours: int = 24,
    db: Session = Depends(get_db)
):
    """Get recent readings for a bin"""
    since = datetime.utcnow() - timedelta(hours=hours)
    readings = db.query(BinReading).filter(
        BinReading.bin_id == bin_id,
        BinReading.timestamp >= since
    ).order_by(desc(BinReading.timestamp)).all()
    
    return readings

@router.post("/{bin_id}/readings", response_model=BinReadingResponse)
def create_bin_reading(
    bin_id: str,
    reading: BinReadingCreate,
    db: Session = Depends(get_db)
):
    """Add a new sensor reading and notify if full"""
    from app.utils.twilio_service import twilio_service
    from app.models.database_models import User, UserRole

    # Verify bin exists
    bin = db.query(Bin).filter(Bin.bin_id == bin_id).first()
    if not bin:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    db_reading = BinReading(**reading.dict())
    db.add(db_reading)
    
    # Check for overflow alert
    if db_reading.fill_level_percent >= 90.0:
        # Notify admins and workers in this area
        alert_users = db.query(User).filter(
            (User.role.in_([UserRole.ADMIN, UserRole.WORKER])) & 
            (User.is_phone_verified == True)
        ).all()
        
        # Filter by area if available
        if bin.area_name:
            area_users = [u for u in alert_users if u.area == bin.area_name or u.role == UserRole.ADMIN]
            if area_users:
                alert_users = area_users

        for user in alert_users:
            if user.phone:
                twilio_service.notify_bin_full(
                    user.phone, 
                    bin.bin_id, 
                    bin.area_name or "Unknown Area"
                )

    db.commit()
    db.refresh(db_reading)
    return db_reading

@router.get("/alerts/high-fill", response_model=List[BinResponse])
def get_high_fill_bins(threshold: float = 80.0, db: Session = Depends(get_db)):
    """Get bins above fill threshold"""
    # Get latest reading for each bin
    from sqlalchemy.sql import func
    
    subquery = db.query(
        BinReading.bin_id,
        func.max(BinReading.timestamp).label('max_timestamp')
    ).group_by(BinReading.bin_id).subquery()
    
    high_fill_readings = db.query(BinReading).join(
        subquery,
        (BinReading.bin_id == subquery.c.bin_id) &
        (BinReading.timestamp == subquery.c.max_timestamp)
    ).filter(BinReading.fill_level_percent >= threshold).all()
    
    bin_ids = [r.bin_id for r in high_fill_readings]
    bins = db.query(Bin).filter(Bin.bin_id.in_(bin_ids)).all()
    
    # Enrich with current fill level
    for bin in bins:
        reading = next((r for r in high_fill_readings if r.bin_id == bin.bin_id), None)
        if reading:
            bin.current_fill_level = reading.fill_level_percent
    
    return bins

@router.get("/nearby", response_model=List[Dict])
def get_nearby_bins(
    lat: float,
    lng: float,
    radius_km: float = 5.0,
    db: Session = Depends(get_db)
):
    """Get bins within a radius, sorted by distance"""
    bins = db.query(Bin).all()
    nearby_bins = []
    
    user_coords = (lat, lng)
    
    for bin in bins:
        bin_coords = (bin.latitude, bin.longitude)
        distance = geodesic(user_coords, bin_coords).km
        
        if distance <= radius_km:
            # Get latest reading
            latest_reading = db.query(BinReading).filter(
                BinReading.bin_id == bin.bin_id
            ).order_by(desc(BinReading.timestamp)).first()
            
            fill_level = latest_reading.fill_level_percent if latest_reading else 0
            
            # Determine status
            status = "Empty"
            if fill_level > 80:
                status = "Full"
            elif fill_level > 40:
                status = "Partially Filled"
            
            nearby_bins.append({
                "bin_id": bin.bin_id,
                "latitude": bin.latitude,
                "longitude": bin.longitude,
                "distance_km": round(distance, 2),
                "fill_level": fill_level,
                "status": status,
                "bin_type": bin.bin_type.value,
                "zone": bin.zone
            })
            
    # Sort by distance
    nearby_bins.sort(key=lambda x: x["distance_km"])
    
    return nearby_bins
