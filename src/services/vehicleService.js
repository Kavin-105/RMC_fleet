import api from './api';

export const vehicleService = {
    // Get all vehicles
    getAll: async (params = {}) => {
        const response = await api.get('/vehicles', { params });
        return response.data;
    },

    // Get single vehicle
    getById: async (id) => {
        const response = await api.get(`/vehicles/${id}`);
        return response.data;
    },

    // Create vehicle
    create: async (vehicleData) => {
        const response = await api.post('/vehicles', vehicleData);
        return response.data;
    },

    // Update vehicle
    update: async (id, vehicleData) => {
        const response = await api.put(`/vehicles/${id}`, vehicleData);
        return response.data;
    },

    // Delete vehicle
    delete: async (id) => {
        const response = await api.delete(`/vehicles/${id}`);
        return response.data;
    },

    // Assign driver to vehicle
    assignDriver: async (vehicleId, driverId) => {
        const response = await api.put(`/vehicles/${vehicleId}/assign-driver`, { driverId });
        return response.data;
    },

    // Get vehicle details with expenses, documents, checklists
    getDetails: async (id) => {
        const response = await api.get(`/vehicles/${id}/details`);
        return response.data;
    }
};

export default vehicleService;
