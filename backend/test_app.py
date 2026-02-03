"""
Unit tests for Flask Backend API
"""

import pytest
import json
from app import app


@pytest.fixture
def client():
    """
    Create a test client for the Flask application
    """
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_index_endpoint(client):
    """
    Test the root endpoint returns correct status
    """
    response = client.get('/')
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert data['status'] == 'running'
    assert 'version' in data
    assert 'message' in data


def test_health_endpoint(client):
    """
    Test the health check endpoint
    """
    response = client.get('/health')
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert data['status'] == 'healthy'
    assert 'environment' in data
    assert 'service' in data


def test_api_info_endpoint(client):
    """
    Test the API info endpoint
    """
    response = client.get('/api/info')
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert 'app_name' in data
    assert 'environment' in data
    assert 'version' in data
    assert data['status'] == 'operational'


def test_404_error(client):
    """
    Test 404 error handling
    """
    response = client.get('/nonexistent')
    assert response.status_code == 404
    
    data = json.loads(response.data)
    assert data['error'] == 'Not Found'


def test_response_content_type(client):
    """
    Test that all endpoints return JSON
    """
    endpoints = ['/', '/health', '/api/info']
    
    for endpoint in endpoints:
        response = client.get(endpoint)
        assert response.content_type == 'application/json'
