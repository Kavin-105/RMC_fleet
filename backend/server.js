const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const rateLimit = require('express-rate-limit');

// Load env vars (FIXED)
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Connect to database
connectDB();


const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many login attempts, please try again after 15 minutes' }
});
app.use('/api/auth/login', authLimiter);

// Enable CORS
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',');
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow in development
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route files
const auth = require('./routes/auth');
const vehicles = require('./routes/vehicles');
const drivers = require('./routes/drivers');
const documents = require('./routes/documents');
const expenses = require('./routes/expenses');
const checklists = require('./routes/checklists');
const notifications = require('./routes/notifications');

// Cron jobs
const { initCronJobs } = require('./jobs/expiryChecker');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/vehicles', vehicles);
app.use('/api/drivers', drivers);
app.use('/api/documents', documents);
app.use('/api/expenses', expenses);
app.use('/api/checklists', checklists);
app.use('/api/notifications', notifications);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'RMC Fleet API is running' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server Error'
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Initialize cron jobs for document expiry notifications
    initCronJobs();
});

// Keep connections alive
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Handle unhandled promise rejections (don't crash, just log)
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
});
