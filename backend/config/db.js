const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 60000,
            heartbeatFrequencyMS: 30000,
            maxPoolSize: 5,
            minPoolSize: 1,
            retryWrites: true,
            retryReads: true,
            connectTimeoutMS: 30000,
            family: 4
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Mongoose will auto-reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected successfully.');
        });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Retry connection after 5 seconds instead of crashing
        console.log('Retrying MongoDB connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB;
