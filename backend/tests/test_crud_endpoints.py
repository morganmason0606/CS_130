import pytest
from app import app
import firebase_admin
from firebase_admin import credentials, firestore

USER_DOCUMENT_NAME = "auto_test"

if not firebase_admin._apps:
    cred = credentials.Certificate("../admin_credentials.json")
    firebase_admin.initialize_app(cred)
    
db = firestore.client()

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

@pytest.fixture(autouse=True, scope="session")
def setup_and_teardown_user():
    # Setup: Create the user once at the start of the session
    user_doc_ref = db.collection("users").document(USER_DOCUMENT_NAME)
    user_doc_ref.set({"test_field": "test_value"})
    print(f"Document '{USER_DOCUMENT_NAME}' created.")

    yield

    # Teardown: Delete the user once at the end of the session
    try:
        if user_doc_ref.get().exists:
            print(f"Cleaning up user document: {USER_DOCUMENT_NAME}")
            delete_document_and_subcollections(user_doc_ref)
    except Exception as e:
        print(f"Error during cleanup: {e}")

def delete_document_and_subcollections(doc_ref):
    # Helper function to recursively delete a document and its subcollections
    print(f"Deleting document: {doc_ref.id}")
    for collection in doc_ref.collections():
        print(f"Deleting subcollection: {collection.id}")
        for doc in collection.stream():
            print(f"Deleting document in subcollection {collection.id}: {doc.id}")
            delete_document_and_subcollections(doc.reference)  # Recursive call
    doc_ref.delete()
    print(f"Deleted document: {doc_ref.id}")

### Exercise CRUD API tests

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

def test_delete_exercise(client):
    # First, create the exercise
    create_response = client.post(f"/users/{USER_DOCUMENT_NAME}/exercises", json={"name": "Push-Up", "muscle": "Chest"})
    exercise_id = create_response.json["id"]

    # Then, delete the exercise
    response = client.delete(f"/users/{USER_DOCUMENT_NAME}/exercises/{exercise_id}")
    assert response.status_code == 200

    # Verify the deletion
    response = client.get(f"/users/{USER_DOCUMENT_NAME}/exercises/{exercise_id}")
    assert response.status_code == 404

### Workout template CRUD API tests

def test_create_template(client):
    response = client.post(f"/users/{USER_DOCUMENT_NAME}/workouts", json={"name": "Morning Routine"})
    assert response.status_code == 201
    assert "id" in response.json

def test_read_template(client):
    # First, create the template
    create_response = client.post(f"/users/{USER_DOCUMENT_NAME}/workouts", json={"name": "Morning Routine"})
    template_id = create_response.json["id"]

    # Then, read the template
    response = client.get(f"/users/{USER_DOCUMENT_NAME}/workouts/{template_id}")
    assert response.status_code == 200
    assert response.json["name"] == "Morning Routine"

def test_update_template(client):
    # First, create the template
    create_response = client.post(f"/users/{USER_DOCUMENT_NAME}/workouts", json={"name": "Morning Routine"})
    template_id = create_response.json["id"]

    # Then, update the template
    response = client.put(f"/users/{USER_DOCUMENT_NAME}/workouts/{template_id}", json={"name": "Modified Routine"})
    assert response.status_code == 200

    # Verify the update
    response = client.get(f"/users/{USER_DOCUMENT_NAME}/workouts/{template_id}")
    assert response.json["name"] == "Modified Routine"

def test_delete_template(client):
    # First, create the template
    create_response = client.post(f"/users/{USER_DOCUMENT_NAME}/workouts", json={"name": "Morning Routine"})
    template_id = create_response.json["id"]

    # Then, delete the template
    response = client.delete(f"/users/{USER_DOCUMENT_NAME}/workouts/{template_id}")
    assert response.status_code == 200

    # Verify the deletion
    response = client.get(f"/users/{USER_DOCUMENT_NAME}/workouts/{template_id}")
    assert response.status_code == 404

### Workout template's completed workouts CRUD API tests

