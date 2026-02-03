"""
Forecasting API Routes
Endpoints for ML-based fill-level prediction and model management
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List, Optional, Dict
from datetime import datetime, timedelta

from app.models.database_models import Bin, BinReading
from app.utils.database import get_db
from app.ml.fill_level_forecaster import FillLevelForecaster, ModelComparator
from app.middleware.auth import get_current_user, require_role

router = APIRouter()


def get_bin_info(bin: Bin) -> dict:
    """Convert Bin object to dictionary for feature engineering"""
    return {
        'bin_type': bin.bin_type.value if bin.bin_type else 'residential',
        'capacity_liters': bin.capacity_liters,
        'zone': bin.zone,
        'ward': bin.ward,
        'latitude': bin.latitude,
        'longitude': bin.longitude
    }


@router.post("/train")
def train_models(
    bin_ids: Optional[List[str]] = Query(None),
    model_types: List[str] = Query(['linear', 'tree', 'forest']),
    db: Session = Depends(get_db),
    user: Dict = Depends(require_role("admin"))  # Admin only
):
    """
    Train ML models for specified bins
    
    Args:
        bin_ids: List of bin IDs to train (if None, train all bins)
        model_types: List of model types to train (linear, tree, forest, arima)
    
    Returns:
        Training results with metrics for each bin and model
    """
    # Get bins to train
    if bin_ids:
        bins = db.query(Bin).filter(Bin.bin_id.in_(bin_ids)).all()
    else:
        bins = db.query(Bin).limit(10).all()  # Limit to 10 for performance
    
    if not bins:
        raise HTTPException(status_code=404, detail="No bins found")
    
    results = {}
    
    for bin in bins:
        # Get historical readings (at least 30 days recommended)
        readings = db.query(BinReading).filter(
            BinReading.bin_id == bin.bin_id
        ).order_by(BinReading.timestamp.asc()).all()
        
        if len(readings) < 20:
            results[bin.bin_id] = {'error': 'Insufficient data (need at least 20 readings)'}
            continue
        
        # Create forecaster
        forecaster = FillLevelForecaster(bin.bin_id)
        
        # Get bin info
        bin_info = get_bin_info(bin)
        
        # Train models
        try:
            metrics = forecaster.train_models(readings, bin_info, model_types)
            results[bin.bin_id] = metrics
        except Exception as e:
            results[bin.bin_id] = {'error': str(e)}
    
    return {
        'trained_bins': len([r for r in results.values() if 'error' not in r]),
        'total_bins': len(bins),
        'results': results
    }


@router.get("/predict/{bin_id}")
def predict_fill_level(
    bin_id: str,
    hours_ahead: int = Query(24, ge=1, le=168),  # 1 hour to 7 days
    model_type: str = Query('forest', regex='^(linear|tree|forest|arima)$'),
    db: Session = Depends(get_db)
):
    """
    Get fill-level predictions for a specific bin
    
    Args:
        bin_id: Bin identifier
        hours_ahead: Hours to predict ahead (1-168)
        model_type: Model to use (linear, tree, forest, arima)
    
    Returns:
        Predictions with hourly breakdown
    """
    # Get bin
    bin = db.query(Bin).filter(Bin.bin_id == bin_id).first()
    if not bin:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    # Get historical readings
    readings = db.query(BinReading).filter(
        BinReading.bin_id == bin_id
    ).order_by(BinReading.timestamp.asc()).all()
    
    if len(readings) < 20:
        raise HTTPException(
            status_code=400, 
            detail="Insufficient data for prediction (need at least 20 readings)"
        )
    
    # Create forecaster
    forecaster = FillLevelForecaster(bin_id)
    
    # Get bin info
    bin_info = get_bin_info(bin)
    
    # Make prediction
    try:
        prediction = forecaster.predict(readings, bin_info, hours_ahead, model_type)
        
        if 'error' in prediction:
            raise HTTPException(status_code=400, detail=prediction['error'])
        
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/compare-models/{bin_id}")
def compare_models(
    bin_id: str,
    db: Session = Depends(get_db)
):
    """
    Compare performance of all models for a bin
    
    Args:
        bin_id: Bin identifier
    
    Returns:
        Comparison of RMSE, MAE, R² for each model
    """
    # Get bin
    bin = db.query(Bin).filter(Bin.bin_id == bin_id).first()
    if not bin:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    # Get historical readings
    readings = db.query(BinReading).filter(
        BinReading.bin_id == bin_id
    ).order_by(BinReading.timestamp.asc()).all()
    
    if len(readings) < 20:
        raise HTTPException(
            status_code=400, 
            detail="Insufficient data for model comparison"
        )
    
    # Create forecaster and train all models
    forecaster = FillLevelForecaster(bin_id)
    bin_info = get_bin_info(bin)
    
    try:
        # Train all available models
        metrics = forecaster.train_models(
            readings, 
            bin_info, 
            model_types=['linear', 'tree', 'forest', 'arima']
        )
        
        # Compare models
        comparison = ModelComparator.compare_models(metrics)
        
        return comparison
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/feature-importance/{bin_id}")
def get_feature_importance(
    bin_id: str,
    model_type: str = Query('forest', regex='^(tree|forest)$'),
    db: Session = Depends(get_db)
):
    """
    Get feature importance for tree-based models
    
    Args:
        bin_id: Bin identifier
        model_type: Model type (tree or forest)
    
    Returns:
        Feature importance scores
    """
    # Get bin
    bin = db.query(Bin).filter(Bin.bin_id == bin_id).first()
    if not bin:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    # Create forecaster
    forecaster = FillLevelForecaster(bin_id)
    
    # Get feature importance
    try:
        importance = forecaster.get_feature_importance(model_type)
        
        if 'error' in importance:
            raise HTTPException(status_code=400, detail=importance['error'])
        
        return importance
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/predictions-batch")
def get_batch_predictions(
    threshold: float = Query(70.0, ge=0, le=100),
    hours_ahead: int = Query(24, ge=1, le=168),
    model_type: str = Query('forest', regex='^(linear|tree|forest|arima)$'),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Get predictions for multiple bins above threshold
    
    Args:
        threshold: Only predict for bins above this fill level
        hours_ahead: Hours to predict ahead
        model_type: Model to use
        limit: Maximum number of bins to predict
    
    Returns:
        Predictions for all bins above threshold
    """
    # Get bins with latest readings above threshold
    subquery = db.query(
        BinReading.bin_id,
        func.max(BinReading.timestamp).label('max_timestamp')
    ).group_by(BinReading.bin_id).subquery()
    
    high_fill_readings = db.query(BinReading).join(
        subquery,
        (BinReading.bin_id == subquery.c.bin_id) &
        (BinReading.timestamp == subquery.c.max_timestamp)
    ).filter(BinReading.fill_level_percent >= threshold).limit(limit).all()
    
    if not high_fill_readings:
        return {
            'count': 0,
            'predictions': []
        }
    
    bin_ids = [r.bin_id for r in high_fill_readings]
    bins = db.query(Bin).filter(Bin.bin_id.in_(bin_ids)).all()
    
    predictions = []
    
    for bin in bins:
        # Get historical readings
        readings = db.query(BinReading).filter(
            BinReading.bin_id == bin.bin_id
        ).order_by(BinReading.timestamp.asc()).all()
        
        if len(readings) < 20:
            continue
        
        # Create forecaster
        forecaster = FillLevelForecaster(bin.bin_id)
        bin_info = get_bin_info(bin)
        
        try:
            prediction = forecaster.predict(readings, bin_info, hours_ahead, model_type)
            
            if 'error' not in prediction:
                predictions.append(prediction)
        except:
            continue
    
    # Sort by hours until full
    predictions.sort(key=lambda x: x.get('hours_until_full') or 999)
    
    return {
        'count': len(predictions),
        'predictions': predictions
    }


