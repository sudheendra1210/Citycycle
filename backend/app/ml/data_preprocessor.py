"""
Data Preprocessing Module for Waste Bin Fill-Level Forecasting
Handles data cleaning, feature engineering, and preparation for ML models
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Tuple, Dict
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.model_selection import train_test_split


class DataPreprocessor:
    """Handles data cleaning and preprocessing for bin readings"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        
    def clean_readings(self, readings: List) -> pd.DataFrame:
        """
        Convert readings to DataFrame and clean data
        
        Args:
            readings: List of BinReading objects
            
        Returns:
            Cleaned DataFrame
        """
        # Convert to DataFrame
        data = []
        for reading in readings:
            data.append({
                'timestamp': reading.timestamp,
                'fill_level_percent': reading.fill_level_percent,
                'weight_kg': reading.weight_kg,
                'temperature_c': reading.temperature_c,
                'battery_percent': reading.battery_percent
            })
        
        df = pd.DataFrame(data)
        
        if df.empty:
            return df
            
        # Sort by timestamp
        df = df.sort_values('timestamp').reset_index(drop=True)
        
        # Handle missing values
        df = self._handle_missing_values(df)
        
        # Remove outliers
        df = self._remove_outliers(df, 'fill_level_percent')
        
        # Smooth noisy readings
        df = self._smooth_readings(df)
        
        return df
    
    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle missing values using forward fill and interpolation"""
        # Forward fill for small gaps
        df = df.fillna(method='ffill', limit=2)
        
        # Interpolate for remaining gaps
        numeric_cols = ['fill_level_percent', 'weight_kg', 'temperature_c', 'battery_percent']
        for col in numeric_cols:
            if col in df.columns:
                df[col] = df[col].interpolate(method='linear', limit_direction='both')
        
        # Drop any remaining NaN rows
        df = df.dropna()
        
        return df
    
    def _remove_outliers(self, df: pd.DataFrame, column: str, threshold: float = 3.0) -> pd.DataFrame:
        """Remove outliers using IQR method"""
        if column not in df.columns or len(df) < 4:
            return df
            
        Q1 = df[column].quantile(0.25)
        Q3 = df[column].quantile(0.75)
        IQR = Q3 - Q1
        
        lower_bound = Q1 - threshold * IQR
        upper_bound = Q3 + threshold * IQR
        
        # Keep values within bounds or at boundaries (0-100 for fill level)
        df = df[
            ((df[column] >= lower_bound) & (df[column] <= upper_bound)) |
            (df[column] == 0) | (df[column] == 100)
        ]
        
        return df
    
    def _smooth_readings(self, df: pd.DataFrame, window: int = 3) -> pd.DataFrame:
        """Smooth noisy sensor readings using rolling average"""
        if len(df) < window:
            return df
            
        # Apply rolling average to fill level
        df['fill_level_percent'] = df['fill_level_percent'].rolling(
            window=window, 
            center=True, 
            min_periods=1
        ).mean()
        
        return df
    
    def normalize_features(self, df: pd.DataFrame, features: List[str]) -> pd.DataFrame:
        """Normalize features using StandardScaler"""
        if df.empty or not features:
            return df
            
        available_features = [f for f in features if f in df.columns]
        
        if available_features:
            df[available_features] = self.scaler.fit_transform(df[available_features])
        
        return df


class FeatureEngineer:
    """Extract and engineer features from bin reading data"""
    
    @staticmethod
    def extract_time_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Extract time-based features from timestamp
        
        Features:
        - hour: Hour of day (0-23)
        - day_of_week: Day of week (0=Monday, 6=Sunday)
        - is_weekend: Boolean for weekend
        - day_of_month: Day of month (1-31)
        - month: Month (1-12)
        - hour_sin, hour_cos: Cyclical encoding of hour
        - day_sin, day_cos: Cyclical encoding of day of week
        """
        if 'timestamp' not in df.columns or df.empty:
            return df
            
        df = df.copy()
        
        # Basic time features
        df['hour'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        df['day_of_month'] = df['timestamp'].dt.day
        df['month'] = df['timestamp'].dt.month
        
        # Cyclical encoding for hour (24-hour cycle)
        df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
        
        # Cyclical encoding for day of week (7-day cycle)
        df['day_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
        df['day_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
        
        return df
    
    @staticmethod
    def extract_lag_features(df: pd.DataFrame, target_col: str = 'fill_level_percent', 
                            lags: List[int] = [1, 2, 3, 6, 12]) -> pd.DataFrame:
        """
        Create lag features for time series
        
        Args:
            df: DataFrame with time series data
            target_col: Column to create lags for
            lags: List of lag periods
        """
        if target_col not in df.columns or df.empty:
            return df
            
        df = df.copy()
        
        for lag in lags:
            df[f'{target_col}_lag_{lag}'] = df[target_col].shift(lag)
        
        # Drop rows with NaN from lagging
        df = df.dropna()
        
        return df
    
    @staticmethod
    def extract_rolling_features(df: pd.DataFrame, target_col: str = 'fill_level_percent',
                                windows: List[int] = [6, 12, 24]) -> pd.DataFrame:
        """
        Create rolling window statistics
        
        Args:
            df: DataFrame with time series data
            target_col: Column to calculate statistics for
            windows: List of window sizes
        """
        if target_col not in df.columns or df.empty:
            return df
            
        df = df.copy()
        
        for window in windows:
            if len(df) >= window:
                df[f'{target_col}_rolling_mean_{window}'] = df[target_col].rolling(
                    window=window, min_periods=1
                ).mean()
                
                df[f'{target_col}_rolling_std_{window}'] = df[target_col].rolling(
                    window=window, min_periods=1
                ).std().fillna(0)
        
        return df
    
    @staticmethod
    def extract_rate_features(df: pd.DataFrame, target_col: str = 'fill_level_percent') -> pd.DataFrame:
        """
        Calculate fill rate (change over time)
        
        Args:
            df: DataFrame with time series data
            target_col: Column to calculate rate for
        """
        if target_col not in df.columns or df.empty or len(df) < 2:
            return df
            
        df = df.copy()
        
        # Calculate time difference in hours
        df['time_diff_hours'] = df['timestamp'].diff().dt.total_seconds() / 3600
        
        # Calculate fill level change
        df['fill_change'] = df[target_col].diff()
        
        # Calculate fill rate (% per hour)
        df['fill_rate'] = df['fill_change'] / df['time_diff_hours']
        df['fill_rate'] = df['fill_rate'].fillna(0).replace([np.inf, -np.inf], 0)
        
        return df
    
    @staticmethod
    def add_bin_metadata(df: pd.DataFrame, bin_info: Dict) -> pd.DataFrame:
        """
        Add bin metadata as features
        
        Args:
            df: DataFrame with readings
            bin_info: Dictionary with bin metadata (type, zone, capacity, etc.)
        """
        df = df.copy()
        
        # Add categorical features
        if 'bin_type' in bin_info:
            # One-hot encode bin type
            bin_type_map = {
                'residential': [1, 0, 0],
                'commercial': [0, 1, 0],
                'public_space': [0, 0, 1]
            }
            bin_type_encoded = bin_type_map.get(bin_info['bin_type'], [0, 0, 0])
            df['bin_type_residential'] = bin_type_encoded[0]
            df['bin_type_commercial'] = bin_type_encoded[1]
            df['bin_type_public'] = bin_type_encoded[2]
        
        # Add numeric features
        if 'capacity_liters' in bin_info:
            df['capacity_liters'] = bin_info['capacity_liters']
        
        if 'ward' in bin_info:
            df['ward'] = bin_info['ward']
        
        # Add zone encoding
        if 'zone' in bin_info:
            zone_map = {'North': 1, 'South': 2, 'East': 3, 'West': 4, 'Central': 5}
            df['zone_encoded'] = zone_map.get(bin_info['zone'], 0)
        
        return df


def create_train_test_split(df: pd.DataFrame, target_col: str = 'fill_level_percent',
                            test_size: float = 0.2, temporal: bool = True) -> Tuple:
    """
    Create train/test split for time series data
    
    Args:
        df: DataFrame with features and target
        target_col: Name of target column
        test_size: Proportion of data for testing
        temporal: If True, use temporal split (last X% as test), else random split
        
    Returns:
        X_train, X_test, y_train, y_test
    """
    if df.empty or target_col not in df.columns:
        return None, None, None, None
    
    # Separate features and target
    feature_cols = [col for col in df.columns if col not in [target_col, 'timestamp']]
    X = df[feature_cols]
    y = df[target_col]
    
    if temporal:
        # Temporal split - use last test_size% as test set
        split_idx = int(len(df) * (1 - test_size))
        X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
        y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    else:
        # Random split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
    
    return X_train, X_test, y_train, y_test
