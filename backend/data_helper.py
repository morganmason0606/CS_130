from google.cloud import firestore
from firebase_admin import credentials
from firebase_admin import firestore
from datetime import datetime
import google.cloud.firestore

def create_user_document(uid: str, db: google.cloud.firestore.Client):
    users_ref = db.collection('users')
    user_doc_ref = users_ref.document(uid)
    user_data = {
        'created_at': datetime.now(),
    }
    user_doc_ref.set(user_data)
    print(f'Document for UID {uid} created successfully in users/{uid}.')

def get_user_document(uid: str, db: google.cloud.firestore.Client):
    user_doc_ref = db.collection('users').document(uid)
    user_doc = user_doc_ref.get()
    if user_doc.exists:
        return user_doc.to_dict()
    return None

def create_document(collection_name: str, doc_data: dict, db: google.cloud.firestore.Client):
    collection_ref = db.collection(collection_name)
    _, doc_ref = collection_ref.add(doc_data)
    print(f'Document created successfully in {collection_name}/{doc_ref.id}.')
    return doc_ref.id

def edit_document(collection_name: str, doc_id: str, doc_data: dict, db: google.cloud.firestore.Client):
    doc_ref = db.collection(collection_name).document(doc_id)
    doc_ref.update(doc_data)
    print(f'Document updated successfully in {collection_name}/{doc_id}.')

### CRUD for Exercises
def create_user_exercise(uid: str, exercise_data: dict, db: google.cloud.firestore.Client):
    exercises_ref = db.collection('users').document(uid).collection('exercises')
    doc_ref = exercises_ref.add(exercise_data)
    print(f'Exercise created successfully for user {uid} with ID: {doc_ref[1].id}')
    return doc_ref[1].id

def get_user_exercise(uid: str, exercise_id: str, db: google.cloud.firestore.Client):
    exercises_ref = db.collection('users').document(uid).collection('exercises').document(exercise_id)
    exercise = exercises_ref.get()
    if exercise.exists:
        return exercise.to_dict()
    return None

def update_user_exercise(uid: str, exercise_id: str, exercise_data: dict, db: google.cloud.firestore.Client):
    exercises_ref = db.collection('users').document(uid).collection('exercises').document(exercise_id)
    exercises_ref.update(exercise_data)
    print(f'Exercise with ID {exercise_id} updated successfully for user {uid}.')

def delete_user_exercise(uid: str, exercise_id: str, db: google.cloud.firestore.Client):
    exercises_ref = db.collection('users').document(uid).collection('exercises').document(exercise_id)
    exercises_ref.delete()
    print(f'Exercise with ID {exercise_id} deleted successfully for user {uid}.')