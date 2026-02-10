import api from './api';

export const complaintsService = {
    // Get all complaints
    getAllComplaints: async (areaName) => {
        const url = areaName ? `/api/complaints?area_name=${encodeURIComponent(areaName)}` : '/api/complaints';
        const response = await api.get(url);
        return response.data;
    },

    // Get complaint by ID
    getComplaintById: async (complaintId) => {
        const response = await api.get(`/api/complaints/${complaintId}`);
        return response.data;
    },

    // Create new complaint
    createComplaint: async (complaintData) => {
        const response = await api.post('/api/complaints', complaintData);
        return response.data;
    },

    // Update complaint status
    updateComplaintStatus: async (complaintId, status) => {
        const response = await api.patch(`/api/complaints/${complaintId}/status`, { status });
        return response.data;
    },

    // Get complaints by status
    getComplaintsByStatus: async (status) => {
        const response = await api.get(`/api/complaints?status=${status}`);
        return response.data;
    },
};
