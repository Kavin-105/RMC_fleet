import api from './api';

export const expenseService = {
    // Get all expenses
    getAll: async (params = {}) => {
        const response = await api.get('/expenses', { params });
        return response.data;
    },

    // Get expense summary
    getSummary: async () => {
        const response = await api.get('/expenses/summary');
        return response.data;
    },

    // Get single expense
    getById: async (id) => {
        const response = await api.get(`/expenses/${id}`);
        return response.data;
    },

    // Create expense
    create: async (expenseData) => {
        const response = await api.post('/expenses', expenseData, {
            headers: expenseData instanceof FormData ? {
                'Content-Type': 'multipart/form-data'
            } : {}
        });
        return response.data;
    },

    // Update expense
    update: async (id, expenseData) => {
        const response = await api.put(`/expenses/${id}`, expenseData);
        return response.data;
    },

    // Approve expense
    approve: async (id) => {
        const response = await api.put(`/expenses/${id}/approve`);
        return response.data;
    },

    // Reject expense
    reject: async (id, reason = null) => {
        const response = await api.put(`/expenses/${id}/reject`, { reason });
        return response.data;
    },

    // Delete expense
    delete: async (id) => {
        const response = await api.delete(`/expenses/${id}`);
        return response.data;
    },

    // Get bill photo as blob
    getBillPhoto: async (id) => {
        const response = await api.get(`/expenses/${id}/bill`, {
            responseType: 'arraybuffer'
        });
        return response.data;
    }
};

export default expenseService;
