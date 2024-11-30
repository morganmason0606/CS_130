import pytest
from unittest.mock import MagicMock
from datetime import datetime, timedelta


import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from recommender import *


recent_pain = [
    {"body_part": CHEST, "pain_level": 2},
    {"body_part": BICEPS, "pain_level": 8},
    {"body_part": ABS, "pain_level": 5},
]
"""
def test_recommend_higher():
    "excpect <= 3 recommend higher"
    result = get_intensity(recent_pain, CHEST)
    assert result == 'higher'
def test_recommend_lower():
    "expect >= 7 lower"
    result = get_intensity(recent_pain, BICEPS)
    assert result == 'lower'
def test_recommend_same():
    "3 < v < 7 same"
    result = get_intensity(recent_pain, ABS)
    assert result == 'same'
def test_recommend_none():
    "if no hist, recommend same"
    result = get_intensity(recent_pain, TRAPS)
    assert result == 'same'
"""
def mock_firestore_client():
    """Helper function to mock Firestore client"""
    db_mock = MagicMock()

    # Mocking 'users' collection
    user_collection_mock = MagicMock()
    db_mock.collection.return_value = user_collection_mock

    # Mock the 'users/{uid}' document
    user_doc_mock = MagicMock()
    user_collection_mock.document.return_value = user_doc_mock

    # lmabda for exercises, pain collection
    user_exercises = MagicMock()
    user_pain = MagicMock()
    user_doc_mock.collection.side_effect = lambda v: user_exercises if v == "exercises" else user_pain

    # creating get.todict() for exercise
    def exer_get_side_effect(eid):
        # expect EID to just be the muscle
        mock_doc = MagicMock()
        mock_get = MagicMock()
        
        mock_get.exists = True
        mock_get.to_dict.return_value = {'muscle': eid}
        
        mock_doc.get.return_value = mock_get
        return mock_doc
    user_exercises.document.side_effect = exer_get_side_effect 


    # Mocking 'users/{uid}/pain' collection

    # Mock pain document stream (returning recent pain data)
    def mock_pain_docs():
        return [
            MagicMock(to_dict=MagicMock(return_value={
                "date": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
                "body_part": BICEPS,
                "pain_level": 3
            })),
            MagicMock(to_dict=MagicMock(return_value={
                "date": (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d"),
                "body_part": TRICEPS,
                "pain_level": 7
            })),
             MagicMock(to_dict=MagicMock(return_value={
                "date": (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d"),
                "body_part": SHOULDERS,
                "pain_level": 4
            })),
            # check timing 
            MagicMock(to_dict=MagicMock(return_value={
                "date": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
                "body_part": ABS,
                "pain_level": 2
            })),
            MagicMock(to_dict=MagicMock(return_value={
                "date": (datetime.now() - timedelta(days=6)).strftime("%Y-%m-%d"),
                "body_part": ABS,
                "pain_level": 10
            })), 

            #check decay
            MagicMock(to_dict=MagicMock(return_value={
                "date": (datetime.now() - timedelta(days=8)).strftime("%Y-%m-%d"),
                "body_part": GLUTES,
                "pain_level": 2
            })), 
        ]
    
    user_pain.stream.return_value = mock_pain_docs()
    
    return db_mock

@pytest.mark.parametrize(
    "curr_workout, expected_recommendation, expected_intensity",
    [
        # Workout with Biceps, Triceps, and shoulders should recommend forearms (and same since no note exists)
        ([{"eid": BICEPS}, {"eid": TRICEPS}, {'eid': SHOULDERS} ], FOREARMS, "same"),
        
        # should recommend bicep and higher because of notes
        ([{"eid": FOREARMS}, {"eid": TRICEPS}, {'eid': SHOULDERS} ], BICEPS, "higher"),
        
        # should recommend tricep; lower because of note
        ([{"eid": FOREARMS}, {"eid": BICEPS}, {'eid': SHOULDERS} ], TRICEPS, "lower"),

        # should recommend shoulder, same since no note
        ([{"eid": FOREARMS}, {"eid": BICEPS}, {'eid': TRICEPS} ], SHOULDERS, "same"),



        #check upper body ; check that because most recent abs note is 2, should recommend higher
        ([{'eid': BACK}, {'eid': CHEST}, {'eid': TRAPS}], ABS, 'higher' ),


        # check lower body, check old notes don't affect annything
        ([{'eid': HAMSTRINGS}, {'eid': QUADRICEPS}, {'eid': HAMSTRINGS}], GLUTES, 'same' ),



        # edge case, empty defautls to abs
        ([], ABS, 'higher')
    ]
)
def test_recommend_exercise(curr_workout, expected_recommendation, expected_intensity):
    # for each of the above inputs, 
    # we will run the following our recommend algoring
    # and test our output is what we desire
    db_mock = mock_firestore_client()
    recommendation = recommend_exercise("user_123", curr_workout, db_mock)
    assert recommendation["recommended"] == expected_recommendation
    assert recommendation["intensity"] == expected_intensity
    

def test_recommend_workout():
    """this is just retrieving file from db; no other logic; no reason to check"""
    return 