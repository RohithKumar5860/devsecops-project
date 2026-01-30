import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_home_page(client):
    """Test the root endpoint returns 200 and correct JSON structure."""
    response = client.get('/')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['status'] == 'success'
    assert 'message' in json_data

def test_health_check(client):
    """Test the health check endpoint for Kubernetes."""
    response = client.get('/health')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['status'] == 'healthy'
