from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.database_models import Bin, BinReading
from app.models.schemas import BinCreate, BinResponse, BinReadingCreate, BinReadingResponse
from app.utils.database import get_db
from app.middleware.auth import get_optional_user
from typing import List, Optional, Dict
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/", response_model=List[BinResponse])
def get_all_bins(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    user: Optional[Dict] = Depends(get_optional_user)
):
    """Get all bins with their current status"""
    bins = db.query(Bin).offset(skip).limit(limit).all()
    
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
