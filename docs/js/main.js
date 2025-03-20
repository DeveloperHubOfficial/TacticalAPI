import { API_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    checkApiStatus();
    setInterval(checkApiStatus, 60000); // Check every minute
});

async function checkApiStatus() {
    const statusBadge = document.getElementById('apiStatus');
    
    try {
        const startTime = performance.now();
        const response = await fetch(`${API_URL}/api/bot/health`);
        const data = await response.json();
        const responseTime = Math.round(performance.now() - startTime);

        if (data.status === 'online') {
            statusBadge.textContent = `🟢 API Online (${responseTime}ms)`;
            statusBadge.classList.add('online');
        } else {
            statusBadge.textContent = '🔴 API Offline';
            statusBadge.classList.remove('online');
        }
    } catch (error) {
        statusBadge.textContent = '🔴 API Offline';
        statusBadge.classList.remove('online');
    }
}