from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database_models import Bin, BinReading
from app.models.schemas import FillLevelPrediction, RouteOptimization
from app.utils.database import get_db
from app.ml.predictor import predict_fill_level
from app.ml.route_optimizer import optimize_collection_route
from typing import List
from datetime import datetime

router = APIRouter()

@router.get("/fill-level/{bin_id}", response_model=FillLevelPrediction)
def predict_bin_fill_level(bin_id: str, hours_ahead: int = 24, db: Session = Depends(get_db)):
    """Predict when a bin will be full"""
    
    # Get bin
    bin = db.query(Bin).filter(Bin.bin_id == bin_id).first()
    if not bin:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    # Get historical readings
    readings = db.query(BinReading).filter(
        BinReading.bin_id == bin_id
    ).order_by(BinReading.timestamp.desc()).limit(100).all()
    
    if len(readings) < 5:
        raise HTTPException(status_code=400, detail="Not enough data for prediction")
    
    # Make prediction
    prediction = predict_fill_level(readings, hours_ahead)
    
    return prediction

@router.post("/route-optimization", response_model=RouteOptimization)
def optimize_route(
    vehicle_id: str,
    threshold: float = 80.0,
    db: Session = Depends(get_db)
):
    """Optimize collection route for bins above threshold"""
    
    # Get bins needing collection
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
    
    if not high_fill_readings:
        return {
            "vehicle_id": vehicle_id,
            "bins_to_collect": [],
            "total_distance_km": 0,
            "estimated_duration_minutes": 0,
            "optimized_sequence": []
        }
    
    bin_ids = [r.bin_id for r in high_fill_readings]
    bins = db.query(Bin).filter(Bin.bin_id.in_(bin_ids)).all()
    
    # Optimize route
    optimized_route = optimize_collection_route(vehicle_id, bins)
    
    return optimized_route

@router.get("/predictions/all-bins")
def predict_all_bins(threshold: float = 70.0, db: Session = Depends(get_db)):
    """Get predictions for all bins above threshold"""
    
    # Get all bins
    bins = db.query(Bin).all()
    
    predictions = []
    for bin in bins:
        readings = db.query(BinReading).filter(
            BinReading.bin_id == bin.bin_id
        ).order_by(BinReading.timestamp.desc()).limit(50).all()
        
        if len(readings) >= 5:
            try:
                prediction = predict_fill_level(readings, hours_ahead=24)
                if prediction['predicted_fill_level'] >= threshold:
                    predictions.append(prediction)
            except:
                continue
    
    return sorted(predictions, key=lambda x: x.get('hours_until_full', 999))
