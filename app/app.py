import os
from flask import Flask, jsonify, render_template

app = Flask(__name__)

# Environment Configuration
ENV = os.getenv('FLASK_ENV', 'development')
APP_ENV = os.getenv('APP_ENV', 'development')
PORT = int(os.getenv('PORT', 5000))

@app.route('/')
def home():
    """Root endpoint serving the complete single-page dashboard."""
    return render_template('index.html')

@app.route('/api/health')
def health_check():
    """Health check endpoint for Kubernetes liveness/readiness probes."""
    return jsonify({
        "status": "healthy",
        "components": {
            "database": "connected"  # Simulated
        }
    }), 200

@app.route('/api/data')
def get_all_data():
    """
    Aggregated endpoint returning all application data in one response.
    This endpoint is called by the frontend JavaScript to populate the dashboard.
    """
    # Fetch health status internally
    health_status = "healthy"
    health_components = {"database": "connected"}
    
    # Aggregate all data
    data = {
        "metadata": {
            "name": "DevSecOps CI/CD Application",
            "description": "Production-ready Flask application with automated security scanning, containerization, and Kubernetes deployment",
            "version": "1.0.0",
            "environment": APP_ENV
        },
        "status": {
            "application": "running",
            "health": health_status,
            "message": "All systems operational"
        },
        "devsecops_components": [
            {
                "name": "GitHub Actions CI/CD",
                "description": "Automated build, test, and deployment pipeline",
                "status": "active"
            },
            {
                "name": "SonarCloud SAST",
                "description": "Static Application Security Testing for code quality",
                "status": "configured"
            },
            {
                "name": "Docker Containerization",
                "description": "Multi-stage builds with security best practices",
                "status": "active"
            },
            {
                "name": "Kubernetes Deployment",
                "description": "Cloud-native orchestration with auto-scaling",
                "status": "ready"
            },
            {
                "name": "Security Secrets Management",
                "description": "Kubernetes secrets for sensitive configuration",
                "status": "configured"
            }
        ],
        "endpoints": [
            {
                "method": "GET",
                "path": "/",
                "description": "Main dashboard (this page)"
            },
            {
                "method": "GET",
                "path": "/api/data",
                "description": "Aggregated application data endpoint"
            },
            {
                "method": "GET",
                "path": "/api/health",
                "description": "Health check for Kubernetes probes"
            }
        ]
    }
    
    return jsonify(data), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)
