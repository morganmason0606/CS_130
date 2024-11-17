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

### CRUD for Exercises
@app.route('/users/<uid>/exercises', methods=['POST'])
def create_user_exercise(uid):
    try:
        exercise_data = request.json
        exercise_id = data_helper.create_user_exercise(uid, exercise_data, db)
        return jsonify({"message": "Exercise created successfully.", "id": exercise_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/users/<uid>/exercises/<exercise_id>', methods=['GET'])
def read_user_exercise(uid, exercise_id):
    try:
        exercise = data_helper.get_user_exercise(uid, exercise_id, db)
        if exercise:
            return jsonify(exercise), 200
        return jsonify({"error": "Exercise not found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/users/<uid>/exercises/<exercise_id>', methods=['PUT'])
def update_user_exercise(uid, exercise_id):
    try:
        exercise_data = request.json
        data_helper.update_user_exercise(uid, exercise_id, exercise_data, db)
        return jsonify({"message": "Exercise updated successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/users/<uid>/exercises/<exercise_id>', methods=['DELETE'])
def delete_user_exercise(uid, exercise_id):
    try:
        data_helper.delete_user_exercise(uid, exercise_id, db)
        return jsonify({"message": "Exercise deleted successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
