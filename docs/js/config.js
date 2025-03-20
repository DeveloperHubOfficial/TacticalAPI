// API endpoint configuration
const config = {
    production: {
        apiUrl: 'https://developerhubofficial.github.io/TacticalAPI',
        wsUrl: 'wss://developerhubofficial.github.io/TacticalAPI/'
    },
    staging: {
        apiUrl: 'https://developerhubofficial.github.io/TacticalAPI/',
        wsUrl: 'wss://developerhubofficial.github.io/TacticalAPI/'
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
const CONFIG = {
    API_URL: config[currentEnv].apiUrl,
    WS_URL: config[currentEnv].wsUrl
};

export default CONFIG;