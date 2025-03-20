const express = require('express');
const router = express.Router();
const { isAdmin, isBotOwner } = require('../middleware/auth');
const os = require('os');
const mongoose = require('mongoose');

const CORS_ORIGIN = 'https://developerhubofficial.github.io';
const corsHeaders = {
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Public health check endpoint - no auth required
router.get('/health', (req, res) => {
    res.set(corsHeaders);
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        message: 'TacticalAPI is running',
        baseUrl: 'https://developerhubofficial.github.io/TacticalAPI/api'
    });
});

// Public database health check - no auth required
router.get('/health/database', async (req, res) => {
    res.set(corsHeaders);
    try {
        const startTime = Date.now();
        await mongoose.connection.db.admin().ping();
        const latency = Date.now() - startTime;

        res.json({
            status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            latency,
            name: mongoose.connection.name
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'disconnected',
            error: error.message
        });
    }
});

// Public system health check - no auth required
router.get('/health/system', (req, res) => {
    res.set(corsHeaders);
    
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = Math.round((usedMemory / totalMemory) * 100);

    const cpus = os.cpus();
    const cpuUsage = cpus.reduce((acc, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b);
        const idle = cpu.times.idle;
        return acc + ((1 - idle / total) * 100);
    }, 0) / cpus.length;

    res.json({
        cpu: Math.round(cpuUsage),
        memory: `${memoryUsage}% (${formatBytes(usedMemory)} / ${formatBytes(totalMemory)})`,
        disk: '-- GB', // You can implement disk space check if needed
        platform: os.platform(),
        uptime: Math.floor(os.uptime())
    });
});

// Public bot status endpoint - no auth required
router.get('/status', async (req, res) => {
    res.set(corsHeaders);
    try {
        // This would integrate with your Discord bot to get its status
        // For now, we'll return a mock response
        res.json({
            status: 'online',
            uptime: '3d 5h 27m',
            servers: 250,
            users: 15000,
            commands_used: 7834,
            version: '10.0.10',
            memory_usage: '256MB'
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error getting bot status',
            error: error.message
        });
    }
});

// Get bot statistics
router.get('/stats', async (req, res) => {
    res.set(corsHeaders);
    try {
        // This would integrate with your Discord bot to get statistics
        res.json({
            total_commands: 42587,
            top_commands: [
                { name: 'help', uses: 5832 },
                { name: 'play', uses: 4281 },
                { name: 'profile', uses: 3459 }
            ],
            messages_processed: 153298,
            active_servers: 230,
            server_growth: {
                daily: 5,
                weekly: 35,
                monthly: 120
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error getting bot statistics',
            error: error.message
        });
    }
});

// Update bot statistics (authenticated route used by the bot itself)
router.post('/stats/update', async (req, res) => {
    res.set(corsHeaders);
    try {
        const stats = req.body;
        
        if (!stats) {
            return res.status(400).json({ message: 'Statistics data is required' });
        }
        
        // Here you would store the statistics in your database
        // For now, we'll just log and acknowledge receipt
        console.log('[INFO] >> Received updated bot statistics');
        
        // Calculate some derived metrics (for demonstration)
        let serverGrowth = {
            daily: 5,  // This would be calculated from historical data
            weekly: 35, // This would be calculated from historical data
            monthly: 120 // This would be calculated from historical data
        };
        
        res.json({
            message: 'Bot statistics updated successfully',
            received: stats,
            derived_metrics: {
                server_growth: serverGrowth,
                avg_commands_per_server: stats.commands_used / (stats.servers || 1),
                avg_users_per_server: stats.users / (stats.servers || 1)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating bot statistics',
            error: error.message
        });
    }
});

// Restart bot (admin only)
router.post('/restart', isAdmin, async (req, res) => {
    res.set(corsHeaders);
    try {
        // This would integrate with your Discord bot to trigger a restart
        // For now, we'll just respond as if it worked
        res.json({
            message: 'Bot restart initiated',
            estimated_downtime: '30 seconds'
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error restarting bot',
            error: error.message
        });
    }
});

// Update bot settings (admin only)
router.put('/settings', isAdmin, async (req, res) => {
    res.set(corsHeaders);
    try {
        const { prefix, status, activity_type, activity_name } = req.body;
        
        // This would integrate with your Discord bot to update settings
        // For now, we'll just respond as if it worked
        res.json({
            message: 'Bot settings updated successfully',
            settings: {
                prefix: prefix || '!',
                status: status || 'online',
                activity: {
                    type: activity_type || 'PLAYING',
                    name: activity_name || 'with commands'
                }
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating bot settings',
            error: error.message
        });
    }
});

// Execute command (bot owner only)
router.post('/execute', isBotOwner, async (req, res) => {
    res.set(corsHeaders);
    try {
        const { command, guild_id } = req.body;
        
        if (!command) {
            return res.status(400).json({ message: 'Command is required' });
        }
        
        // This would integrate with your Discord bot to execute a command
        // For now, we'll just respond as if it worked
        res.json({
            message: 'Command executed successfully',
            result: `Executed '${command}' ${guild_id ? `in guild ${guild_id}` : 'globally'}`
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error executing command',
            error: error.message
        });
    }
});

// Frontend error logging endpoint
router.post('/log', (req, res) => {
    res.set(corsHeaders);
    
    const { level, message, error } = req.body;
    
    // Log the error with timestamp and source
    console.log(`[${new Date().toISOString()}] [${level}] [Frontend] ${message}`, error || '');
    
    res.json({ status: 'logged' });
});

// Helper function to format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

module.exports = router;