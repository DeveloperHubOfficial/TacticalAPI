require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const chalk = require('chalk');

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

// Connect to database
connectDB();

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to all routes
app.use(apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/bot', verifyToken, botRoutes);
app.use('/api/guilds', verifyToken, guildRoutes);
app.use('/api/commands', verifyToken, commandRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the TacticalAPI for the Tactical AI Bot',
    version: '1.0.0',
    status: 'online',
    documentation: '/api/docs'
  });
});

// Documentation route
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

app.listen(PORT, () => {
  console.log(chalk.green(`[SUCCESS] >> TacticalAPI running on port ${PORT}`));
});

module.exports = app;