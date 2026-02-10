const User = require('../models/User');
const Driver = require('../models/Driver');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, mobile, password, role } = req.body;
        const user = await User.create({
            name,
            email,
            mobile,
            password,
            role
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, mobile, password } = req.body;

        // Validate email/mobile and password
        if ((!email && !mobile) || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email/mobile and password'
            });
        }

        // Check for user
        let user;
        if (email) {
            user = await User.findOne({ email }).select('+password');
        } else {
            user = await User.findOne({ mobile }).select('+password');
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // If driver, get driver info
        let driverInfo = null;
        if (user.role === 'driver') {
            driverInfo = await Driver.findOne({ user: user._id }).populate('assignedVehicles');
        }

        sendTokenResponse(user, 200, res, driverInfo);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        let driverInfo = null;
        if (user.role === 'driver') {
            driverInfo = await Driver.findOne({ user: user._id }).populate('assignedVehicles');
        }

        res.status(200).json({
            success: true,
            data: {
                user,
                driver: driverInfo
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Logout user
// @route   GET /api/auth/logout
exports.logout = async (req, res) => {
    res.status(200).json({
        success: true,
        data: {}
    });
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, driverInfo = null) => {
    const token = user.getSignedJwtToken();

    res.status(statusCode).json({
        success: true,
        token,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role
            },
            driver: driverInfo
        }
    });
};
