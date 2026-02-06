"""
Flask Backend API for DevSecOps Project
Provides RESTful endpoints for application status and health checks
"""

import os
from flask import Flask, jsonify, send_from_directory, render_template_string
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
    Root endpoint - serves the dashboard HTML page
    """
    # Read and serve the frontend HTML file
    frontend_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'index.html')
    try:
        with open(frontend_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        return html_content, 200
    except FileNotFoundError:
        # Fallback to JSON if HTML not found
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


@app.route('/api/project', methods=['GET'])
def project_overview():
    """
    Aggregated project information endpoint
    Returns all project data in a single response
    """
    return jsonify({
        'metadata': {
            'name': APP_NAME,
            'description': 'A production-ready DevSecOps project demonstrating modern CI/CD automation, shift-left security practices, Docker containerization, and Kubernetes-ready deployment',
            'version': VERSION,
            'environment': APP_ENV
        },
        'status': {
            'application': 'running',
            'health': 'healthy',
            'message': 'All systems operational'
        },
        'devsecops_components': [
            {
                'name': 'CI/CD Pipeline',
                'description': 'GitHub Actions workflow with automated testing and deployment',
                'status': 'active'
            },
            {
                'name': 'Docker',
                'description': 'Multi-stage containerization with security best practices',
                'status': 'active'
            },
            {
                'name': 'Trivy Scanner',
                'description': 'Container vulnerability scanning for CVE detection',
                'status': 'active'
            },
            {
                'name': 'SonarCloud',
                'description': 'Code quality and security analysis (optional)',
                'status': 'configured'
            },
            {
                'name': 'Kubernetes',
                'description': 'Container orchestration with HPA and security contexts',
                'status': 'ready'
            }
        ],
        'endpoints': [
            {
                'path': '/ui',
                'description': 'Project dashboard (this page)',
                'method': 'GET'
            },
            {
                'path': '/api/project',
                'description': 'Aggregated project information',
                'method': 'GET'
            },
            {
                'path': '/health',
                'description': 'Health check endpoint',
                'method': 'GET'
            },
            {
                'path': '/api/info',
                'description': 'Application information',
                'method': 'GET'
            }
        ]
    }), 200


@app.route('/ui')
def ui():
    """
    Serve the frontend dashboard (alternative route)
    """
    return index()


@app.route('/style.css')
def serve_css():
    """
    Serve the CSS file from frontend directory
    """
    frontend_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend')
    return send_from_directory(frontend_dir, 'style.css')


@app.route('/script.js')
def serve_js():
    """
    Serve the JavaScript file from frontend directory
    """
    frontend_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend')
    return send_from_directory(frontend_dir, 'script.js')



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
