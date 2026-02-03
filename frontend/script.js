/**
 * Frontend JavaScript for DevSecOps Dashboard
 * Fetches data from Flask backend API and updates UI
 */

// Configuration
const API_BASE_URL = window.location.origin;
const REFRESH_INTERVAL = 30000; // 30 seconds

// DOM Elements
const elements = {
    appName: document.getElementById('app-name'),
    appVersion: document.getElementById('app-version'),
    appEnvironment: document.getElementById('app-environment'),
    appStatus: document.getElementById('app-status'),
    statusMessage: document.getElementById('status-message'),
    statusDot: document.getElementById('status-dot'),
    healthStatus: document.getElementById('health-status'),
    healthMessage: document.getElementById('health-message'),
    healthDot: document.getElementById('health-dot')
};

/**
 * Fetch application information from /api/info endpoint
 */
async function fetchAppInfo() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/info`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Update UI with application info
        elements.appName.textContent = data.app_name || 'Unknown';
        elements.appVersion.textContent = data.version || 'N/A';
        elements.appEnvironment.textContent = data.environment || 'Unknown';

        // Style environment badge based on environment type
        styleEnvironmentBadge(data.environment);

        return data;
    } catch (error) {
        console.error('Error fetching app info:', error);
        elements.appName.textContent = 'Error loading data';
        elements.appVersion.textContent = 'N/A';
        elements.appEnvironment.textContent = 'Unknown';
        throw error;
    }
}

/**
 * Fetch application status from / endpoint
 */
async function fetchAppStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Update status UI
        if (data.status === 'running') {
            elements.appStatus.textContent = 'Running';
            elements.statusMessage.textContent = data.message || 'Application is operational';
            elements.statusDot.classList.add('healthy');
            elements.statusDot.classList.remove('error');
        } else {
            elements.appStatus.textContent = 'Unknown';
            elements.statusMessage.textContent = 'Status unclear';
            elements.statusDot.classList.remove('healthy', 'error');
        }

        return data;
    } catch (error) {
        console.error('Error fetching app status:', error);
        elements.appStatus.textContent = 'Error';
        elements.statusMessage.textContent = 'Unable to connect to backend';
        elements.statusDot.classList.add('error');
        elements.statusDot.classList.remove('healthy');
        throw error;
    }
}

/**
 * Fetch health check from /health endpoint
 */
async function fetchHealthCheck() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Update health UI
        if (data.status === 'healthy') {
            elements.healthStatus.textContent = 'Healthy';
            elements.healthMessage.textContent = `Service: ${data.service || 'Unknown'}`;
            elements.healthDot.classList.add('healthy');
            elements.healthDot.classList.remove('error');
        } else {
            elements.healthStatus.textContent = 'Unhealthy';
            elements.healthMessage.textContent = 'Service health check failed';
            elements.healthDot.classList.add('error');
            elements.healthDot.classList.remove('healthy');
        }

        return data;
    } catch (error) {
        console.error('Error fetching health check:', error);
        elements.healthStatus.textContent = 'Error';
        elements.healthMessage.textContent = 'Health check unavailable';
        elements.healthDot.classList.add('error');
        elements.healthDot.classList.remove('healthy');
        throw error;
    }
}

/**
 * Style environment badge based on environment type
 */
function styleEnvironmentBadge(environment) {
    const badge = elements.appEnvironment;

    // Remove existing environment classes
    badge.classList.remove('env-production', 'env-staging', 'env-development');

    // Add appropriate class based on environment
    if (environment) {
        const env = environment.toLowerCase();
        if (env === 'production') {
            badge.style.background = '#ef4444'; // Red
        } else if (env === 'staging') {
            badge.style.background = '#f59e0b'; // Orange
        } else if (env === 'development') {
            badge.style.background = '#10b981'; // Green
        } else {
            badge.style.background = '#4f46e5'; // Default blue
        }
    }
}

/**
 * Fetch all data from backend
 */
async function fetchAllData() {
    try {
        await Promise.all([
            fetchAppInfo(),
            fetchAppStatus(),
            fetchHealthCheck()
        ]);
        console.log('All data fetched successfully');
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

/**
 * Initialize dashboard
 */
function initDashboard() {
    console.log('Initializing DevSecOps Dashboard...');

    // Fetch data immediately on load
    fetchAllData();

    // Set up periodic refresh
    setInterval(fetchAllData, REFRESH_INTERVAL);

    console.log(`Dashboard initialized. Auto-refresh every ${REFRESH_INTERVAL / 1000} seconds.`);
}

// Initialize when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}
