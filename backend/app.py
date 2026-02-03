"""
Flask Backend API for DevSecOps Project
Provides RESTful endpoints for application status and health checks
"""

import os
from flask import Flask, jsonify, send_from_directory
from flask.logging import create_logger

app = Flask(__name__, static_folder='static', static_url_path='')
logger = create_logger(app)

# Environment configuration
APP_ENV = os.getenv('APP_ENV', 'development')
APP_NAME = 'DevSecOps Flask Application'
VERSION = '1.0.0'


@app.route('/', methods=['GET'])
def index():
    """
    Root endpoint - returns application status
    """
    return jsonify({
        'status': 'running',
        'message': 'DevSecOps Flask API is operational',
        'version': VERSION
    }), 200


@app.route('/health', methods=['GET'])
def health():
    """
    Health check endpoint for monitoring and orchestration
    """
    return jsonify({
        'status': 'healthy',
        'environment': APP_ENV,
        'service': APP_NAME
    }), 200


@app.route('/api/info', methods=['GET'])
def api_info():
    """
    Application information endpoint
    """
    return jsonify({
        'app_name': APP_NAME,
        'environment': APP_ENV,
        'version': VERSION,
        'status': 'operational'
    }), 200


@app.route('/ui')
def ui():
    """
    Serve the frontend dashboard
    """
    return send_from_directory(app.static_folder, 'index.html')


@app.errorhandler(404)
def not_found(error):
    """
    Handle 404 errors
    """
    return jsonify({
        'error': 'Not Found',
        'message': 'The requested resource does not exist'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """
    Handle 500 errors
    """
    logger.error(f'Internal Server Error: {error}')
    return jsonify({
        'error': 'Internal Server Error',
        'message': 'An unexpected error occurred'
    }), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=(APP_ENV == 'development'))
