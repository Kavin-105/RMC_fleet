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

// Enable CORS — MUST be before rate limiting so all responses get CORS headers
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        // Allow all in development
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Rate limiting — after CORS so rate-limited responses still have CORS headers
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    skip: (req) => req.method === 'OPTIONS' // Don't count preflight requests
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many login attempts, please try again after 15 minutes' },
    skip: (req) => req.method === 'OPTIONS'
});
app.use('/api/auth/login', authLimiter);

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

// Root route (friendly message for browsers)
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>RMC Fleet API</title></head>
            <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f8fafc; color: #1e293b;">
                <div style="text-align: center; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                    <h1 style="color: #3b82f6; margin-top: 0;">RMC Fleet Server Active</h1>
                    <p>The backend API is running successfully on Render.</p>
                </div>
            </body>
        </html>
    `);
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

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please stop the other process or use a different port.`);
        process.exit(1);
    } else {
        console.error('Server error:', err.message);
    }
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
