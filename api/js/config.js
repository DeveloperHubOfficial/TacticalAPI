// API endpoint configuration
const config = {
    production: {
        apiUrl: 'https://developerhubofficial.github.io/TacticalAPI/api',
        wsUrl: 'wss://developerhubofficial.github.io/TacticalAPI/api',
        fallbackUrl: 'https://developerhubofficial.github.io/TacticalAPI/api'
    },
    staging: {
        apiUrl: 'https://developerhubofficial.github.io/TacticalAPI/api',
        wsUrl: 'wss://developerhubofficial.github.io/TacticalAPI/api',
        fallbackUrl: 'https://developerhubofficial.github.io/TacticalAPI/api'
    },
    development: {
        apiUrl: 'http://localhost:3000',
        wsUrl: 'ws://localhost:3000',
        fallbackUrl: 'http://localhost:3001'
    }
};

// Determine environment based on URL
function getEnvironment() {
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
        return 'development';
    }
    return 'production';
}

// Export the configuration for the current environment
const currentEnv = getEnvironment();
const CONFIG = {
    API_URL: config[currentEnv].apiUrl,
    WS_URL: config[currentEnv].wsUrl,
    FALLBACK_URL: config[currentEnv].fallbackUrl
};

export default CONFIG;