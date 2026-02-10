from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.database_models import Bin, BinReading
from app.models.schemas import BinCreate, BinResponse, BinReadingCreate, BinReadingResponse
from app.utils.database import get_db
from app.middleware.auth import get_optional_user
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from geopy.distance import geodesic
from geopy.distance import geodesic

router = APIRouter()

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
    """Add a new sensor reading"""
    # Verify bin exists
    bin = db.query(Bin).filter(Bin.bin_id == bin_id).first()
    if not bin:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    db_reading = BinReading(**reading.dict())
    db.add(db_reading)
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
