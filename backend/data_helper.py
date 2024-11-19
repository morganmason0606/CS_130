from google.cloud import firestore
from firebase_admin import credentials
from firebase_admin import firestore
from datetime import datetime
import google.cloud.firestore

def create_user_document(uid: str, firstName:str, lastName:str, db: google.cloud.firestore.Client):
    users_ref = db.collection('users')
    user_doc_ref = users_ref.document(uid)
    user_data = {
        'created_at': datetime.now(),
        'first_name':firstName,
        'last_name':lastName
    }
    user_doc_ref.set(user_data)
    print(f'Document for UID {uid} created successfully in users/{uid}')

    print(f"\tCopying global files")
    source_collection_path = "globals/exercises/premades"
    source_collection_ref = db.collection(source_collection_path)

    destination_collection_path = f"users/{uid}/exercises"
    destination_collection_ref = db.collection(destination_collection_path)
    copy_collection_recursive(source_collection_ref, destination_collection_ref, db)
    print('copied exercises')

    source_collection_path = "globals/workouts/premades"
    source_collection_ref = db.collection(source_collection_path)

    destination_collection_path = f"users/{uid}/workouts"
    destination_collection_ref = db.collection(destination_collection_path)
    copy_collection_recursive(source_collection_ref, destination_collection_ref, db)
    print('copied workouts')


def copy_collection_recursive(source_collection_ref, destination_collection_ref, db):
    try:
        for doc in source_collection_ref.stream():
            doc_id = doc.id
            doc_data = doc.to_dict()

            destination_doc_ref = destination_collection_ref.document(doc_id)
            destination_doc_ref.set(doc_data)

            for subcollection_name, subcollection_data in doc_data.items():
                if isinstance(subcollection_data, dict):
                    source_subcollection_ref = source_collection_ref.document(doc_id).collection(subcollection_name)
                    destination_subcollection_ref = destination_collection_ref.document(doc_id).collection(subcollection_name)
                    copy_collection_recursive(source_subcollection_ref, destination_subcollection_ref, db)
    except Exception as e:
        print(f"Error copying collection: {e}")
    



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
    """
    Create a new exercise for a specific user.
    :param uid: The unique identifier of the user.
    :param exercise_data: A dictionary containing the details of the exercise to be added (e.g., name, muscle group).
    :param db: Firestore client instance.
    :return: The ID of the newly created exercise document.
    """
    exercises_ref = db.collection('users').document(uid).collection('exercises')
    doc_ref = exercises_ref.add(exercise_data)
    print(f'Exercise created successfully for user {uid} with ID: {doc_ref[1].id}')
    return doc_ref[1].id

def get_user_exercise(uid: str, exercise_id: str, db: google.cloud.firestore.Client):
    """
    Retrieve details of a specific exercise for a user.
    :param uid: The unique identifier of the user.
    :param exercise_id: The unique identifier of the exercise to retrieve.
    :param db: Firestore client instance.
    :return: A dictionary containing the exercise details if found, otherwise None.
    """
    exercises_ref = db.collection('users').document(uid).collection('exercises').document(exercise_id)
    exercise = exercises_ref.get()
    if exercise.exists:
        return exercise.to_dict()
    return None

def update_user_exercise(uid: str, exercise_id: str, exercise_data: dict, db: google.cloud.firestore.Client):
    """
    Update the details of an existing exercise for a specific user.
    :param uid: The unique identifier of the user.
    :param exercise_id: The unique identifier of the exercise to update.
    :param exercise_data: A dictionary containing the updated exercise details.
    :param db: Firestore client instance.
    """
    exercises_ref = db.collection('users').document(uid).collection('exercises').document(exercise_id)
    exercises_ref.update(exercise_data)
    print(f'Exercise with ID {exercise_id} updated successfully for user {uid}.')

def delete_user_exercise(uid: str, exercise_id: str, db: google.cloud.firestore.Client):
    """
    Delete a specific exercise for a user.
    :param uid: The unique identifier of the user.
    :param exercise_id: The unique identifier of the exercise to delete.
    :param db: Firestore client instance.
    """
    exercises_ref = db.collection('users').document(uid).collection('exercises').document(exercise_id)
    exercises_ref.delete()
    print(f'Exercise with ID {exercise_id} deleted successfully for user {uid}.')

