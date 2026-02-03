"""
Fill-Level Forecasting Module
Implements multiple ML models for predicting waste bin fill levels
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import os

try:
    from statsmodels.tsa.arima.model import ARIMA
    ARIMA_AVAILABLE = True
except ImportError:
    ARIMA_AVAILABLE = False

from app.ml.data_preprocessor import DataPreprocessor, FeatureEngineer, create_train_test_split


class FillLevelForecaster:
    """Main forecasting class for bin fill-level prediction"""
    
    def __init__(self, bin_id: str):
        self.bin_id = bin_id
        self.models = {}
        self.preprocessor = DataPreprocessor()
        self.feature_engineer = FeatureEngineer()
        self.feature_columns = []
        self.metrics = {}
        
        # Model directory for persistence
        self.model_dir = os.path.join(os.path.dirname(__file__), 'trained_models')
        os.makedirs(self.model_dir, exist_ok=True)
    
    def prepare_data(self, readings: List, bin_info: Dict) -> pd.DataFrame:
        """
        Prepare data for training/prediction
        
        Args:
            readings: List of BinReading objects
            bin_info: Dictionary with bin metadata
            
        Returns:
            DataFrame with engineered features
        """
        # Clean readings
        df = self.preprocessor.clean_readings(readings)
        
        if df.empty:
            return df
        
        # Extract time features
        df = self.feature_engineer.extract_time_features(df)
        
        # Extract lag features
        df = self.feature_engineer.extract_lag_features(df)
        
        # Extract rolling features
        df = self.feature_engineer.extract_rolling_features(df)
        
        # Extract rate features
        df = self.feature_engineer.extract_rate_features(df)
        
        # Add bin metadata
        df = self.feature_engineer.add_bin_metadata(df, bin_info)
        
        # Drop rows with NaN (from lag/rolling features)
        df = df.dropna()
        
        return df
    
    def train_models(self, readings: List, bin_info: Dict, 
                    model_types: List[str] = ['linear', 'tree', 'forest']) -> Dict:
        """
        Train multiple ML models
        
        Args:
            readings: List of BinReading objects
            bin_info: Dictionary with bin metadata
            model_types: List of model types to train
            
        Returns:
            Dictionary with training metrics
        """
        # Prepare data
        df = self.prepare_data(readings, bin_info)
        
        if df.empty or len(df) < 10:
            return {'error': 'Insufficient data for training'}
        
        # Create train/test split
        X_train, X_test, y_train, y_test = create_train_test_split(
            df, target_col='fill_level_percent', test_size=0.2, temporal=True
        )
        
        if X_train is None or len(X_train) < 5:
            return {'error': 'Insufficient training data'}
        
        # Store feature columns
        self.feature_columns = X_train.columns.tolist()
        
        results = {}
        
        # Train Linear Regression
        if 'linear' in model_types:
            lr_model = LinearRegression()
            lr_model.fit(X_train, y_train)
            self.models['linear'] = lr_model
            
            # Evaluate
            y_pred = lr_model.predict(X_test)
            results['linear'] = self._evaluate_model(y_test, y_pred)
        
        # Train Decision Tree
        if 'tree' in model_types:
            dt_model = DecisionTreeRegressor(
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42
            )
            dt_model.fit(X_train, y_train)
            self.models['tree'] = dt_model
            
            # Evaluate
            y_pred = dt_model.predict(X_test)
            results['tree'] = self._evaluate_model(y_test, y_pred)
        
        # Train Random Forest
        if 'forest' in model_types:
            rf_model = RandomForestRegressor(
                n_estimators=100,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            )
            rf_model.fit(X_train, y_train)
            self.models['forest'] = rf_model
            
            # Evaluate
            y_pred = rf_model.predict(X_test)
            results['forest'] = self._evaluate_model(y_test, y_pred)
        
        # Train ARIMA (time series only)
        if 'arima' in model_types and ARIMA_AVAILABLE:
            try:
                arima_result = self._train_arima(df['fill_level_percent'].values)
                results['arima'] = arima_result
            except Exception as e:
                results['arima'] = {'error': str(e)}
        
        # Store metrics
        self.metrics = results
        
        # Save models
        self._save_models()
        
        return results
    
    def _train_arima(self, time_series: np.ndarray) -> Dict:
        """Train ARIMA model on time series data"""
        if len(time_series) < 20:
            return {'error': 'Insufficient data for ARIMA'}
        
        # Split data
        train_size = int(len(time_series) * 0.8)
        train, test = time_series[:train_size], time_series[train_size:]
        
        # Fit ARIMA model (p=2, d=1, q=2)
        model = ARIMA(train, order=(2, 1, 2))
        fitted_model = model.fit()
        
        # Predict
        predictions = fitted_model.forecast(steps=len(test))
        
        # Evaluate
        metrics = self._evaluate_model(test, predictions)
        
        # Store fitted model
        self.models['arima'] = fitted_model
        
        return metrics
    
    def _evaluate_model(self, y_true: np.ndarray, y_pred: np.ndarray) -> Dict:
        """Calculate evaluation metrics"""
        # Ensure predictions are within valid range
        y_pred = np.clip(y_pred, 0, 100)
        
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        mae = mean_absolute_error(y_true, y_pred)
        r2 = r2_score(y_true, y_pred)
        
        # Calculate accuracy (within 5% tolerance)
        accuracy = np.mean(np.abs(y_true - y_pred) <= 5) * 100
        
        return {
            'rmse': round(rmse, 2),
            'mae': round(mae, 2),
            'r2_score': round(r2, 4),
            'accuracy_5pct': round(accuracy, 2)
        }
    
    def predict(self, readings: List, bin_info: Dict, hours_ahead: int = 24,
                model_type: str = 'forest') -> Dict:
        """
        Make predictions for future fill levels
        
        Args:
            readings: List of BinReading objects
            bin_info: Dictionary with bin metadata
            hours_ahead: Hours to predict ahead
            model_type: Type of model to use
            
        Returns:
            Dictionary with predictions
        """
        # Load model if not in memory
        if model_type not in self.models:
            self._load_models()
        
        if model_type not in self.models:
            return {'error': f'Model {model_type} not trained'}
        
        # Prepare data
        df = self.prepare_data(readings, bin_info)
        
        if df.empty:
            return {'error': 'Insufficient data for prediction'}
        
        # Get current fill level
        current_fill = df['fill_level_percent'].iloc[-1]
        current_time = df['timestamp'].iloc[-1]
        
        # For ARIMA, use different prediction method
        if model_type == 'arima' and ARIMA_AVAILABLE:
            return self._predict_arima(hours_ahead, current_fill, current_time)
        
        # For regression models, create future features
        predictions = []
        last_row = df.iloc[-1:].copy()
        
        for hour in range(1, hours_ahead + 1):
            future_time = current_time + timedelta(hours=hour)
            
            # Create feature row for future time
            future_features = self._create_future_features(
                last_row, future_time, bin_info
            )
            
            # Ensure all required features are present
            for col in self.feature_columns:
                if col not in future_features.columns:
                    future_features[col] = 0
            
            future_features = future_features[self.feature_columns]
            
            # Predict
            model = self.models[model_type]
            predicted_fill = model.predict(future_features)[0]
            predicted_fill = np.clip(predicted_fill, 0, 100)
            
            predictions.append({
                'timestamp': future_time,
                'predicted_fill_level': round(predicted_fill, 2)
            })
            
            # Update last_row for next iteration
            last_row['fill_level_percent'] = predicted_fill
            last_row['timestamp'] = future_time
        
        # Calculate when bin will be full
        hours_until_full = None
        predicted_full_time = None
        
        for i, pred in enumerate(predictions):
            if pred['predicted_fill_level'] >= 100:
                hours_until_full = i + 1
                predicted_full_time = pred['timestamp']
                break
        
        return {
            'bin_id': self.bin_id,
            'model_type': model_type,
            'current_fill_level': round(current_fill, 2),
            'current_time': current_time,
            'predicted_fill_level': predictions[-1]['predicted_fill_level'],
            'prediction_time': predictions[-1]['timestamp'],
            'hours_until_full': hours_until_full,
            'predicted_full_time': predicted_full_time,
            'hourly_predictions': predictions
        }
    
    def _predict_arima(self, hours_ahead: int, current_fill: float, 
                      current_time: datetime) -> Dict:
        """Make predictions using ARIMA model"""
        model = self.models['arima']
        
        # Forecast
        forecast = model.forecast(steps=hours_ahead)
        forecast = np.clip(forecast, 0, 100)
        
        predictions = []
        for i, pred_fill in enumerate(forecast):
            future_time = current_time + timedelta(hours=i+1)
            predictions.append({
                'timestamp': future_time,
                'predicted_fill_level': round(pred_fill, 2)
            })
        
        # Calculate when bin will be full
        hours_until_full = None
        predicted_full_time = None
        
        for i, pred in enumerate(predictions):
            if pred['predicted_fill_level'] >= 100:
                hours_until_full = i + 1
                predicted_full_time = pred['timestamp']
                break
        
        return {
            'bin_id': self.bin_id,
            'model_type': 'arima',
            'current_fill_level': round(current_fill, 2),
            'current_time': current_time,
            'predicted_fill_level': predictions[-1]['predicted_fill_level'],
            'prediction_time': predictions[-1]['timestamp'],
            'hours_until_full': hours_until_full,
            'predicted_full_time': predicted_full_time,
            'hourly_predictions': predictions
        }
    
    def _create_future_features(self, last_row: pd.DataFrame, 
                               future_time: datetime, bin_info: Dict) -> pd.DataFrame:
        """Create feature row for future timestamp"""
        future_df = pd.DataFrame([{'timestamp': future_time}])
        
        # Extract time features
        future_df = self.feature_engineer.extract_time_features(future_df)
        
        # Add bin metadata
        future_df = self.feature_engineer.add_bin_metadata(future_df, bin_info)
        
        # Copy lag and rolling features from last row (approximation)
        for col in last_row.columns:
            if col not in future_df.columns and col != 'timestamp':
                future_df[col] = last_row[col].values[0]
        
        return future_df
    
    def get_feature_importance(self, model_type: str = 'forest') -> Dict:
        """Get feature importance for tree-based models"""
        if model_type not in ['tree', 'forest']:
            return {'error': 'Feature importance only available for tree-based models'}
        
        if model_type not in self.models:
            self._load_models()
        
        if model_type not in self.models:
            return {'error': f'Model {model_type} not trained'}
        
        model = self.models[model_type]
        
        if not hasattr(model, 'feature_importances_'):
            return {'error': 'Model does not have feature importances'}
        
        importances = model.feature_importances_
        
        # Create feature importance dictionary
        feature_importance = []
        for feature, importance in zip(self.feature_columns, importances):
            feature_importance.append({
                'feature': feature,
                'importance': round(importance, 4)
            })
        
        # Sort by importance
        feature_importance = sorted(
            feature_importance, 
            key=lambda x: x['importance'], 
            reverse=True
        )
        
        return {
            'model_type': model_type,
            'features': feature_importance[:15]  # Top 15 features
        }
    
    def _save_models(self):
        """Save trained models to disk"""
        for model_type, model in self.models.items():
            if model_type != 'arima':  # ARIMA models are harder to serialize
                model_path = os.path.join(
                    self.model_dir, 
                    f'{self.bin_id}_{model_type}.joblib'
                )
                joblib.dump(model, model_path)
        
        # Save feature columns
        feature_path = os.path.join(
            self.model_dir, 
            f'{self.bin_id}_features.joblib'
        )
        joblib.dump(self.feature_columns, feature_path)
    
    def _load_models(self):
        """Load trained models from disk"""
        for model_type in ['linear', 'tree', 'forest']:
            model_path = os.path.join(
                self.model_dir, 
                f'{self.bin_id}_{model_type}.joblib'
            )
            if os.path.exists(model_path):
                self.models[model_type] = joblib.load(model_path)
        
        # Load feature columns
        feature_path = os.path.join(
            self.model_dir, 
            f'{self.bin_id}_features.joblib'
        )
        if os.path.exists(feature_path):
            self.feature_columns = joblib.load(feature_path)


class ModelComparator:
    """Compare performance of different models"""
    
    @staticmethod
    def compare_models(metrics: Dict) -> Dict:
        """
        Compare models and recommend best one
        
        Args:
            metrics: Dictionary with metrics for each model
            
        Returns:
            Comparison results with recommendation
        """
        if not metrics:
            return {'error': 'No metrics to compare'}
        
        # Find best model for each metric
        best_rmse = min(metrics.items(), key=lambda x: x[1].get('rmse', float('inf')))
        best_mae = min(metrics.items(), key=lambda x: x[1].get('mae', float('inf')))
        best_r2 = max(metrics.items(), key=lambda x: x[1].get('r2_score', float('-inf')))
        
        # Overall recommendation (based on RMSE and R²)
        scores = {}
        for model_type, model_metrics in metrics.items():
            if 'error' in model_metrics:
                continue
            # Lower RMSE is better, higher R² is better
            score = (1 / (model_metrics.get('rmse', 100) + 1)) + model_metrics.get('r2_score', 0)
            scores[model_type] = score
        
        recommended = max(scores.items(), key=lambda x: x[1])[0] if scores else None
        
        return {
            'best_rmse': {'model': best_rmse[0], 'value': best_rmse[1].get('rmse')},
            'best_mae': {'model': best_mae[0], 'value': best_mae[1].get('mae')},
            'best_r2': {'model': best_r2[0], 'value': best_r2[1].get('r2_score')},
            'recommended_model': recommended,
            'all_metrics': metrics
        }
