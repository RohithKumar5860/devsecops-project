"""
Unit tests for Flask Backend API
"""

import pytest
import json
import os


@pytest.fixture
def client():
    """
    Create a test client for the Flask application.
    APP_ENV is always 'development' in tests (set in conftest.py),
    so the module-level fail-fast validation auto-generates an ephemeral key.
    """
    from app import app as flask_app
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as client:
        yield client


def test_index_endpoint(client):
    """
    Test the root endpoint returns HTML dashboard
    """
    response = client.get('/')
    assert response.status_code == 200

    # The root endpoint serves HTML, not JSON
    assert response.content_type == 'text/html; charset=utf-8'
    # Check that it contains HTML content
    assert b'<!DOCTYPE html>' in response.data or b'<html' in response.data


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
    Test the API info endpoint returns required fields per spec
    """
    response = client.get('/api/info')
    assert response.status_code == 200

    data = json.loads(response.data)
    # Required fields per spec
    assert 'version' in data
    assert 'environment' in data
    assert data['version'] == '1.0.0'
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
    Test that API endpoints return JSON
    """
    # Only test JSON endpoints (exclude / which serves HTML)
    endpoints = ['/health', '/api/info']

    for endpoint in endpoints:
        response = client.get(endpoint)
        assert response.content_type == 'application/json'


def test_pipelines_endpoint(client):
    """
    Test the pipelines listing endpoint returns all registered pipelines
    """
    response = client.get('/api/pipelines')
    assert response.status_code == 200

    data = json.loads(response.data)
    assert 'pipelines' in data
    assert 'total' in data
    assert isinstance(data['pipelines'], list)
    assert len(data['pipelines']) == data['total']

    for pipeline in data['pipelines']:
        assert 'name' in pipeline
        assert 'file' in pipeline
        assert 'triggers' in pipeline
        assert 'jobs' in pipeline
        assert 'description' in pipeline
