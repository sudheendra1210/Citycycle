/**
 * Forecasting Service
 * API calls for ML-based fill-level prediction
 */

import api from './api';

const FORECASTING_BASE = '/api/forecasting';

/**
 * Train ML models for specified bins
 */
export const trainModels = async (binIds = null, modelTypes = ['linear', 'tree', 'forest']) => {
    try {
        const params = new URLSearchParams();

        if (binIds && binIds.length > 0) {
            binIds.forEach(id => params.append('bin_ids', id));
        }

        modelTypes.forEach(type => params.append('model_types', type));

        const response = await api.post(`${FORECASTING_BASE}/train?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error training models:', error);
        throw error;
    }
};

/**
 * Get fill-level predictions for a specific bin
 */
export const getPrediction = async (binId, hoursAhead = 24, modelType = 'forest') => {
    try {
        const response = await api.get(`${FORECASTING_BASE}/predict/${binId}`, {
            params: { hours_ahead: hoursAhead, model_type: modelType }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting prediction:', error);
        throw error;
    }
};

/**
 * Compare performance of all models for a bin
 */
export const compareModels = async (binId) => {
    try {
        const response = await api.get(`${FORECASTING_BASE}/compare-models/${binId}`);
        return response.data;
    } catch (error) {
        console.error('Error comparing models:', error);
        throw error;
    }
};

/**
 * Get feature importance for tree-based models
 */
export const getFeatureImportance = async (binId, modelType = 'forest') => {
    try {
        const response = await api.get(`${FORECASTING_BASE}/feature-importance/${binId}`, {
            params: { model_type: modelType }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting feature importance:', error);
        throw error;
    }
};

/**
 * Get predictions for multiple bins above threshold
 */
export const getBatchPredictions = async (threshold = 70, hoursAhead = 24, modelType = 'forest', limit = 20) => {
    try {
        const response = await api.get(`${FORECASTING_BASE}/predictions-batch`, {
            params: {
                threshold,
                hours_ahead: hoursAhead,
                model_type: modelType,
                limit
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting batch predictions:', error);
        throw error;
    }
};

/**
 * Get historical data with predictions overlay
 */
export const getHistoricalVsPredicted = async (binId, daysBack = 7, hoursAhead = 24, modelType = 'forest') => {
    try {
        const response = await api.get(`${FORECASTING_BASE}/historical-vs-predicted/${binId}`, {
            params: {
                days_back: daysBack,
                hours_ahead: hoursAhead,
                model_type: modelType
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting historical vs predicted:', error);
        throw error;
    }
};

export default {
    trainModels,
    getPrediction,
    compareModels,
    getFeatureImportance,
    getBatchPredictions,
    getHistoricalVsPredicted
};