@router.get("/historical-vs-predicted/{bin_id}")
def get_historical_vs_predicted(
    bin_id: str,
    days_back: int = Query(7, ge=1, le=30),
    hours_ahead: int = Query(24, ge=1, le=168),
    model_type: str = Query('forest', regex='^(linear|tree|forest|arima)$'),
    db: Session = Depends(get_db)
):
    """
    Get historical data with predictions overlay for visualization
    
    Args:
        bin_id: Bin identifier
        days_back: Days of historical data to include
        hours_ahead: Hours to predict ahead
        model_type: Model to use
    
    Returns:
        Historical readings + predicted values
    """
    # Get bin
    bin = db.query(Bin).filter(Bin.bin_id == bin_id).first()
    if not bin:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    # Get historical readings
    cutoff_time = datetime.utcnow() - timedelta(days=days_back)
    readings = db.query(BinReading).filter(
        BinReading.bin_id == bin_id,
        BinReading.timestamp >= cutoff_time
    ).order_by(BinReading.timestamp.asc()).all()
    
    if len(readings) < 10:
        raise HTTPException(
            status_code=400, 
            detail="Insufficient historical data"
        )
    
    # Get all readings for training
    all_readings = db.query(BinReading).filter(
        BinReading.bin_id == bin_id
    ).order_by(BinReading.timestamp.asc()).all()
    
    # Create forecaster
    forecaster = FillLevelForecaster(bin_id)
    bin_info = get_bin_info(bin)
    
    try:
        # Make prediction
        prediction = forecaster.predict(all_readings, bin_info, hours_ahead, model_type)
        
        if 'error' in prediction:
            raise HTTPException(status_code=400, detail=prediction['error'])
        
        # Format historical data
        historical = [
            {
                'timestamp': r.timestamp,
                'fill_level_percent': r.fill_level_percent,
                'type': 'actual'
            }
            for r in readings
        ]
        
        # Format predicted data
        predicted = [
            {
                'timestamp': p['timestamp'],
                'fill_level_percent': p['predicted_fill_level'],
                'type': 'predicted'
            }
            for p in prediction.get('hourly_predictions', [])
        ]
        
        return {
            'bin_id': bin_id,
            'model_type': model_type,
            'historical': historical,
            'predicted': predicted,
            'current_fill_level': prediction.get('current_fill_level'),
            'predicted_fill_level': prediction.get('predicted_fill_level'),
            'hours_until_full': prediction.get('hours_until_full')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
