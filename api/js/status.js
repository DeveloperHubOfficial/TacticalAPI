import CONFIG from './config.js';

let startTime = Date.now();
let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function logError(level, message, error = null) {
    try {
        await fetch(`${CONFIG.API_URL}/api/bot/log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                level,
                message,
                error: error ? error.toString() : null,
                timestamp: new Date().toISOString()
            })
        });
    } catch (e) {
        console.error('Failed to log error:', e);
    }
}

async function refreshStatus() {
    const startCheck = performance.now();
    updateLastUpdated();
    
    try {
        // Check API Status with retry
        const apiResponse = await retryOperation(() => checkEndpoint(`${CONFIG.API_URL}/api/bot/health`));
        const responseTime = Math.round(performance.now() - startCheck);
        updateApiStatus(apiResponse, responseTime);

        // Check Bot Status
        const botResponse = await retryOperation(() => checkEndpoint(`${CONFIG.API_URL}/api/bot/status`));
        updateBotStatus(botResponse);

        // Check DB Status
        const dbResponse = await retryOperation(() => checkEndpoint(`${CONFIG.API_URL}/api/bot/health/database`));
        updateDbStatus(dbResponse);

        // Check System Resources
        const systemResponse = await retryOperation(() => checkEndpoint(`${CONFIG.API_URL}/api/bot/health/system`));
        updateSystemStatus(systemResponse);

        // Reset retry count on success
        retryCount = 0;
        
        // Log successful status update
        await logError('info', 'Status update completed successfully', { 
            responseTime,
            apiStatus: apiResponse.status,
            botStatus: botResponse.status
        });
    } catch (error) {
        console.error('Error refreshing status:', error);
        await logError('error', 'Failed to refresh status', error);
        markServiceDown();
    }
}

async function retryOperation(operation) {
    let lastError;
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            console.warn(`Attempt ${i + 1} failed, retrying in ${RETRY_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }
    throw lastError;
}

async function checkEndpoint(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timed out');
        }
        throw error;
    }
}

function updateApiStatus(data, responseTime) {
    const apiCard = document.getElementById('apiCard');
    const statusElement = document.getElementById('apiStatus');
    const responseTimeElement = document.getElementById('apiResponseTime');
    const uptimeElement = document.getElementById('apiUptime');

    if (data.status === 'online') {
        apiCard.className = 'status-card healthy';
        statusElement.textContent = '🟢 Online';
    } else {
        apiCard.className = 'status-card error';
        statusElement.textContent = '🔴 Offline';
    }

    responseTimeElement.textContent = `${responseTime}ms`;
    uptimeElement.textContent = formatUptime(Date.now() - startTime);
}

function updateBotStatus(data) {
    const botCard = document.getElementById('botCard');
    const connectionElement = document.getElementById('botConnection');
    const serversElement = document.getElementById('botServers');
    const usersElement = document.getElementById('botUsers');

    if (data.status === 'online') {
        botCard.className = 'status-card healthy';
        connectionElement.textContent = '🟢 Connected';
        serversElement.textContent = data.servers?.toLocaleString() || '-';
        usersElement.textContent = data.users?.toLocaleString() || '-';
    } else {
        botCard.className = 'status-card error';
        connectionElement.textContent = '🔴 Disconnected';
        serversElement.textContent = '-';
        usersElement.textContent = '-';
    }
}

function updateDbStatus(data) {
    const dbCard = document.getElementById('dbCard');
    const connectionElement = document.getElementById('dbConnection');
    const latencyElement = document.getElementById('dbLatency');

    if (data.status === 'connected') {
        dbCard.className = 'status-card healthy';
        connectionElement.textContent = '🟢 Connected';
        latencyElement.textContent = data.latency ? `${data.latency}ms` : '-';
    } else {
        dbCard.className = 'status-card error';
        connectionElement.textContent = '🔴 Disconnected';
        latencyElement.textContent = '-';
    }
}

function updateSystemStatus(data) {
    const systemCard = document.getElementById('systemCard');
    const cpuElement = document.getElementById('cpuUsage');
    const memoryElement = document.getElementById('memoryUsage');
    const diskElement = document.getElementById('diskSpace');

    systemCard.className = 'status-card';
    
    if (data.cpu < 70) {
        systemCard.classList.add('healthy');
    } else if (data.cpu < 90) {
        systemCard.classList.add('warning');
    } else {
        systemCard.classList.add('error');
    }

    cpuElement.textContent = data.cpu ? `${data.cpu}%` : '-';
    memoryElement.textContent = data.memory || '-';
    diskElement.textContent = data.disk || '-';
}

function markServiceDown() {
    const cards = document.querySelectorAll('.status-card');
    cards.forEach(card => {
        card.className = 'status-card error';
        const values = card.querySelectorAll('.metric-value');
        values.forEach(value => {
            if (value.id === 'apiStatus') value.textContent = '🔴 Offline';
            else if (value.id === 'botConnection') value.textContent = '🔴 Disconnected';
            else if (value.id === 'dbConnection') value.textContent = '🔴 Disconnected';
            else value.textContent = '-';
        });
    });
}

function updateLastUpdated() {
    const element = document.getElementById('lastUpdated');
    element.textContent = new Date().toLocaleTimeString();
}

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

// Export the refresh function to be accessible from the HTML
window.refreshStatus = refreshStatus;

// Initial check
refreshStatus();

// Auto refresh every 30 seconds
setInterval(refreshStatus, 30000);