import api from './api';

export const predictionsService = {
    // Get fill level predictions
    getFillLevelPredictions: async () => {
        const response = await api.get('/api/predictions/fill-levels');
        return response.data;
    },

    // Get route optimization
    getRouteOptimization: async (vehicleId) => {
        const response = await api.get(`/api/predictions/route-optimization/${vehicleId}`);
        return response.data;
    },
};
