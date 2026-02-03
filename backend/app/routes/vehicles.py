from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.database_models import Vehicle, GPSLog
from app.models.schemas import VehicleCreate, VehicleResponse
from app.utils.database import get_db
from typing import List

router = APIRouter()

@router.get("/", response_model=List[VehicleResponse])
def get_vehicles(db: Session = Depends(get_db)):
    """Get all vehicles"""
    vehicles = db.query(Vehicle).all()
    
    # Enrich with latest GPS position
    for vehicle in vehicles:
        latest_gps = db.query(GPSLog).filter(
            GPSLog.vehicle_id == vehicle.vehicle_id
        ).order_by(desc(GPSLog.timestamp)).first()
        
        if latest_gps:
            vehicle.current_latitude = latest_gps.latitude
            vehicle.current_longitude = latest_gps.longitude
    
    return vehicles

@router.post("/", response_model=VehicleResponse)
def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    """Add a new vehicle"""
    db_vehicle = Vehicle(**vehicle.dict())
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

@router.get("/{vehicle_id}/location")
def get_vehicle_location(vehicle_id: str, db: Session = Depends(get_db)):
    """Get current vehicle location"""
    latest_gps = db.query(GPSLog).filter(
        GPSLog.vehicle_id == vehicle_id
    ).order_by(desc(GPSLog.timestamp)).first()
    
    if not latest_gps:
        return {"vehicle_id": vehicle_id, "location": None}
    
    return {
        "vehicle_id": vehicle_id,
        "latitude": latest_gps.latitude,
        "longitude": latest_gps.longitude,
        "speed_kmh": latest_gps.speed_kmh,
        "status": latest_gps.status,
        "timestamp": latest_gps.timestamp
    }
