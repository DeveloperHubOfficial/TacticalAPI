let startTime = Date.now();

async function refreshStatus() {
    const startCheck = performance.now();
    updateLastUpdated();
    
    try {
        // Check API Status
        const apiResponse = await checkEndpoint('/bot/health');
        const responseTime = Math.round(performance.now() - startCheck);
        updateApiStatus(apiResponse, responseTime);

        // Check Bot Status
        const botResponse = await checkEndpoint('/bot/status');
        updateBotStatus(botResponse);

        // Check DB Status
        const dbResponse = await checkEndpoint('/health/database');
        updateDbStatus(dbResponse);

        // Check System Resources
        const systemResponse = await checkEndpoint('/health/system');
        updateSystemStatus(systemResponse);

    } catch (error) {
        console.error('Error refreshing status:', error);
        markServiceDown();
    }
}

async function checkEndpoint(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
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
    } else {
        botCard.className = 'status-card error';
        connectionElement.textContent = '🔴 Disconnected';
    }

    serversElement.textContent = data.servers?.toLocaleString() || '-';
    usersElement.textContent = data.users?.toLocaleString() || '-';
}

function updateDbStatus(data) {
    const dbCard = document.getElementById('dbCard');
    const connectionElement = document.getElementById('dbConnection');
    const latencyElement = document.getElementById('dbLatency');

    if (data.status === 'connected') {
        dbCard.className = 'status-card healthy';
        connectionElement.textContent = '🟢 Connected';
    } else {
        dbCard.className = 'status-card error';
        connectionElement.textContent = '🔴 Disconnected';
    }

    latencyElement.textContent = data.latency ? `${data.latency}ms` : '-';
}

function updateSystemStatus(data) {
    const systemCard = document.getElementById('systemCard');
    const cpuElement = document.getElementById('cpuUsage');
    const memoryElement = document.getElementById('memoryUsage');
    const diskElement = document.getElementById('diskSpace');

    systemCard.className = 'status-card';
    if (data.cpu < 70) systemCard.classList.add('healthy');
    else if (data.cpu < 90) systemCard.classList.add('warning');
    else systemCard.classList.add('error');

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

// Initial check
refreshStatus();

// Auto refresh every 30 seconds
setInterval(refreshStatus, 30000);