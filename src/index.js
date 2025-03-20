require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const chalk = require('chalk');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const botRoutes = require('./routes/bot');
const guildRoutes = require('./routes/guilds');
const commandRoutes = require('./routes/commands');

const { verifyToken } = require('./middleware/auth');
const connectDB = require('./database/connect');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Connect to database
connectDB();

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS
app.use(cors({
    origin: ['https://developerhubofficial.github.io', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(morgan('dev'));

// Configure Helmet with adjustments for static file serving
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "https:", "data:"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
            connectSrc: ["'self'", "https://developerhubofficial.github.io"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to API routes only
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/bot', botRoutes); // No verifyToken here since some endpoints are public
app.use('/api/guilds', verifyToken, guildRoutes);
app.use('/api/commands', verifyToken, commandRoutes);

// Serve documentation
app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'docs.html'));
});

// Root route - serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Status page route
app.get('/status', (req, res) => {
    res.redirect('/');  // For now, redirect to home page which has status
});

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
    res.json({
        message: 'API Documentation',
        endpoints: [
            { path: '/api/auth', methods: ['POST'], description: 'Authentication endpoints' },
            { path: '/api/users', methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'User management' },
            { path: '/api/bot', methods: ['GET', 'POST'], description: 'Bot status and commands' },
            { path: '/api/guilds', methods: ['GET', 'POST', 'PUT'], description: 'Guild management' },
            { path: '/api/commands', methods: ['GET'], description: 'List available commands' }
        ]
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(chalk.red(`[ERROR] >> ${err.stack}`));
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Pre-flight OPTIONS handler
app.options('*', cors());

app.listen(PORT, () => {
    console.log(chalk.green(`[SUCCESS] >> TacticalAPI running on port ${PORT}`));
    console.log(chalk.blue(`[INFO] >> API Dashboard: http://${HOST}:${PORT}`));
    console.log(chalk.blue(`[INFO] >> API Documentation: http://${HOST}:${PORT}/docs`));
    console.log(chalk.blue(`[INFO] >> API Status Page: http://${HOST}:${PORT}/status`));
});

module.exports = app;