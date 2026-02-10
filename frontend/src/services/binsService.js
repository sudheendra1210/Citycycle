import api from './api';

export const binsService = {
    // Get all bins
    getAllBins: async (areaName) => {
        const url = areaName ? `/api/bins/?area_name=${encodeURIComponent(areaName)}` : '/api/bins/';
        const response = await api.get(url);
        return response.data;
    },

    // Get bin by ID
    getBinById: async (binId) => {
        const response = await api.get(`/ api / bins / ${binId} `);
        return response.data;
    },

    // Get bin readings
    getBinReadings: async (binId, limit = 100) => {
        const response = await api.get(`/ api / bins / ${binId}/readings?limit=${limit}`);
        return response.data;
    },

    // Create new bin
    createBin: async (binData) => {
        const response = await api.post('/api/bins', binData);
        return response.data;
    },

    // Update bin
    updateBin: async (binId, binData) => {
        const response = await api.put(`/api/bins/${binId}`, binData);
        return response.data;
    },

    // Delete bin
    deleteBin: async (binId) => {
        const response = await api.delete(`/api/bins/${binId}`);
        return response.data;
    },

    // Add bin reading
    addBinReading: async (readingData) => {
        const response = await api.post('/api/bins/readings', readingData);
        return response.data;
    },

    // Get nearby bins
    getNearbyBins: async (lat, lng, radius = 5.0) => {
        const response = await api.get('/api/bins/nearby', {
            params: { lat, lng, radius_km: radius }
        });
        return response.data;
    }
};
