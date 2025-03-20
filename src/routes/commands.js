const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');

// Get all available commands
router.get('/', async (req, res) => {
  try {
    // Mock response for now
    res.json({
      total: 400,
      categories: [
        'moderation',
        'music',
        'fun',
        'economy',
        'levels',
        'games',
        'utility',
        'admin'
      ],
      commands: [
        {
          name: 'ban',
          description: 'Ban a user from the server',
          category: 'moderation',
          usage: 'ban @user [reason]',
          cooldown: 5,
          required_permissions: ['BAN_MEMBERS']
        },
        {
          name: 'play',
          description: 'Play a song from YouTube, Spotify, or SoundCloud',
          category: 'music',
          usage: 'play <song name or URL>',
          cooldown: 3,
          required_permissions: []
        },
        {
          name: 'profile',
          description: 'View your or someone else\'s profile',
          category: 'utility',
          usage: 'profile [@user]',
          cooldown: 5,
          required_permissions: []
        }
        // This would be populated with all commands in the actual implementation
      ]
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error getting commands',
      error: error.message
    });
  }
});

// Get commands by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    // Mock response for now
    const categoryCommands = {
      moderation: [
        {
          name: 'ban',
          description: 'Ban a user from the server',
          usage: 'ban @user [reason]',
          cooldown: 5,
          required_permissions: ['BAN_MEMBERS']
        },
        {
          name: 'kick',
          description: 'Kick a user from the server',
          usage: 'kick @user [reason]',
          cooldown: 5,
          required_permissions: ['KICK_MEMBERS']
        },
        {
          name: 'mute',
          description: 'Mute a user in the server',
          usage: 'mute @user [duration] [reason]',
          cooldown: 5,
          required_permissions: ['MANAGE_ROLES']
        }
      ],
      music: [
        {
          name: 'play',
          description: 'Play a song from YouTube, Spotify, or SoundCloud',
          usage: 'play <song name or URL>',
          cooldown: 3,
          required_permissions: []
        },
        {
          name: 'skip',
          description: 'Skip the current song',
          usage: 'skip',
          cooldown: 2,
          required_permissions: []
        },
        {
          name: 'queue',
          description: 'View the current music queue',
          usage: 'queue [page]',
          cooldown: 3,
          required_permissions: []
        }
      ]
    };
    
    if (!categoryCommands[category]) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({
      category,
      total: categoryCommands[category].length,
      commands: categoryCommands[category]
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error getting commands by category',
      error: error.message
    });
  }
});

// Get specific command by name
router.get('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    // Mock response for now
    const commands = {
      ban: {
        name: 'ban',
        description: 'Ban a user from the server',
        category: 'moderation',
        usage: 'ban @user [reason]',
        cooldown: 5,
        required_permissions: ['BAN_MEMBERS'],
        examples: [
          'ban @User breaking rules',
          'ban @User spamming'
        ]
      },
      play: {
        name: 'play',
        description: 'Play a song from YouTube, Spotify, or SoundCloud',
        category: 'music',
        usage: 'play <song name or URL>',
        cooldown: 3,
        required_permissions: [],
        examples: [
          'play despacito',
          'play https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        ]
      }
    };
    
    if (!commands[name]) {
      return res.status(404).json({ message: 'Command not found' });
    }
    
    res.json(commands[name]);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error getting command details',
      error: error.message
    });
  }
});

// Enable/disable a command (admin only)
router.put('/:name/toggle', isAdmin, async (req, res) => {
  try {
    const { name } = req.params;
    const { enabled, guild_id } = req.body;
    
    if (enabled === undefined) {
      return res.status(400).json({ message: 'Enabled status is required' });
    }
    
    // This would integrate with your Discord bot to toggle a command
    // For now, we'll just respond as if it worked
    res.json({
      message: `Command ${name} has been ${enabled ? 'enabled' : 'disabled'} ${guild_id ? `for guild ${guild_id}` : 'globally'}`,
      command: name,
      enabled,
      scope: guild_id ? 'guild' : 'global',
      guild_id
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error toggling command',
      error: error.message
    });
  }
});

module.exports = router;