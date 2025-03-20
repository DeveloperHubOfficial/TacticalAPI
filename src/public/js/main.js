document.addEventListener('DOMContentLoaded', () => {
    checkApiStatus();
    setInterval(checkApiStatus, 60000); // Check every minute
});

async function checkApiStatus() {
    const statusBadge = document.getElementById('apiStatus');
    
    try {
        const response = await fetch('/api/bot/health');
        const data = await response.json();
        
        if (data.status === 'online') {
            statusBadge.textContent = '🟢 API Online';
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