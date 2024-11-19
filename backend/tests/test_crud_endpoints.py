import pytest
from app import app

USER_DOCUMENT_NAME = "auto_test"

@pytest.fixture
def client():
    # Use Flask's test client for making requests to the app
    with app.test_client() as client:
        yield client

def test_create_exercise(client):
    response = client.post(f"/users/{USER_DOCUMENT_NAME}/exercises", json={"name": "Push-Up", "muscle": "Chest"})
    assert response.status_code == 201
    assert "id" in response.json

