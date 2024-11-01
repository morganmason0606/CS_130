from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import auth, credentials
from flask_cors import CORS

cred = credentials.Certificate('./admin_credentials.json')
firebase_admin.initialize_app(cred)

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
