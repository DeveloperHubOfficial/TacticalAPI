# TacticalAPI for DevHub Discord Bot

TacticalAPI is a REST API that integrates with the DevHub Discord bot, providing remote control capabilities, advanced statistics, and programmatic access to bot functionality.

## Features

- **Authentication**: Secure JWT-based authentication system with API key support
- **Bot Management**: Control and monitor your Discord bot remotely
- **Guild Management**: View and update settings for all servers the bot is in
- **Command Control**: Enable/disable commands globally or per server
- **User Management**: Manage API users and permissions

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- MongoDB database
- Tactical AI Discord bot (with TacticalAPIClient integration)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/DeveloperHubOfficial/TacticalAPI.git
cd TacticalAPI
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables (see `.env.example`):
```
PORT=3000
NODE_ENV=development
MONGO_TOKEN=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
BOT_TOKEN=your_discord_bot_token
BOT_CLIENT_ID=your_discord_client_id
```

4. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Documentation

The API provides several endpoints organized by functionality:

### Authentication

- `POST /api/auth/register` - Register a new API user
- `POST /api/auth/login` - Log in and obtain JWT token
- `GET /api/auth/api-key` - Get API key (requires authentication)
- `POST /api/auth/api-key/regenerate` - Regenerate API key (requires authentication)

### Bot Management

- `GET /api/bot/status` - Get bot status (uptime, servers, etc.)
- `GET /api/bot/stats` - Get bot statistics
- `POST /api/bot/restart` - Restart the bot (admin only)
- `PUT /api/bot/settings` - Update bot settings (admin only)
- `POST /api/bot/execute` - Execute a command (bot owner only)

### Guild Management

- `GET /api/guilds` - Get all guilds the bot is in
- `GET /api/guilds/:id` - Get a specific guild by ID
- `GET /api/guilds/:id/settings` - Get guild settings
- `PUT /api/guilds/:id/settings` - Update guild settings (admin only)
- `DELETE /api/guilds/:id/leave` - Leave a guild (admin only)

### Commands

- `GET /api/commands` - Get all available commands
- `GET /api/commands/category/:category` - Get commands by category
- `GET /api/commands/:name` - Get a specific command by name
- `PUT /api/commands/:name/toggle` - Enable/disable a command (admin only)

### Users

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `PUT /api/users/me/password` - Change password
- `POST /api/users/me/discord` - Link Discord account
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## Discord Bot Integration

To integrate the TacticalAPI with the Tactical AI Discord bot, the following components have been created:

1. `TacticalAPIClient` class in the bot project (`src/utils/TacticalAPIClient.js`)
2. API-related commands:
   - `/apistatus` - Check API connection status
   - `/botstats` - Display bot statistics from the API
   - `/serversettings` - Interactive menu to manage server settings

## Security Considerations

- Always use HTTPS in production environments
- Set a strong JWT_SECRET and keep it secure
- Use API rate limiting to prevent abuse
- Follow the principle of least privilege for API users