/**
 * Frontend JavaScript for DevSecOps Dashboard
 * Fetches all project data from a single aggregated endpoint
 */

// Configuration
const API_BASE_URL = window.location.origin;
const REFRESH_INTERVAL = 30000; // 30 seconds

/**
 * Fetch all project data from /api/project endpoint
 */
async function fetchProjectData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/project`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Update all UI sections with the fetched data
        updateMetadata(data.metadata);
        updateStatus(data.status);
        updateDevSecOpsComponents(data.devsecops_components);
        updateEndpoints(data.endpoints);

        console.log('Project data fetched successfully');
        return data;
    } catch (error) {
        console.error('Error fetching project data:', error);
        showError();
        throw error;
    }
}

/**
 * Update metadata section
 */
function updateMetadata(metadata) {
    const appName = document.getElementById('app-name');
    const appDescription = document.getElementById('app-description');
    const appVersion = document.getElementById('app-version');
    const appEnvironment = document.getElementById('app-environment');

    if (appName) appName.textContent = metadata.name || 'Unknown';
    if (appDescription) appDescription.textContent = metadata.description || 'No description available';
    if (appVersion) appVersion.textContent = metadata.version || 'N/A';
    if (appEnvironment) {
        appEnvironment.textContent = metadata.environment || 'Unknown';
        styleEnvironmentBadge(metadata.environment);
    }
}

/**
 * Update status section (combined application + health)
 */
function updateStatus(status) {
    const statusText = document.getElementById('status-text');
    const statusMessage = document.getElementById('status-message');
    const statusDot = document.getElementById('status-dot');

    if (status.application === 'running' && status.health === 'healthy') {
        if (statusText) statusText.textContent = 'Operational';
        if (statusMessage) statusMessage.textContent = status.message || 'All systems running';
        if (statusDot) {
            statusDot.classList.add('healthy');
            statusDot.classList.remove('error');
        }
    } else {
        if (statusText) statusText.textContent = 'Degraded';
        if (statusMessage) statusMessage.textContent = 'System experiencing issues';
        if (statusDot) {
            statusDot.classList.add('error');
            statusDot.classList.remove('healthy');
        }
    }
}

/**
 * Update DevSecOps components list
 */
function updateDevSecOpsComponents(components) {
    const componentsList = document.getElementById('components-list');

    if (!componentsList || !components) return;

    componentsList.innerHTML = '';

    components.forEach(component => {
        const li = document.createElement('li');
        li.className = 'component-item';

        const statusBadge = getStatusBadge(component.status);

        li.innerHTML = `
            <div class="component-header">
                <span class="component-name">${component.name}</span>
                <span class="component-status ${statusBadge.class}">${statusBadge.text}</span>
            </div>
            <p class="component-description">${component.description}</p>
        `;

        componentsList.appendChild(li);
    });
}

/**
 * Update endpoints list
 */
function updateEndpoints(endpoints) {
    const endpointsList = document.getElementById('endpoints-list');

    if (!endpointsList || !endpoints) return;

    endpointsList.innerHTML = '';

    endpoints.forEach(endpoint => {
        const li = document.createElement('li');
        li.className = 'endpoint-item';

        const fullUrl = `${API_BASE_URL}${endpoint.path}`;

        li.innerHTML = `
            <div class="endpoint-header">
                <span class="endpoint-method">${endpoint.method}</span>
                <a href="${fullUrl}" class="endpoint-path" target="_blank">${endpoint.path}</a>
            </div>
            <p class="endpoint-description">${endpoint.description}</p>
        `;

        endpointsList.appendChild(li);
    });
}

/**
 * Get status badge configuration
 */
function getStatusBadge(status) {
    const badges = {
        'active': { text: 'Active', class: 'status-active' },
        'ready': { text: 'Ready', class: 'status-ready' },
        'configured': { text: 'Configured', class: 'status-configured' },
        'inactive': { text: 'Inactive', class: 'status-inactive' }
    };

    return badges[status] || { text: status, class: 'status-default' };
}

/**
 * Style environment badge based on environment type
 */
function styleEnvironmentBadge(environment) {
    const badge = document.getElementById('app-environment');

    if (!badge || !environment) return;

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

/**
 * Show error state
 */
function showError() {
    const statusText = document.getElementById('status-text');
    const statusMessage = document.getElementById('status-message');
    const statusDot = document.getElementById('status-dot');

    if (statusText) statusText.textContent = 'Error';
    if (statusMessage) statusMessage.textContent = 'Unable to connect to backend';
    if (statusDot) {
        statusDot.classList.add('error');
        statusDot.classList.remove('healthy');
    }
}

/**
 * Initialize dashboard
 */
function initDashboard() {
    console.log('Initializing DevSecOps Dashboard...');

    // Fetch data immediately on load
    fetchProjectData();

    // Set up periodic refresh
    setInterval(fetchProjectData, REFRESH_INTERVAL);

    console.log(`Dashboard initialized. Auto-refresh every ${REFRESH_INTERVAL / 1000} seconds.`);
}

// Initialize when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}
