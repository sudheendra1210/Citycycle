import api from './api';

export const analyticsService = {
    // Get dashboard statistics
    getDashboardStats: async (areaName) => {
        const url = areaName ? `/api/analytics/dashboard?area_name=${encodeURIComponent(areaName)}` : '/api/analytics/dashboard';
        const response = await api.get(url);
        return response.data;
    },

    // Get fill level trends
    getFillLevelTrends: async (areaName, days = 7) => {
        const areaParam = areaName ? `&area_name=${encodeURIComponent(areaName)}` : '';
        const response = await api.get(`/api/analytics/trends/fill-levels?days=${days}${areaParam}`);
        return response.data;
    },

    // Get bins for map visualization
    getBinsForMap: async (areaName) => {
        const url = areaName ? `/api/analytics/map/bins?area_name=${encodeURIComponent(areaName)}` : '/api/analytics/map/bins';
        const response = await api.get(url);
        return response.data;
    },

    // Get critical alerts
    getAlerts: async (areaName) => {
        const url = areaName ? `/api/analytics/alerts?area_name=${encodeURIComponent(areaName)}` : '/api/analytics/alerts';
        const response = await api.get(url);
        return response.data;
    },

    // Get area analytics
    getAreaAnalytics: async (lat, lng, radius = 5.0) => {
        const response = await api.get('/api/analytics/area', {
            params: { lat, lng, radius_km: radius }
        });
        return response.data;
    }
};
