import api from './api';

export const vehiclesService = {
    // Get all vehicles
    getAllVehicles: async () => {
        const response = await api.get('/api/vehicles');
        return response.data;
    },

    // Get vehicle by ID
    getVehicleById: async (vehicleId) => {
        const response = await api.get(`/api/vehicles/${vehicleId}`);
        return response.data;
    },

    // Get vehicle GPS logs
    getVehicleGPSLogs: async (vehicleId, limit = 100) => {
        const response = await api.get(`/api/vehicles/${vehicleId}/gps?limit=${limit}`);
        return response.data;
    },
};
