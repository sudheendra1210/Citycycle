import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Mocking the essential parts of the logic
class FeatureEngineer:
    def extract_time_features(self, df):
        df['hour'] = df['timestamp'].dt.hour
        return df
    
    def add_bin_metadata(self, df, bin_info):
        df['capacity_liters'] = bin_info['capacity_liters']
        return df

def reproduce_bug():
    # Load a real model if available
    model_dir = r"c:\Users\Dell\Desktop\INTEGRATED PROJECT\backend\app\ml\trained_models"
    bin_id = "BIN_001"
    model_path = os.path.join(model_dir, f"{bin_id}_forest.joblib")
    features_path = os.path.join(model_dir, f"{bin_id}_features.joblib")
    
    if not os.path.exists(model_path):
        print("Model not found")
        return

    model = joblib.load(model_path)
    feature_columns = joblib.load(features_path)
    
    # Mock last_row (simulating what the current code does)
    # Let's say current level is 62.8
    current_fill = 62.8
    current_time = datetime.now()
    
    # Simulating the creation of a row that has lags
    # (In reality this comes from prepare_data which uses extract_lag_features)
    data = {col: [0.0] for col in feature_columns}
    data['timestamp'] = [current_time]
    data['fill_level_percent'] = [current_fill]
    
    # Set lags to current fill to simulate constant history or just a starting point
    for col in feature_columns:
        if 'lag' in col:
            data[col] = [current_fill]
    
    last_row = pd.DataFrame(data)
    
    print(f"Initial Lags: {[last_row[c].values[0] for c in feature_columns if 'lag' in c]}")
    
    predictions = []
    temp_last_row = last_row.copy()
    
    for hour in range(1, 6):
        future_time = current_time + timedelta(hours=hour)
        
        # Simulating _create_future_features
        future_features = pd.DataFrame([{'timestamp': future_time}])
        future_features['hour'] = future_features['timestamp'].dt.hour
        future_features['capacity_liters'] = 100 # mock
        
        # This is the BUG: it copies everything else from temp_last_row
        for col in feature_columns:
            if col not in future_features.columns:
                future_features[col] = temp_last_row[col].values[0]
        
        future_features = future_features[feature_columns]
        
        pred = model.predict(future_features)[0]
        print(f"Hour {hour}: Predicted {pred} (using lags {future_features.filter(like='lag').values[0]})")
        
        # Updating temp_last_row as the code does
        temp_last_row['fill_level_percent'] = pred
        temp_last_row['timestamp'] = future_time
        # Note: Lags are NOT updated in temp_last_row!

if __name__ == "__main__":
    reproduce_bug()
