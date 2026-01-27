const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS - allow all origins in development
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Route files
const auth = require('./routes/auth');
const vehicles = require('./routes/vehicles');
const drivers = require('./routes/drivers');
const documents = require('./routes/documents');
const expenses = require('./routes/expenses');
const checklists = require('./routes/checklists');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/vehicles', vehicles);
app.use('/api/drivers', drivers);
app.use('/api/documents', documents);
app.use('/api/expenses', expenses);
app.use('/api/checklists', checklists);

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
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
