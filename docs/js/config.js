// API endpoint configuration
const config = {
    production: {
        apiUrl: 'https://api.tactical-ai.com', // Update this with your production API URL
        wsUrl: 'wss://api.tactical-ai.com'     // Update this with your production WebSocket URL
    },
    staging: {
        apiUrl: 'https://staging-api.tactical-ai.com',
        wsUrl: 'wss://staging-api.tactical-ai.com'
    },
    development: {
        apiUrl: 'http://localhost:3000',
        wsUrl: 'ws://localhost:3000'
    }
};

// Determine environment based on URL
function getEnvironment() {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
    } else if (hostname.includes('staging')) {
        return 'staging';
    }
    return 'production';
}

// Export the configuration for the current environment
const currentEnv = getEnvironment();
export const API_URL = config[currentEnv].apiUrl;
export const WS_URL = config[currentEnv].wsUrl;