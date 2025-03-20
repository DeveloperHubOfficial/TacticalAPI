const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');

// Get all guilds the bot is in
router.get('/', async (req, res) => {
  try {
    // This would integrate with your Discord bot to get all guilds
    // For now, we'll return a mock response
    res.json({
      guilds: [
        {
          id: '123456789012345678',
          name: 'Dev Hub Main',
          icon: 'https://cdn.discordapp.com/icons/123456789012345678/abcdef.png',
          member_count: 5432,
          owner_id: '987654321098765432',
          premium_tier: 2
        },
        {
          id: '234567890123456789',
          name: 'Gaming Community',
          icon: 'https://cdn.discordapp.com/icons/234567890123456789/ghijkl.png',
          member_count: 2876,
          owner_id: '876543210987654321',
          premium_tier: 1
        }
      ],
      total: 250
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error getting guilds',
      error: error.message
    });
  }
});

// Get specific guild by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // This would integrate with your Discord bot to get guild details
    // For now, we'll return a mock response
    res.json({
      id: id,
      name: 'Dev Hub Main',
      icon: 'https://cdn.discordapp.com/icons/123456789012345678/abcdef.png',
      member_count: 5432,
      owner_id: '987654321098765432',
      premium_tier: 2,
      roles: [
        { id: 'role1', name: 'Admin', color: '#FF0000', members: 5 },
        { id: 'role2', name: 'Moderator', color: '#00FF00', members: 12 },
        { id: 'role3', name: 'Member', color: '#0000FF', members: 5415 }
      ],
      channels: [
        { id: 'channel1', name: 'general', type: 'text' },
        { id: 'channel2', name: 'voice-chat', type: 'voice' },
        { id: 'channel3', name: 'announcements', type: 'text' }
      ],
      features: [
        'COMMUNITY',
        'WELCOME_SCREEN_ENABLED',
        'NEWS'
      ]
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error getting guild details',
      error: error.message
    });
  }
});

// Get guild settings
router.get('/:id/settings', async (req, res) => {
  try {
    const { id } = req.params;
    
    // This would integrate with your Discord bot to get guild settings
    // For now, we'll return a mock response
    res.json({
      prefix: '!',
      welcome: {
        enabled: true,
        channel_id: 'welcome-channel-id',
        message: 'Welcome {user} to {server}!'
      },
      moderation: {
        log_channel_id: 'mod-logs-channel-id',
        auto_role_id: 'member-role-id',
        mute_role_id: 'muted-role-id'
      },
      levels: {
        enabled: true,
        announce_channel_id: 'levels-channel-id',
        announce_message: 'Congratulations {user}, you reached level {level}!'
      },
      auto_mod: {
        enabled: true,
        filter_profanity: true,
        filter_invites: true,
        filter_links: false,
        filter_spam: true
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error getting guild settings',
      error: error.message
    });
  }
});

// Update guild settings (admin only)
router.put('/:id/settings', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const settings = req.body;
    
    if (!settings) {
      return res.status(400).json({ message: 'Settings are required' });
    }
    
    // This would integrate with your Discord bot to update guild settings
    // For now, we'll just respond as if it worked
    res.json({
      message: 'Guild settings updated successfully',
      guild_id: id,
      settings
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating guild settings',
      error: error.message
    });
  }
});

// Leave a guild (admin only)
router.delete('/:id/leave', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // This would integrate with your Discord bot to leave a guild
    // For now, we'll just respond as if it worked
    res.json({
      message: `Bot has left guild ${id} successfully`
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error leaving guild',
      error: error.message
    });
  }
});

module.exports = router;