### CRUD for Workouts
def create_template_workout(uid: str, template_data: dict, db: google.cloud.firestore.Client):
    """
    Create a new template workout.
    :param uid: User ID
    :param template_data: Template workout data (e.g., list of exercises)
    :param db: Firestore client
    """
    workouts_ref = db.collection('users').document(uid).collection('workouts')
    doc_ref = workouts_ref.add(template_data)
    print(f'Template workout created successfully for user {uid} with ID: {doc_ref[1].id}')
    return doc_ref[1].id

def get_template_workout(uid: str, template_id: str, db: google.cloud.firestore.Client):
    """
    Retrieve a specific template workout.
    :param uid: User ID
    :param template_id: Template ID
    :param db: Firestore client
    """
    workouts_ref = db.collection('users').document(uid).collection('workouts').document(template_id)
    template = workouts_ref.get()
    if template.exists:
        return template.to_dict()
    return None

def update_template_workout(uid: str, template_id: str, template_data: dict, db: google.cloud.firestore.Client):
    """
    Update a template workout.
    :param uid: User ID
    :param template_id: Template ID
    :param template_data: Updated template data
    :param db: Firestore client
    """
    workouts_ref = db.collection('users').document(uid).collection('workouts').document(template_id)
    workouts_ref.update(template_data)
    print(f'Template workout {template_id} updated successfully for user {uid}.')

def delete_template_workout(uid: str, template_id: str, db: google.cloud.firestore.Client):
    """
    Delete a template workout and its completed workouts.
    :param uid: User ID
    :param template_id: Template ID
    :param db: Firestore client
    """
    workouts_ref = db.collection('users').document(uid).collection('workouts').document(template_id)
    completed_ref = workouts_ref.collection('Completed_workouts')
    completed_docs = completed_ref.stream()
    for doc in completed_docs:
        doc.reference.delete()
    workouts_ref.delete()
    print(f'Template workout {template_id} and its completed workouts deleted successfully for user {uid}.')

def create_completed_workout(uid: str, template_id: str, completed_data: dict, db: google.cloud.firestore.Client):
    """
    Create a new completed workout under a template.
    :param uid: User ID
    :param template_id: Template ID
    :param completed_data: Completed workout data
    :param db: Firestore client
    """
    completed_ref = db.collection('users').document(uid).collection('workouts').document(template_id).collection('completed')
    doc_ref = completed_ref.add(completed_data)
    print(f'Completed workout created successfully for user {uid} under template {template_id} with ID: {doc_ref[1].id}')
    return doc_ref[1].id

def get_completed_workout(uid: str, template_id: str, completed_id: str, db: google.cloud.firestore.Client):
    """
    Retrieve a specific completed workout.
    :param uid: User ID
    :param template_id: Template ID
    :param completed_id: Completed workout ID
    :param db: Firestore client
    """
    completed_ref = db.collection('users').document(uid).collection('workouts').document(template_id).collection('completed').document(completed_id)
    completed = completed_ref.get()
    if completed.exists:
        return completed.to_dict()
    return None

def update_completed_workout(uid: str, template_id: str, completed_id: str, completed_data: dict, db: google.cloud.firestore.Client):
    """
    Update a completed workout.
    :param uid: User ID
    :param template_id: Template ID
    :param completed_id: Completed workout ID
    :param completed_data: Updated completed workout data
    :param db: Firestore client
    """
    completed_ref = db.collection('users').document(uid).collection('workouts').document(template_id).collection('completed').document(completed_id)
    completed_ref.update(completed_data)
    print(f'Completed workout {completed_id} updated successfully for user {uid} under template {template_id}.')

def delete_completed_workout(uid: str, template_id: str, completed_id: str, db: google.cloud.firestore.Client):
    """
    Delete a specific completed workout.
    :param uid: User ID
    :param template_id: Template ID
    :param completed_id: Completed workout ID
    :param db: Firestore client
    """
    completed_ref = db.collection('users').document(uid).collection('workouts').document(template_id).collection('completed').document(completed_id)
    completed_ref.delete()
    print(f'Completed workout {completed_id} deleted successfully for user {uid} under template {template_id}.')