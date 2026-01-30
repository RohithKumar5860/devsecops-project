import os
from flask import Flask, jsonify

app = Flask(__name__)

# Environment Configuration
ENV = os.getenv('FLASK_ENV', 'development')
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)
