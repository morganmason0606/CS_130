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

### Pain API Tests
def test_add_pain(client):
    response = client.post('/add-pain', json={
        "uid": USER_DOCUMENT_NAME,
        "date": "2024-11-30",
        "pain_level": 7,
        "body_part": "lower back"
    })
    assert response.status_code == 200
    assert "hash_id" in response.json

def test_add_pain_invalid_level(client):
    response = client.post('/add-pain', json={
        "uid": USER_DOCUMENT_NAME,
        "date": "2024-11-30",
        "pain_level": 15,  # Invalid pain level
        "body_part": "lower back"
    })
    assert response.status_code == 400
    assert "error" in response.json

def test_get_all_pain(client):
    # First, add a pain entry
    client.post('/add-pain', json={
        "uid": USER_DOCUMENT_NAME,
        "date": "2024-11-30",
        "pain_level": 7,
        "body_part": "lower back"
    })

    # Then, retrieve all pain entries
    response = client.post('/get-all-pain', json={"uid": USER_DOCUMENT_NAME})
    assert response.status_code == 200
    assert "pain" in response.json
    assert len(response.json["pain"]) > 0

def test_edit_pain(client):
    # First, add a pain entry
    add_response = client.post('/add-pain', json={
        "uid": USER_DOCUMENT_NAME,
        "date": "2024-11-30",
        "pain_level": 7,
        "body_part": "lower back"
    })
    hash_id = add_response.json["hash_id"]

    # Then, edit the pain entry
    response = client.post('/edit-pain', json={
        "uid": USER_DOCUMENT_NAME,
        "hash_id": hash_id,
        "pain_level": 5
    })
    assert response.status_code == 200

    # Verify the update
    get_response = client.post('/get-all-pain', json={"uid": USER_DOCUMENT_NAME})
    updated_pain = next((p for p in get_response.json["pain"] if p["hash_id"] == hash_id), None)
    assert updated_pain is not None
    assert updated_pain["pain_level"] == 5

def test_remove_pain(client):
    # First, add a pain entry
    add_response = client.post('/add-pain', json={
        "uid": USER_DOCUMENT_NAME,
        "date": "2024-11-30",
        "pain_level": 7,
        "body_part": "lower back"
    })
    hash_id = add_response.json["hash_id"]

    # Then, remove the pain entry
    response = client.post('/remove-pain', json={
        "uid": USER_DOCUMENT_NAME,
        "hash_id": hash_id
    })
    assert response.status_code == 200

    # Verify the removal
    get_response = client.post('/get-all-pain', json={"uid": USER_DOCUMENT_NAME})
    removed_pain = next((p for p in get_response.json["pain"] if p["hash_id"] == hash_id), None)
    assert removed_pain is None

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

def test_delete_medication(client):
    # First, create the medication
    create_response = client.post(f"/users/{USER_DOCUMENT_NAME}/medications", json={"name": "Ibuprofen", "dosage": "200mg", "time": "morning"})
    medication_id = create_response.json["id"]
    
    # Then, delete the medication
    response = client.delete(f"/users/{USER_DOCUMENT_NAME}/medications/{medication_id}")
    assert response.status_code == 200