import api from './api';

export const authService = {
    // Login user
    login: async (credentials) => {
       const response = await api.post('/auth/login', credentials);
        if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
            if (response.data.data.driver) {
                localStorage.setItem('driver', JSON.stringify(response.data.data.driver));
            }
        }
        return response.data;
    },

    // Register user
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // Get current user
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('driver');
    },

    // Check if authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Get current user from storage
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Get current driver from storage
    getCurrentDriver: () => {
        const driver = localStorage.getItem('driver');
        return driver ? JSON.parse(driver) : null;
    }
};

export default authService;
