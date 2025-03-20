import CONFIG from './config.js';

let startTime = Date.now();
let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

async function logError(level, message, error = null) {
    try {
        await fetch(`${CONFIG.API_URL}/bot/log`, {
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
    try {
        const [apiHealth, dbHealth, sysHealth, botStats] = await Promise.allSettled([
            checkEndpoint(`${CONFIG.API_URL}/bot/health`),
            checkEndpoint(`${CONFIG.API_URL}/bot/health/database`),
            checkEndpoint(`${CONFIG.API_URL}/bot/health/system`),
            checkEndpoint(`${CONFIG.API_URL}/bot/status`)
        ]);

        updateLastUpdated();

        if (apiHealth.status === 'fulfilled') {
            updateApiStatus(apiHealth.value.data, apiHealth.value.responseTime);
        } else {
            markServiceDown('api');
            await logError('error', 'API health check failed', apiHealth.reason);
        }

        if (dbHealth.status === 'fulfilled') {
            updateDbStatus(dbHealth.value.data);
        } else {
            markServiceDown('database');
            await logError('error', 'Database health check failed', dbHealth.reason);
        }

        if (sysHealth.status === 'fulfilled') {
            updateSystemStatus(sysHealth.value.data);
        } else {
            markServiceDown('system');
            await logError('error', 'System health check failed', sysHealth.reason);
        }

        if (botStats.status === 'fulfilled') {
            updateBotStatus(botStats.value.data);
        } else {
            markServiceDown('bot');
            await logError('error', 'Bot status check failed', botStats.reason);
        }

    } catch (error) {
        console.error('Status refresh failed:', error);
        await logError('error', 'Status refresh failed', error);
        markServiceDown('all');
    }
}

async function checkEndpoint(url) {
    const startTime = performance.now();
    const response = await fetch(url);
    const responseTime = Math.round(performance.now() - startTime);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { data, responseTime };
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
    const commandsElement = document.getElementById('botCommands');

    if (data.status === 'online') {
        botCard.className = 'status-card healthy';
        connectionElement.textContent = '🟢 Connected';
    } else {
        botCard.className = 'status-card error';
        connectionElement.textContent = '🔴 Disconnected';
    }

    serversElement.textContent = data.servers?.toLocaleString() || '-';
    usersElement.textContent = data.users?.toLocaleString() || '-';
    commandsElement.textContent = data.commands_used?.toLocaleString() || '-';
}

function updateDbStatus(data) {
    const dbCard = document.getElementById('dbCard');
    const statusElement = document.getElementById('dbStatus');
    const latencyElement = document.getElementById('dbLatency');
    const nameElement = document.getElementById('dbName');

    if (data.status === 'connected') {
        dbCard.className = 'status-card healthy';
        statusElement.textContent = '🟢 Connected';
    } else {
        dbCard.className = 'status-card error';
        statusElement.textContent = '🔴 Disconnected';
    }

    latencyElement.textContent = `${data.latency}ms`;
    nameElement.textContent = data.name || '-';
}

function updateSystemStatus(data) {
    const sysCard = document.getElementById('systemCard');
    const cpuElement = document.getElementById('cpuUsage');
    const memoryElement = document.getElementById('memoryUsage');
    const diskElement = document.getElementById('diskSpace');

    sysCard.className = 'status-card healthy';
    cpuElement.textContent = `${data.cpu}%`;
    memoryElement.textContent = data.memory;
    diskElement.textContent = data.disk;
}

function markServiceDown(service) {
    const cards = {
        api: 'apiCard',
        database: 'dbCard',
        system: 'systemCard',
        bot: 'botCard',
        all: ['apiCard', 'dbCard', 'systemCard', 'botCard']
    };

    const markDown = (cardId) => {
        const card = document.getElementById(cardId);
        if (card) {
            card.className = 'status-card error';
            const statusElement = card.querySelector('[id$="Status"]');
            if (statusElement) {
                statusElement.textContent = '🔴 Offline';
            }
        }
    };

    if (service === 'all') {
        cards.all.forEach(markDown);
    } else {
        markDown(cards[service]);
    }
}

function updateLastUpdated() {
    const element = document.getElementById('lastUpdated');
    if (element) {
        element.textContent = new Date().toLocaleString();
    }
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