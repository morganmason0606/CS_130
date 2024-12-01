from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import auth, credentials
from flask_cors import CORS
from firebase_admin import firestore

import data_helper
import recommender

cred = credentials.Certificate("./admin_credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)
CORS(app)


@app.route("/verify-token", methods=["POST"])
def verify_token():
    """Verifies request token
    /verify-tokens , POST with 'token' in request

    Returns:
        http repsonse: either has uid,200 or 401
    """
    token = request.json.get("token")
    try:
        decoded_token = auth.verify_id_token(token)
        return jsonify({"uid": decoded_token["uid"]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401


@app.route("/setup-user", methods=["POST"])
def setup_user():
    """helper function to set up user
    /setup-user, post, expect uid,firstName, lastName fields

    Returns:
        http response:200 Success, 401 Unauthorized
    """
    uid = request.json.get("uid")
    fn = request.json.get("firstName")
    ln = request.json.get("lastName")
    try:
        user_doc_ref = db.collection("users").document(uid)
        # if user_doc_ref.get().exists:
        #     return jsonify({"message": "User document already exists."}), 200
        data_helper.create_user_document(uid, fn, ln, db)
        return jsonify({"message": "User document created successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401


### CRUD for Exercises
@app.route("/users/<uid>/exercises", methods=["POST"])
def create_user_exercise(uid):
    """create exercise
    /users/<uid>/exercises; POST; expect exercise data in json

    Args:
        uid (str): uid

    Returns:
        http response: 201 with id field or 400
    """
    try:
        exercise_data = request.json
        exercise_id = data_helper.create_user_exercise(uid, exercise_data, db)
        return (
            jsonify({"message": "Exercise created successfully.", "id": exercise_id}),
            201,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/users/<uid>/exercises/<exercise_id>", methods=["GET"])
def read_user_exercise(uid, exercise_id):
    """route for getting a specific exercise
    /users/<uid>/exercises/<exercise_id>; GET
    Args:
        uid (str): user id
        exercise_id (str): exercise id

    Returns:
        http resposne: either 200, exercise response; or 404 or 400
    """
    try:
        exercise = data_helper.get_user_exercise(uid, exercise_id, db)
        if exercise:
            return jsonify(exercise), 200
        return jsonify({"error": "Exercise not found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/users/<uid>/exercises", methods=["GET"])
def read_all_user_exercises(uid):
    """reads all user exercises
    /users/<uid>/exercises, GET

    Args:
        uid (str): user id

    Returns:
        http response: 200, exercises; 400
    """
    try:
        exercises = data_helper.get_all_user_exercises(uid, db)
        return jsonify(exercises), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/users/<uid>/exercises/<exercise_id>", methods=["PUT"])
def update_user_exercise(uid, exercise_id):
    """updating a user's exercise data
    /users/<uid>/exercises/<exercise_id>; PUT; experct exercise data in json

    Args:
        uid (str): user id
        exercise_id (str): user id

    Returns:
        http response: 200 or 400
    """
    try:
        exercise_data = request.json
        data_helper.update_user_exercise(uid, exercise_id, exercise_data, db)
        return jsonify({"message": "Exercise updated successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/users/<uid>/exercises/<exercise_id>", methods=["DELETE"])
def delete_user_exercise(uid, exercise_id):
    """delete user exercise
    /users/<uid>/exercises/<exercise_id>; DELETE

    Args:
        uid (str): user id
        exercise_id (str): exercise_id

    Returns:
        http response: 200 or 400
    """
    try:
        data_helper.delete_user_exercise(uid, exercise_id, db)
        return jsonify({"message": "Exercise deleted successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/add-pain", methods=["POST"])
def add_pain():
    """add pain note
    /add-pain; post; body must include uid, date(YYYY-MM-DD), pain_level(1-10), body_part (see recommender ENUM)

    Returns:
        http response: 200 doc_id; 400 or 401
    """
    uid = request.json.get("uid")
    date = request.json.get("date")
    pain_level = request.json.get("pain_level")
    body_part = request.json.get("body_part")

    # Validate pain_level
    if not isinstance(pain_level, int) or pain_level < 1 or pain_level > 10:
        return (
            jsonify({"error": "Pain level must be an integer between 1 and 10."}),
            400,
        )

    collection_name = f"users/{uid}/pain"
    doc_data = {"date": date, "pain_level": pain_level, "body_part": body_part}
    try:
        doc_id = data_helper.create_document(collection_name, doc_data, db)
        return jsonify({"message": "Pain added successfully.", "hash_id": doc_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401


@app.route("/get-all-pain", methods=["POST"])
def get_all_pain():
    """get all pain notes
    /get-all-pain; POST; expects UID

    Returns:
        http response: 200 painlist; 401
    """
    uid = request.json.get("uid")
    collection_name = f"users/{uid}/pain"
    try:
        pain_docs = db.collection(collection_name).stream()
        pain_list = []
        for doc in pain_docs:
            pain_data = doc.to_dict()
            pain_data["hash_id"] = doc.id  # Include the document ID for reference
            pain_list.append(pain_data)
        return jsonify({"pain": pain_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401


@app.route("/edit-pain", methods=["POST"])
def edit_pain():
    """edit pain note
    /edit-pain; POST; uid, hash_id, date(YYYY-MM-DD), pain_level(1-10), body_part(see Recomender ENUM)

    Returns:
        http response:200; 400, 401, or 404
    """
    uid = request.json.get("uid")
    hash_id = request.json.get("hash_id")
    date = request.json.get("date")
    pain_level = request.json.get("pain_level")
    body_part = request.json.get("body_part")

    # Validate pain_level if provided
    if pain_level is not None and (
        not isinstance(pain_level, int) or pain_level < 1 or pain_level > 10
    ):
        return (
            jsonify({"error": "Pain level must be an integer between 1 and 10."}),
            400,
        )

    collection_name = f"users/{uid}/pain"
    try:
        pain_doc_ref = db.collection(collection_name).document(hash_id)
        if not pain_doc_ref.get().exists:
            return jsonify({"error": "Document not found."}), 404

        updates = {}
        if date:
            updates["date"] = date
        if pain_level:
            updates["pain_level"] = pain_level
        if body_part:
            updates["body_part"] = body_part

        pain_doc_ref.update(updates)
        return jsonify({"message": "Pain updated successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401


@app.route("/remove-pain", methods=["POST"])
def remove_pain():
    """remove pain note
    /remove-pain; POST; expect uid, hashid
    Returns:
        http response: 200; 404 or 401
    """
    uid = request.json.get("uid")
    hash_id = request.json.get("hash_id")
    collection_name = f"users/{uid}/pain"
    try:
        pain_doc_ref = db.collection(collection_name).document(hash_id)
        if not pain_doc_ref.get().exists:
            return jsonify({"error": "Document not found."}), 404

        pain_doc_ref.delete()
        return jsonify({"message": "Pain removed successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401


### CRUD for Workouts
@app.route("/users/<uid>/workouts", methods=["POST"])
def create_template(uid):
    """Create workout template
    /users/<uid>/workouts; POST; expect request body to be workout template data

    Args:
        uid (str): user id

    Returns:
        http reposnse: 201 with emplate id; or 400
    """
    try:
        template_data = request.json
        template_id = data_helper.create_template_workout(uid, template_data, db)
        return (
            jsonify(
                {"message": "Template workout created successfully.", "id": template_id}
            ),
            201,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/users/<uid>/workouts", methods=["GET"])
def read_all_templates(uid):
    """get all workouts
    /users/<uid>/workouts; GET

    Args:
        uid (str): user id

    Returns:
        http response: 200, templates; 400
    """
    try:
        templates = data_helper.get_all_template_workouts(uid, db)
        return jsonify(templates), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/users/<uid>/workouts/<template_id>", methods=["GET"])
def read_template(uid, template_id):
    """read a specific template
    /users/<uid>/workouts/<template_id>; GET

    Args:
        uid (str): user id
        template_id (str): template id

    Returns:
        http response: 200, remplate; 400 or 404
    """
    try:
        template = data_helper.get_template_workout(uid, template_id, db)
        if template:
            return jsonify(template), 200
        return jsonify({"error": "Template workout not found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/users/<uid>/workouts/<template_id>", methods=["PUT"])
def update_template(uid, template_id):
    """update workout template
    /users/<uid>/workouts/<template_id>; PUT: expect workout data as body

    Args:
        uid (str): user id
        template_id (str): template id

    Returns:
        http reponse: 200 or 400
    """
    try:
        template_data = request.json
        data_helper.update_template_workout(uid, template_id, template_data, db)
        return jsonify({"message": "Template workout updated successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/users/<uid>/workouts/<template_id>", methods=["DELETE"])
def delete_template(uid, template_id):
    """delete workout template
    /users/<uid>/workouts/<template_id>; DELETE
    Args:
        uid (str): user id
        template_id (str): template id

    Returns:
        http response: 200; 400
    """
    try:
        data_helper.delete_template_workout(uid, template_id, db)
        return (
            jsonify(
                {
                    "message": "Template workout and its completed workouts deleted successfully."
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/users/<uid>/workouts/<template_id>/completed", methods=["POST"])
def create_completed(uid, template_id):
    """Create completed instance of workout
    /users/<uid>/workouts/<template_id>/completed; POST; expect completed data in body
        Args:
            uid (str): user id
            template_id (str): workout_id

        Returns:
            http resonse: 201, completed id; 400
    """
    try:
        completed_data = request.json
        completed_id = data_helper.create_completed_workout(
            uid, template_id, completed_data, db
        )
        return (
            jsonify(
                {
                    "message": "Completed workout created successfully.",
                    "id": completed_id,
                }
            ),
            201,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route(
    "/users/<uid>/workouts/<template_id>/completed/<completed_id>", methods=["GET"]
)
def read_completed(uid, template_id, completed_id):
    """read specific completed workout id
    /users/<uid>/workouts/<template_id>/completed/<completed_id>; GET

    Args:
        uid (str): user id
        template_id (str): template id
        completed_id (str): completed id

    Returns:
        http response: 200, copmleted; 400, 404
    """
    try:
        completed = data_helper.get_completed_workout(
            uid, template_id, completed_id, db
        )
        if completed:
            return jsonify(completed), 200
        return jsonify({"error": "Completed workout not found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/users/<uid>/workouts/<template_id>/completed", methods=["GET"])
def read_all_completed(uid, template_id):
    """read all completed workouts of sepcific template
    /users/<uid>/workouts/<template_id>/completed; GET

    Args:
        uid (str): user id
        template_id (str): template id

    Returns:
        http response: 200 completed workouts; 400
    """
    try:
        completed_workouts = data_helper.get_all_completed_workouts(
            uid, template_id, db
        )
        return jsonify(completed_workouts), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/users/<uid>/workouts/ALL/completed", methods=["GET"])
def read_all_completed_all(uid):
    """read all completed workouts
    /users/<uid>/workouts/ALL/completed; GET

    Args:
        uid (str): user id

    Returns:
        http reponse:200, list of all completed workouts; 400
    """

    # Get all completed workouts for all templates
    try:
        completed_workouts = data_helper.get_all_completed_workouts_all(uid, db)
        return jsonify(completed_workouts), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route(
    "/users/<uid>/workouts/<template_id>/completed/<completed_id>", methods=["PUT"]
)
def update_completed(uid, template_id, completed_id):
    """update a completed workout
    /users/<uid>/workouts/<template_id>/completed/<completed_id>; PUT; expects body to have all of workout data

    Args:
        uid (str): user id
        template_id (str): template id
        completed_id (str): completed id

    Returns:
        http response: 200; 400
    """
    try:
        completed_data = request.json
        data_helper.update_completed_workout(
            uid, template_id, completed_id, completed_data, db
        )
        return jsonify({"message": "Completed workout updated successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route(
    "/users/<uid>/workouts/<template_id>/completed/<completed_id>", methods=["DELETE"]
)
def delete_completed(uid, template_id, completed_id):
    """delete a complteded workout
    /users/<uid>/workouts/<template_id>/completed/<completed_id>; DELETE

    Args:
        uid (str): user id
        template_id (str): template id
        completed_id (str): completed id

    Returns:
        http response: 200; 400
    """
    try:
        data_helper.delete_completed_workout(uid, template_id, completed_id, db)
        return jsonify({"message": "Completed workout deleted successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Recommender system
@app.route("/recommend/<uid>/exercise", methods=["POST"])
def get_recommended_exercise(uid):
    """get recommended exercise
    /recommend/<uid>/exercise; POST; body expects the list of exercises currently working on

    Args:
        uid (str): user id

    Returns:
        http : 200 with recommended focus, intenstiy; 400
    """
    try:
        curr_workout = request.get_json()
        curr_workout = [c for c in curr_workout if ("eid" in c and c["eid"])]
        recommendation = recommender.recommend_exercise(uid, curr_workout, db)
        return jsonify({"status": "success", **recommendation}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/recommend/workout/<part>", methods=["GET"])
def get_recommended_workout(part):
    """get recommended workout
    /recommend/workout/<part>; GET

    Args:
        part (str): 'arms, upper body, mid body, legs'

    Returns:
        http response: 200 recommended_workout; 400 or 404
    """
    try:
        rec_workout = recommender.recommend_workout(part, db)
        if rec_workout:
            return jsonify(rec_workout), 200
        return jsonify({"error": "recommended workout not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/users/<uid>/journals", methods=["POST"])
def create_journal(uid):
    """create journal id
    /users/<uid>/journals; POST; expect body to be journal note data

    Args:
        uid (str): user id

    Returns:
        http response: 201, journal id; 400
    """
    try:
        journal_data = request.json
        journal_id = data_helper.create_journal(uid, journal_data, db)
        return (
            jsonify({"message": "Journal created successfully.", "id": journal_id}),
            201,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/users/<uid>/journals", methods=["GET"])
def read_all_journals(uid):
    """get all journals
    /users/<uid>/journals; GET

    Args:
        uid (str): user id

    Returns:
        http response: 200, journal; 400
    """
    try:
        journals = data_helper.get_all_journals(uid, db)
        return jsonify(journals), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/users/<uid>/journals/<journal_id>", methods=["DELETE"])
def delete_journal(uid, journal_id):
    """delete journal
    /users/<uid>/journals/<journal_id>; DELETE

    Args:
        uid (str): user id
        journal_id (str): note id

    Returns:
        http response: 200; 400
    """
    try:
        data_helper.delete_journal(uid, journal_id, db)
        return jsonify({"message": "Journal deleted successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# medication notes have a name, dosage, and time
@app.route("/users/<uid>/medications", methods=["POST"])
def create_medication(uid):
    """create medicine note
    /users/<uid>/medications; POST: expect body to have all data

    Args:
        uid (str): user id

    Returns:
        http reponse: 201, note id; 400
    """
    try:
        medication_data = request.json
        medication_id = data_helper.create_medication(uid, medication_data, db)
        return (
            jsonify(
                {"message": "Medication created successfully.", "id": medication_id}
            ),
            201,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/users/<uid>/medications", methods=["GET"])
def read_all_medications(uid):
    """read all medicine notes
    /users/<uid>/medications; GET

    Args:
        uid (str): user id

    Returns:
        http respones: 200, medication notes; 400
    """
    try:
        medications = data_helper.get_all_medications(uid, db)
        return jsonify(medications), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/users/<uid>/medications/<medication_id>", methods=["DELETE"])
def delete_medication(uid, medication_id):
    """delete medication note
    /users/<uid>/medications/<medication_id>; DELETE


    Args:
        uid (str): user id
        medication_id (str): note id

    Returns:
        http response: 200; 400
    """
    try:
        data_helper.delete_medication(uid, medication_id, db)
        return jsonify({"message": "Medication deleted successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