def test_create_completed_workout(client):
    # First, create the template
    create_response = client.post(f"/users/{USER_DOCUMENT_NAME}/workouts", json={"name": "Morning Routine"})
    template_id = create_response.json["id"]

    # Then, add a completed workout
    response = client.post(f"/users/{USER_DOCUMENT_NAME}/workouts/{template_id}/completed", json={"notes": "Great session!"})
    assert response.status_code == 201
    assert "id" in response.json

def test_read_completed_workout(client):
    # First, create the template and completed workout
    create_response = client.post(f"/users/{USER_DOCUMENT_NAME}/workouts", json={"name": "Morning Routine"})
    template_id = create_response.json["id"]

    completed_response = client.post(f"/users/{USER_DOCUMENT_NAME}/workouts/{template_id}/completed", json={"notes": "Great session!"})
    completed_id = completed_response.json["id"]

    # Then, read the completed workout
    response = client.get(f"/users/{USER_DOCUMENT_NAME}/workouts/{template_id}/completed/{completed_id}")
    assert response.status_code == 200
    assert response.json["notes"] == "Great session!"

def test_update_completed_workout(client):
    # First, create the template and completed workout
    create_response = client.post(f"/users/{USER_DOCUMENT_NAME}/workouts", json={"name": "Morning Routine"})
    template_id = create_response.json["id"]

    completed_response = client.post(f"/users/{USER_DOCUMENT_NAME}/workouts/{template_id}/completed", json={"notes": "Great session!"})
    completed_id = completed_response.json["id"]

    # Then, update the completed workout
    response = client.put(f"/users/{USER_DOCUMENT_NAME}/workouts/{template_id}/completed/{completed_id}", json={"notes": "Updated notes"})
    assert response.status_code == 200

    # Verify the update
    response = client.get(f"/users/{USER_DOCUMENT_NAME}/workouts/{template_id}/completed/{completed_id}")
    assert response.json["notes"] == "Updated notes"

def test_delete_completed_workout(client):
    # First, create the template and completed workout
    create_response = client.post(f"/users/{USER_DOCUMENT_NAME}/workouts", json={"name": "Morning Routine"})
    template_id = create_response.json["id"]

    completed_response = client.post(f"/users/{USER_DOCUMENT_NAME}/workouts/{template_id}/completed", json={"notes": "Great session!"})
    completed_id = completed_response.json["id"]

    # Then, delete the completed workout
    response = client.delete(f"/users/{USER_DOCUMENT_NAME}/workouts/{template_id}/completed/{completed_id}")
    assert response.status_code == 200

    # Verify the deletion
    response = client.get(f"/users/{USER_DOCUMENT_NAME}/workouts/{template_id}/completed/{completed_id}")
    assert response.status_code == 404

def test_read_all_completed_all(client):
    response = client.get(f"/users/{USER_DOCUMENT_NAME}/workouts/ALL/completed")
    assert response.status_code == 200

### Journal API Tests
def test_create_journal(client):
    response = client.post(f"/users/{USER_DOCUMENT_NAME}/journals", json={"title": "My Journal", "content": "Daily log"})
    assert response.status_code == 201
    assert "id" in response.json

def test_read_all_journals(client):
    response = client.get(f"/users/{USER_DOCUMENT_NAME}/journals")
    assert response.status_code == 200

def test_delete_journal(client):
    # First, create the journal
    create_response = client.post(f"/users/{USER_DOCUMENT_NAME}/journals", json={"title": "My Journal", "content": "Daily log"})
    journal_id = create_response.json["id"]
    
    # Then, delete the journal
    response = client.delete(f"/users/{USER_DOCUMENT_NAME}/journals/{journal_id}")
    assert response.status_code == 200

### Medication API Tests
def test_create_medication(client):
    response = client.post(f"/users/{USER_DOCUMENT_NAME}/medications", json={"name": "Ibuprofen", "dosage": "200mg", "time": "morning"})
    assert response.status_code == 201
    assert "id" in response.json

def test_read_all_medications(client):
    response = client.get(f"/users/{USER_DOCUMENT_NAME}/medications")
    assert response.status_code == 200