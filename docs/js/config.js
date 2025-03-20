// API endpoint configuration
const config = {
    production: {
        apiUrl: 'https://developerhubofficial.github.io/TacticalAPI/docs',
        wsUrl: 'wss://developerhubofficial.github.io/TacticalAPI/docs',
        fallbackUrl: 'https://developerhubofficial.github.io/TacticalAPI/docs'
    },
    staging: {
        apiUrl: 'https://developerhubofficial.github.io/TacticalAPI/docs',
        wsUrl: 'wss://developerhubofficial.github.io/TacticalAPI/docs',
        fallbackUrl: 'https://developerhubofficial.github.io/TacticalAPI/docs'
    },
    development: {
        apiUrl: 'http://localhost:3000',
        wsUrl: 'ws://localhost:3000',
        fallbackUrl: 'http://localhost:3001'
    }
};

// Determine environment based on URL
function getEnvironment() {
    // Check if we're in a development environment
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
        return 'development';
    }
    
    // Check if we're on the staging site
    if (window.location.hostname.includes('staging') || 
        window.location.hostname.includes('test')) {
        return 'staging';
    }
    
    // Default to production for GitHub Pages
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