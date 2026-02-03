import numpy as np
from datetime import datetime, timedelta
from typing import List

def predict_fill_level(readings: List, hours_ahead: int = 24):
    """
    Simple linear regression prediction for bin fill level
    In production, use more sophisticated ML models (LSTM, Prophet, etc.)
    """
    
    # Extract data
    timestamps = [r.timestamp for r in readings]
    fill_levels = [r.fill_level_percent for r in readings]
    
    # Sort by timestamp
    sorted_data = sorted(zip(timestamps, fill_levels), key=lambda x: x[0])
    timestamps, fill_levels = zip(*sorted_data)
    
    # Convert to hours since first reading
    first_time = timestamps[0]
    hours = [(t - first_time).total_seconds() / 3600 for t in timestamps]
    
    # Simple linear regression
    n = len(hours)
    if n < 2:
        return {
            "bin_id": readings[0].bin_id,
            "current_fill_level": fill_levels[-1],
            "predicted_fill_level": fill_levels[-1],
            "predicted_full_time": None,
            "hours_until_full": None
        }
    
    # Calculate slope and intercept
    x_mean = np.mean(hours)
    y_mean = np.mean(fill_levels)
    
    numerator = sum((hours[i] - x_mean) * (fill_levels[i] - y_mean) for i in range(n))
    denominator = sum((hours[i] - x_mean) ** 2 for i in range(n))
    
    if denominator == 0:
        slope = 0
    else:
        slope = numerator / denominator
    
    intercept = y_mean - slope * x_mean
    
    # Predict future fill level
    current_hour = hours[-1]
    future_hour = current_hour + hours_ahead
    predicted_fill = slope * future_hour + intercept
    
    # Clamp between 0 and 100
    predicted_fill = max(0, min(100, predicted_fill))
    
    # Calculate when bin will be full (100%)
    hours_until_full = None
    predicted_full_time = None
    
    if slope > 0 and fill_levels[-1] < 100:
        hours_until_full = (100 - fill_levels[-1]) / slope
        predicted_full_time = timestamps[-1] + timedelta(hours=hours_until_full)
    
    return {
        "bin_id": readings[0].bin_id,
        "current_fill_level": round(fill_levels[-1], 2),
        "predicted_fill_level": round(predicted_fill, 2),
        "predicted_full_time": predicted_full_time,
        "hours_until_full": round(hours_until_full, 2) if hours_until_full else None
    }
