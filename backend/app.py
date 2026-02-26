"""
Flask Backend API for DevSecOps Project
Provides RESTful endpoints for application status and health checks
"""

import os
from flask import Flask, jsonify, send_from_directory
from flask.logging import create_logger

app = Flask(__name__)
logger = create_logger(app)

# Environment configuration
APP_ENV = os.getenv('APP_ENV', 'development')
APP_NAME = 'DevSecOps Flask Application'
VERSION = '1.0.0'

# Resolve frontend directory relative to THIS file's absolute location,
# so the app works regardless of which directory it is launched from.
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.normpath(os.path.join(_BASE_DIR, '..', 'frontend'))


@app.route('/', methods=['GET'])
def index():
    """
    Root endpoint - serves the dashboard HTML page
    """
    html_path = os.path.join(FRONTEND_DIR, 'index.html')
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        return html_content, 200
    except FileNotFoundError:
        logger.error('Frontend index.html not found at: %s', html_path)
        return jsonify({
            'status': 'running',
            'message': 'DevSecOps Flask API is operational (UI not found)',
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
            'message': 'All systems operational',
            'test_results': {
                'total': 6,
                'passed': 6,
                'failed': 0,
                'status': 'passed'
            }
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
                'path': '/',
                'description': 'Main Project Dashboard',
                'method': 'GET'
            },
            {
                'path': '/api/project',
                'description': 'Aggregated project information',
                'method': 'GET'
            },
            {
                'path': '/api/pipelines',
                'description': 'CI/CD pipeline metadata',
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


@app.route('/style.css')
def serve_css():
    """
    Serve the CSS file from frontend directory
    """
    return send_from_directory(FRONTEND_DIR, 'style.css')


@app.route('/script.js')
def serve_js():
    """
    Serve the JavaScript file from frontend directory
    """
    return send_from_directory(FRONTEND_DIR, 'script.js')



@app.route('/api/pipelines', methods=['GET'])
def list_pipelines():
    """
    Returns metadata for all CI/CD pipelines defined in the project.
    Lists the main pipeline plus the additional specialised pipelines.
    """
    return jsonify({
        'pipelines': [
            {
                'name': 'Main CI/CD Pipeline',
                'file': 'ci-cd.yaml',
                'triggers': ['push to main/develop', 'pull_request to main'],
                'jobs': ['test', 'sonar', 'build', 'deploy'],
                'description': 'Full pipeline: test → security scan → build → deploy'
            },
            {
                'name': 'PR Check Pipeline',
                'file': 'pr-check.yaml',
                'triggers': ['pull_request to main/develop'],
                'jobs': ['lint', 'test'],
                'description': 'Lightweight fast-feedback pipeline for pull requests'
            },
            {
                'name': 'Security Scan Pipeline',
                'file': 'security-scan.yaml',
                'triggers': ['push to main', 'nightly cron (02:00 UTC)'],
                'jobs': ['trivy-scan', 'sonar'],
                'description': 'Dedicated pipeline for container and code security scanning'
            },
            {
                'name': 'Release Pipeline',
                'file': 'release.yaml',
                'triggers': ['version tag (v*.*.*)'],
                'jobs': ['build-push', 'deploy'],
                'description': 'Triggered on version tags; builds, pushes Docker image, and deploys to Kubernetes'
            }
        ],
        'total': 4
    }), 200


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
