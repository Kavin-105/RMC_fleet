import api from './api';

export const notificationService = {
    // Get all notifications
    getAll: async (params = {}) => {
        const response = await api.get('/notifications', { params });
        return response.data;
    },

    // Get unread count
    getUnreadCount: async () => {
        const response = await api.get('/notifications/unread-count');
        return response.data;
    },

    // Mark single notification as read
    markAsRead: async (id) => {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        const response = await api.put('/notifications/read-all');
        return response.data;
    },

    // Delete a notification
    delete: async (id) => {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    },

    // Clear all read notifications
    clearRead: async () => {
        const response = await api.delete('/notifications/clear-read');
        return response.data;
    }
};

export default notificationService;
