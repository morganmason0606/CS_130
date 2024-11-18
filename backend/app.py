from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import auth, credentials
from flask_cors import CORS
from firebase_admin import firestore
import data_helper

cred = credentials.Certificate('./admin_credentials.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)
CORS(app)

@app.route('/verify-token', methods=['POST'])
def verify_token():
    token = request.json.get('token')
    try:
        decoded_token = auth.verify_id_token(token)
        return jsonify({"uid": decoded_token['uid']}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route('/setup-user', methods=['POST'])
def setup_user():
    uid = request.json.get('uid')
    try:
        user_doc_ref = db.collection('users').document(uid)
        if user_doc_ref.get().exists:
            return jsonify({"message": "User document already exists."}), 200

        data_helper.create_user_document(uid, db)
        return jsonify({"message": "User document created successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route('/add-pain', methods=['POST'])
def add_pain():
    uid = request.json.get('uid')
    date = request.json.get('date')
    pain_level = request.json.get('pain_level')
    body_part = request.json.get('body_part')

    # Validate pain_level
    if not isinstance(pain_level, int) or pain_level < 1 or pain_level > 10:
        return jsonify({"error": "Pain level must be an integer between 1 and 10."}), 400

    collection_name = f"users/{uid}/pain"
    doc_data = {
        'date': date,
        'pain_level': pain_level,
        'body_part': body_part
    }
    try:
        doc_id = data_helper.create_document(collection_name, doc_data, db)
        return jsonify({"message": "Pain added successfully.", "hash_id": doc_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route('/get-all-pain', methods=['POST'])
def get_all_pain():
    uid = request.json.get('uid')
    collection_name = f"users/{uid}/pain"
    try:
        pain_docs = db.collection(collection_name).stream()
        pain_list = []
        for doc in pain_docs:
            pain_data = doc.to_dict()
            pain_data['hash_id'] = doc.id  # Include the document ID for reference
            pain_list.append(pain_data)
        return jsonify({"pain": pain_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route('/edit-pain', methods=['POST'])
def edit_pain():
    uid = request.json.get('uid')
    hash_id = request.json.get('hash_id')
    date = request.json.get('date')
    pain_level = request.json.get('pain_level')
    body_part = request.json.get('body_part')

    # Validate pain_level if provided
    if pain_level is not None and (not isinstance(pain_level, int) or pain_level < 1 or pain_level > 10):
        return jsonify({"error": "Pain level must be an integer between 1 and 10."}), 400

    collection_name = f"users/{uid}/pain"
    try:
        pain_doc_ref = db.collection(collection_name).document(hash_id)
        if not pain_doc_ref.get().exists:
            return jsonify({"error": "Document not found."}), 404

        updates = {}
        if date:
            updates['date'] = date
        if pain_level:
            updates['pain_level'] = pain_level
        if body_part:
            updates['body_part'] = body_part

        pain_doc_ref.update(updates)
        return jsonify({"message": "Pain updated successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route('/remove-pain', methods=['POST'])
def remove_pain():
    uid = request.json.get('uid')
    hash_id = request.json.get('hash_id')
    collection_name = f"users/{uid}/pain"
    try:
        pain_doc_ref = db.collection(collection_name).document(hash_id)
        if not pain_doc_ref.get().exists:
            return jsonify({"error": "Document not found."}), 404

        pain_doc_ref.delete()
        return jsonify({"message": "Pain removed successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
