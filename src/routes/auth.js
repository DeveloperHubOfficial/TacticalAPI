const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../database/models/User');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with that email or username' 
      });
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password
    });
    
    // Generate API key
    const apiKey = user.generateApiKey();
    
    await user.save();
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isBotOwner: user.isBotOwner
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isBotOwner: user.isBotOwner,
        apiKey
      },
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error registering user',
      error: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Update last login
    user.lastLogin = Date.now();
    await user.save();
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isBotOwner: user.isBotOwner
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isBotOwner: user.isBotOwner,
        apiKey: user.apiKey
      },
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error logging in',
      error: error.message
    });
  }
});

// Get API key (requires authentication)
router.get('/api-key', async (req, res) => {
  try {
    // This route will be protected by verifyToken middleware
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      apiKey: user.apiKey
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error getting API key',
      error: error.message
    });
  }
});

// Regenerate API key (requires authentication)
router.post('/api-key/regenerate', async (req, res) => {
  try {
    // This route will be protected by verifyToken middleware
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const apiKey = user.generateApiKey();
    await user.save();
    
    res.json({
      message: 'API key regenerated successfully',
      apiKey
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error regenerating API key',
      error: error.message
    });
  }
});

module.exports = router;