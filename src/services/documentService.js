import api from './api';

export const documentService = {
    // Get all documents
    getAll: async (params = {}) => {
        const response = await api.get('/documents', { params });
        return response.data;
    },

    // Get expiring documents
    getExpiring: async () => {
        const response = await api.get('/documents/expiring');
        return response.data;
    },

    // Get single document
    getById: async (id) => {
        const response = await api.get(`/documents/${id}`);
        return response.data;
    },

    // Create document
    create: async (documentData) => {
        const response = await api.post('/documents', documentData);
        return response.data;
    },

    // Update document
    update: async (id, documentData) => {
        const response = await api.put(`/documents/${id}`, documentData);
        return response.data;
    },

    // Delete document
    delete: async (id) => {
        const response = await api.delete(`/documents/${id}`);
        return response.data;
    }
};

export default documentService;
