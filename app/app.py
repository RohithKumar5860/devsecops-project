import os
from flask import Flask, jsonify, render_template
import requests

app = Flask(__name__)

# Environment Configuration
ENV = os.getenv('FLASK_ENV', 'development')
APP_ENV = os.getenv('APP_ENV', 'development')
PORT = int(os.getenv('PORT', 5000))

@app.route('/')
def home():
    """Root endpoint returning application status."""
    return jsonify({
        "message": "Secure CI/CD Pipeline App is Running",
        "environment": ENV,
        "status": "success"
    }), 200

@app.route('/health')
def health_check():
    """Health check endpoint for Kubernetes liveness/readiness probes."""
    return jsonify({
        "status": "healthy",
        "components": {
            "database": "connected" # Simulated
        }
    }), 200

@app.route('/ui')
def ui_dashboard():
    """Minimal UI endpoint to visualize application status."""
    # Fetch health status from /health endpoint
    try:
        health_response = requests.get(f'http://localhost:{PORT}/health')
        health_data = health_response.json()
        health_status = health_data.get('status', 'unknown')
    except:
        health_status = 'unavailable'
    
    return render_template('index.html', 
                         app_name="DevSecOps CI/CD Application",
                         environment=APP_ENV,
                         app_status="running",
                         health_status=health_status)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)
