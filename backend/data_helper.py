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
