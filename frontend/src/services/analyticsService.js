import api from './api';

export const analyticsService = {
    // Get dashboard statistics
    getDashboardStats: async () => {
        const response = await api.get('/api/analytics/dashboard');
        return response.data;
    },

    // Get fill level trends
    getFillLevelTrends: async (days = 7) => {
        const response = await api.get(`/api/analytics/trends/fill-levels?days=${days}`);
        return response.data;
    },

    // Get bins for map visualization
    getBinsForMap: async () => {
        const response = await api.get('/api/analytics/map/bins');
        return response.data;
    },
};
