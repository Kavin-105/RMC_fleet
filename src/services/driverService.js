import api from './api';

export const driverService = {
    // Get all drivers
    getAll: async (params = {}) => {
        const response = await api.get('/drivers', { params });
        return response.data;
    },

    // Get single driver
    getById: async (id) => {
        const response = await api.get(`/drivers/${id}`);
        return response.data;
    },

    // Create driver
    create: async (driverData) => {
        const response = await api.post('/drivers', driverData);
        return response.data;
    },

    // Update driver
    update: async (id, driverData) => {
        const response = await api.put(`/drivers/${id}`, driverData);
        return response.data;
    },

    // Delete driver
    delete: async (id) => {
        const response = await api.delete(`/drivers/${id}`);
        return response.data;
    },

    // Assign vehicle to driver
    assignVehicle: async (driverId, vehicleId) => {
        const response = await api.put(`/drivers/${driverId}/assign-vehicle`, { vehicleId });
        return response.data;
    },

    // Extract license number from image/PDF using ML OCR
    extractLicense: async (file) => {
        const formData = new FormData();
        formData.append('licenseFile', file);
        
        const response = await api.post('/drivers/extract-license', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            timeout: 120000 // 120 second timeout for OCR processing
        });
        return response.data;
    }
};

export default driverService;
