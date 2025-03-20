const mongoose = require('mongoose');
const chalk = require('chalk');

function logMessage(type, message) {
    const colourMap = {
        info: chalk.blue,
        success: chalk.green,
        error: chalk.red,
        warning: chalk.yellow
    };
    console.log(colourMap[type](message));
}

async function connectDB() {
    mongoose.set('strictQuery', false);

    if (!process.env.MONGO_TOKEN) {
        const errorMsg = '[ERROR] >> MongoDB >> MONGO_TOKEN is not defined!';
        logMessage('error', errorMsg);
        throw new Error('MONGO_TOKEN environment variable is missing or empty');
    }

    // Validate MongoDB connection string format
    if (!process.env.MONGO_TOKEN.startsWith('mongodb://') && !process.env.MONGO_TOKEN.startsWith('mongodb+srv://')) {
        const errorMsg = '[ERROR] >> MongoDB >> Invalid connection string format!';
        logMessage('error', errorMsg);
        throw new Error('Invalid MongoDB connection string format');
    }

    try {
        logMessage('info', 'API Database >> MongoDB is connecting...');
        
        await mongoose.connect(process.env.MONGO_TOKEN, {
            serverSelectionTimeoutMS: 10000, // Timeout after 10s
            connectTimeoutMS: 10000,         // Timeout after 10s
            socketTimeoutMS: 45000,          // Close sockets after 45s of inactivity
            maxPoolSize: 10,                 // Maximum number of connections in the pool
            minPoolSize: 1,                  // Minimum number of connections in the pool
            heartbeatFrequencyMS: 10000,     // Check server health every 10 seconds
        });
        logMessage('success', 'API Database >> MongoDB is ready.');
    } catch (err) {
        const errorMsg = `[ERROR] >> MongoDB >> Failed to connect to MongoDB! >> Error: ${err}`;
        logMessage('error', errorMsg);
        
        // Provide more detailed troubleshooting based on error type
        let troubleshootingMsg = errorMsg;
        
        if (err.name === 'MongoServerSelectionError') {
            troubleshootingMsg = `${errorMsg}\n[HELP] >> This might be due to network issues, incorrect hostname, or the MongoDB server is down.`;
        } else if (err.name === 'MongoParseError') {
            troubleshootingMsg = `${errorMsg}\n[HELP] >> Your connection string appears to be malformed. Please check the format.`;
        } else if (err.message && err.message.includes('authentication failed')) {
            troubleshootingMsg = `${errorMsg}\n[HELP] >> Authentication failed. Please check your username and password in the connection string.`;
        } else if (err.message && err.message.includes('ECONNREFUSED')) {
            troubleshootingMsg = `${errorMsg}\n[HELP] >> Connection refused. The database server might be down or not accepting connections.`;
        }
        
        // Throw error instead of calling process.exit to allow for better error handling
        throw new Error(`Failed to connect to MongoDB: ${err.message}`);
    }

    mongoose.connection.on("error", async (err) => {
        const errorMsg = `[ERROR] >> API Database >> MongoDB connection error! >> Error: ${err}`;
        logMessage('error', errorMsg);
        
        // Only exit on critical errors, not transient ones
        if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
            logMessage('warning', 'Attempting to reconnect to MongoDB...');
            // The driver will attempt to reconnect automatically
        } else if (err.name === 'MongoParseError' || (err.name === 'MongoError' && err.code === 18)) {
            // Authentication failure or critical error
            logMessage('error', 'Critical MongoDB error in API, exiting...');
            throw new Error(`Critical MongoDB error: ${err.message}`);
        }
    });

    // Handle disconnection
    mongoose.connection.on("disconnected", async () => {
        logMessage('warning', '[WARNING] >> API Database >> Disconnected from MongoDB');
    });

    // Handle reconnection
    mongoose.connection.on("reconnected", async () => {
        logMessage('success', '[SUCCESS] >> API Database >> Reconnected to MongoDB');
    });
    
    // Add a periodic connection check
    setInterval(() => {
        if (mongoose.connection.readyState !== 1) {
            logMessage('warning', '[WARNING] >> API Database >> Connection is not ready. Current state: ' + 
                       ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]);
        }
    }, 30000); // Check every 30 seconds
}

module.exports = connectDB;