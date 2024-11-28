from google.cloud import firestore
from firebase_admin import credentials
from firebase_admin import firestore
import google.cloud.firestore

from datetime import datetime, timedelta
import heapq

ABS = "Abs"
BACK = "Back"
BICEPS = "Biceps"
CHEST = "Chest"
FOREARMS = "Forearms"
GLUTES = "Glutes"
HAMSTRINGS = "Hamstrings"
QUADRICEPS = "Quadriceps"
SHOULDERS = "Shoulders"
TRAPS = "Traps"
TRICEPS = "Triceps"
muscles = [
    ABS,
    BACK,
    BICEPS,
    CHEST,
    FOREARMS,
    GLUTES,
    HAMSTRINGS,
    QUADRICEPS,
    SHOULDERS,
    TRAPS,
    TRICEPS,
]


def get_intensity(recent_pain, to_recommend):
    note = next((n for n in recent_pain if n["body_part"] == to_recommend), None)
    if note:
        if note["pain_level"] <= 3:
            return "higher"
        elif note["pain_level"] >= 7:
            return "lower"
        else:
            return "same"
    else:
        return "same"


def recommend_exercise(uid: str, curr_workout, db: google.cloud.firestore.Client):
    # curworkout: list({eid, name, sets, reps, weight})

    # get information about exercises in current workout
    collection_ref = db.collection("users").document(uid).collection("exercises")
    exercise_info = dict()

    for exer in curr_workout:
        if not('eid' in exer and exer['eid']):
            continue
        doc = collection_ref.document(exer["eid"]).get()
        if doc.exists:
            exercise_info[exer["eid"]] = doc.to_dict()
        else:
            print(f"Document {exer['eid']} not found", flush=True)

    # print(exercise_info, flush=True)

    # get information about pain in past week
    date_format = "%Y-%m-%d"
    one_week_ago = datetime.now() - timedelta(7)

    collection_ref = db.collection("users").document(uid).collection("pain")

    docs = collection_ref.stream()
    recent_pain = []
    for pain_doc in docs:
        doc_dict = pain_doc.to_dict()
        if not (
            "date" in doc_dict and "body_part" in doc_dict and "pain_level" in doc_dict
        ):
            continue
        else:
            converted_date = datetime.strptime(doc_dict["date"], date_format)
            if converted_date >= one_week_ago:
                recent_pain.append(doc_dict)
    recent_pain.sort(key=lambda e: e["date"])
    print(recent_pain, flush=True)

    # get exercise recommendation
    # we will look at the types of exercises they are doing to predict the workout
    # then from those groups we will suggest the least done exercise of them
    # finally we will  query notes to decide if they should
    worked = dict(zip(muscles, [0 for _ in muscles]))
    for exer in curr_workout:
        muscle = exercise_info[exer["eid"]]["muscle"]
        worked[muscle] += 1

    # if arms
    arms = worked[BICEPS] + worked[FOREARMS] + worked[SHOULDERS] + worked[TRICEPS]

    # if mid body
    midbody = (
        worked[ABS] + worked[BACK] + worked[CHEST] + worked[TRAPS]
    )

    # if upper body
    upper_body = arms + midbody

    # if legs
    legs = worked[GLUTES] + worked[HAMSTRINGS] + worked[QUADRICEPS]

    maj_needed = len(curr_workout) // 2 + 1

    to_recommend = ""
    intensity = ""
    if arms >= maj_needed:
        # to_recommend = "arms"
        arm_muscles = [BICEPS, TRICEPS, SHOULDERS, FOREARMS]
        curr_counts = [worked[m] for m in arm_muscles]
        min_ind = curr_counts.index(min(curr_counts))
        to_recommend = arm_muscles[min_ind]

    elif midbody >= maj_needed:
        to_recommend = "mid"
        mid_muscles = [ BACK, CHEST, TRAPS, ABS]
        curr_counts = [worked[m] for m in mid_muscles]
        min_ind = curr_counts.index(min(curr_counts))
        to_recommend = mid_muscles[min_ind]

    elif upper_body >= maj_needed:
        # to_recommend = "upper"
        upper_body_muscles = [BICEPS,TRICEPS,SHOULDERS,BACK,CHEST,TRAPS,SHOULDERS,ABS,FOREARMS,]
        curr_counts = [worked[m] for m in upper_body_muscles]
        min_ind = curr_counts.index(min(curr_counts))
        to_recommend = upper_body_muscles[min_ind]

    elif legs >= maj_needed:
        
        # to_recommend = "legs"
        legs_muscles = [GLUTES, HAMSTRINGS, QUADRICEPS]
        curr_counts = [worked[m] for m in legs_muscles]
        min_ind = curr_counts.index(min(curr_counts))
        to_recommend = legs_muscles[min_ind]

    else:
        to_recommend = "full"
        # get the minimum of unseen
        to_recommend = min(worked, key=lambda k: float("inf") if k not in worked else worked[k])


    return {"recommended": to_recommend, "intensity": get_intensity(recent_pain, to_recommend)}


def recommend_workout(workout_id: str, db: google.cloud.firestore.Client):
    doc_ref = db.collection('globals').document('workouts').collection('premades').document(workout_id)
    doc = doc_ref.get()
    if doc.exists:
        return doc.to_dict()
    return None
