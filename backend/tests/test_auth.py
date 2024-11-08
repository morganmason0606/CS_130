import pytest
from flask import Flask
from firebase_admin import auth
from app import app

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

def test_verify_token_success(client, mocker):
    # Mock the auth.verify_id_token to return a mock user UID
    mock_decoded_token = {"uid": "test_uid"}
    mocker.patch.object(auth, 'verify_id_token', return_value=mock_decoded_token)

    response = client.post('/verify-token', json={'token': 'valid_token'})
    assert response.status_code == 200
    assert response.json == {"uid": "test_uid"}

def test_verify_token_invalid_token(client, mocker):
    # Mock the auth.verify_id_token to raise an exception for an invalid token
    mocker.patch.object(auth, 'verify_id_token', side_effect=Exception("Invalid token"))

    response = client.post('/verify-token', json={'token': 'invalid_token'})
    assert response.status_code == 401
    assert "error" in response.json
    assert response.json["error"] == "Invalid token"

def test_verify_token_missing_token(client):
    # No token provided in the request body
    response = client.post('/verify-token', json={})
    assert response.status_code == 401
    assert "error" in response.json
