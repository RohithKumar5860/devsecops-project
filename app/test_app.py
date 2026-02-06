import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_home_page(client):
    """Test the root endpoint returns 200 and HTML content."""
    response = client.get('/')
    assert response.status_code == 200
    assert b'<!DOCTYPE html>' in response.data
    assert b'DevSecOps Project Dashboard' in response.data

def test_api_health_check(client):
    """Test the API health check endpoint for Kubernetes."""
    response = client.get('/api/health')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['status'] == 'healthy'

def test_api_data(client):
    """Test the aggregated data endpoint returns complete project info."""
    response = client.get('/api/data')
    assert response.status_code == 200
    json_data = response.get_json()
    
    # Verify structure
    assert 'metadata' in json_data
    assert 'status' in json_data
    assert 'devsecops_components' in json_data
    assert 'endpoints' in json_data
    
    # Verify metadata
    assert json_data['metadata']['name'] == 'DevSecOps CI/CD Application'
    assert 'environment' in json_data['metadata']
    
    # Verify status
    assert json_data['status']['application'] == 'running'
    assert json_data['status']['health'] == 'healthy'
