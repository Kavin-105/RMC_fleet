import api from './api';

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

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

        const requestConfig = {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            timeout: 180000 // 180 seconds for OCR cold starts
        };

        try {
            const response = await api.post('/drivers/extract-license', formData, requestConfig);
            return response.data;
        } catch (error) {
            const shouldRetry = !error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error'));

            if (!shouldRetry) {
                throw error;
            }

            await sleep(1500);
            const retryResponse = await api.post('/drivers/extract-license', formData, requestConfig);
            return retryResponse.data;
        }
    }
};

export default driverService;
