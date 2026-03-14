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
        const response = await api.post('/documents', documentData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Update document
    update: async (id, documentData) => {
        const response = await api.put(`/documents/${id}`, documentData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Delete document
    delete: async (id) => {
        const response = await api.delete(`/documents/${id}`);
        return response.data;
    },

    // Get document file as blob
    getFile: async (id) => {
        const response = await api.get(`/documents/${id}/file`, {
            responseType: 'arraybuffer'
        });
        return response.data;
    }
};

export default documentService;
