import api from './api';

export const checklistService = {
    // Get all checklists
    getAll: async (params = {}) => {
        const response = await api.get('/checklists', { params });
        return response.data;
    },

    // Get today's checklist
    getToday: async (vehicleId, driverId) => {
        const response = await api.get('/checklists/today', {
            params: { vehicleId, driverId }
        });
        return response.data;
    },

    // Get single checklist
    getById: async (id) => {
        const response = await api.get(`/checklists/${id}`);
        return response.data;
    },

    // Create/submit checklist
    create: async (checklistData) => {
        const response = await api.post('/checklists', checklistData);
        return response.data;
    },

    // Update checklist
    update: async (id, checklistData) => {
        const response = await api.put(`/checklists/${id}`, checklistData);
        return response.data;
    },

    // Delete checklist
    delete: async (id) => {
        const response = await api.delete(`/checklists/${id}`);
        return response.data;
    }
};

export default checklistService;
