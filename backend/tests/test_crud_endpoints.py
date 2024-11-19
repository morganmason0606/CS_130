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

def test_read_exercise(client):
    # First, create the exercise
    create_response = client.post(f"/users/{USER_DOCUMENT_NAME}/exercises", json={"name": "Push-Up", "muscle": "Chest"})
    exercise_id = create_response.json["id"]

    # Then, read the exercise
    response = client.get(f"/users/{USER_DOCUMENT_NAME}/exercises/{exercise_id}")
    assert response.status_code == 200
    assert response.json["name"] == "Push-Up"

def test_update_exercise(client):
    # First, create the exercise
    create_response = client.post(f"/users/{USER_DOCUMENT_NAME}/exercises", json={"name": "Push-Up", "muscle": "Chest"})
    exercise_id = create_response.json["id"]

    # Then, update the exercise
    response = client.put(f"/users/{USER_DOCUMENT_NAME}/exercises/{exercise_id}", json={"name": "Modified Push-Up"})
    assert response.status_code == 200

    # Verify the update
    response = client.get(f"/users/{USER_DOCUMENT_NAME}/exercises/{exercise_id}")
    assert response.json["name"] == "Modified Push-Up"