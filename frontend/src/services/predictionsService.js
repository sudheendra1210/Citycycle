import api from './api';

export const predictionsService = {
    // Get fill-level predictions for all bins above a threshold
    getBinPredictions: async (areaName, threshold = 70) => {
        const areaParam = areaName ? `&area_name=${encodeURIComponent(areaName)}` : '';
        const response = await api.get(`/api/predictions/all-bins?threshold=${threshold}${areaParam}`);
        return response.data;
    },

    // Get predictions for a batch of bins
    getBatchPredictions: async (threshold = 70, hoursAhead = 24) => {
        const response = await api.get(`/api/forecasting/predictions-batch`, {
            params: { threshold, hours_ahead: hoursAhead }
        });
        return response.data;
    },

    optimizeRoute: async (vehicleId, threshold = 80) => {
        const response = await api.post('/api/predictions/route-optimization', {
            vehicle_id: vehicleId,
            threshold: threshold
        });
        return response.data;
    },

    // Get prediction for a specific bin
    getBinPrediction: async (binId, hoursAhead = 24) => {
        const response = await api.post('/api/predictions/bin-fill', {
            bin_id: binId,
            hours_ahead: hoursAhead
        });
        return response.data;
    }
};

export default predictionsService;
