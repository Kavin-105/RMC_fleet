const Driver = require('../models/Driver');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const axios = require('axios');
const FormData = require('form-data');

// ML Service URL for license OCR - use 127.0.0.1 to avoid IPv6 issues
const ML_SERVICE_URL = (process.env.ML_SERVICE_URL || 'http://127.0.0.1:5000');

// @desc    Extract license number from image/PDF using ML OCR
// @route   POST /api/drivers/extract-license
exports.extractLicense = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a license image or PDF'
            });
        }

        // Create form data to send to ML service
        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        // Call ML service for OCR extraction
        const response = await axios.post(
            `${ML_SERVICE_URL}/extract-license`,
            formData,
            {
                headers: {
                    ...formData.getHeaders()
                },
                timeout: 120000 // 120 second timeout for OCR processing (first run may download models)
            }
        );

        if (response.data.success) {
            res.status(200).json({
                success: true,
                data: {
                    driverName: response.data.driverName,
                    licenseNumber: response.data.licenseNumber,
                    expiryDate: response.data.expiryDate
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: response.data.error || 'Could not extract license number',
                rawText: response.data.rawText
            });
        }
    } catch (err) {
        console.error('License extraction error:', err.message);
        
        if (['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'ECONNRESET'].includes(err.code)) {
            return res.status(503).json({
                success: false,
                message: `ML service is not available at ${ML_SERVICE_URL}. Set ML_SERVICE_URL correctly in backend environment variables.`
            });
        }

        if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
            return res.status(504).json({
                success: false,
                message: `ML service timed out at ${ML_SERVICE_URL}. Please try again.`
            });
        }
        
        res.status(500).json({
            success: false,
            message: err.response?.data?.error || err.message
        });
    }
};

// @desc    Get all drivers
// @route   GET /api/drivers
exports.getDrivers = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = { owner: req.user.id };

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } }
            ];
        }

        const drivers = await Driver.find(query)
            .populate('assignedVehicles', 'vehicleNumber model')
            .populate('user', '+password +plainTextPassword')
            .sort({ createdAt: -1 });

        // Add password to each driver for viewing/editing
        const driversWithPassword = drivers.map(driver => {
            const driverObj = driver.toObject();
            if (driver.user && driver.user.plainTextPassword) {
                driverObj.password = driver.user.plainTextPassword;
            }
            return driverObj;
        });

        res.status(200).json({
            success: true,
            count: driversWithPassword.length,
            data: driversWithPassword
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get single driver
// @route   GET /api/drivers/:id
exports.getDriver = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id)
            .populate('assignedVehicles', 'vehicleNumber model status')
            .populate('user', '+password +plainTextPassword');

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Add password to driver object for viewing/editing
        const driverObj = driver.toObject();
        if (driver.user && driver.user.plainTextPassword) {
            driverObj.password = driver.user.plainTextPassword;
        }

        res.status(200).json({
            success: true,
            data: driverObj
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Create driver
// @route   POST /api/drivers
exports.createDriver = async (req, res) => {
    try {
        req.body.owner = req.user.id;

        // Create user account for driver
        if (!req.body.password || req.body.password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password is required and must be at least 6 characters'
            });
        }
        const user = await User.create({
            name: req.body.name,
            mobile: req.body.mobile,
            password: req.body.password,
            role: 'driver'
        });

        req.body.user = user._id;

        const driver = await Driver.create(req.body);

        res.status(201).json({
            success: true,
            data: driver
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
exports.updateDriver = async (req, res) => {
    try {
        let driver = await Driver.findById(req.params.id);

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        if (driver.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this driver'
            });
        }

        // Update driver information
        driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('assignedVehicles', 'vehicleNumber model');

        // Update user password if provided
        if (req.body.password && driver.user) {
            const user = await User.findById(driver.user);
            if (user) {
                user.password = req.body.password;
                user.plainTextPassword = req.body.password; // Store plain text
                await user.save();
            }
        }

        // Update user name and mobile if changed
        if (driver.user && (req.body.name || req.body.mobile)) {
            const updateData = {};
            if (req.body.name) updateData.name = req.body.name;
            if (req.body.mobile) updateData.mobile = req.body.mobile;
            await User.findByIdAndUpdate(driver.user, updateData);
        }

        res.status(200).json({
            success: true,
            data: driver
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
exports.deleteDriver = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        if (driver.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this driver'
            });
        }

        // Remove driver reference from all assigned vehicles
        await Vehicle.updateMany(
            { assignedDriver: driver._id },
            { $set: { assignedDriver: null } }
        );

        // Delete associated user account
        if (driver.user) {
            await User.findByIdAndDelete(driver.user);
        }

        await driver.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Assign vehicle to driver
// @route   PUT /api/drivers/:id/assign-vehicle
exports.assignVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.body;

        let driver = await Driver.findById(req.params.id);

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        const vehicle = await Vehicle.findById(vehicleId);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // If vehicle was assigned to another driver, remove it from their list
        if (vehicle.assignedDriver && vehicle.assignedDriver.toString() !== driver._id.toString()) {
            await Driver.findByIdAndUpdate(
                vehicle.assignedDriver,
                { $pull: { assignedVehicles: vehicleId } }
            );
        }

        // Update vehicle to be assigned to this driver
        vehicle.assignedDriver = driver._id;
        await vehicle.save();

        // Add vehicle to driver's assignedVehicles (if not already there)
        if (!driver.assignedVehicles.includes(vehicleId)) {
            driver.assignedVehicles.push(vehicleId);
            await driver.save();
        }

        driver = await Driver.findById(req.params.id)
            .populate('assignedVehicles', 'vehicleNumber model');

        res.status(200).json({
            success: true,
            data: driver
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};
