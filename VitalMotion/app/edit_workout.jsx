import React, { useState, useEffect } from 'react';
import {
    Pressable,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Picker,
    ActivityIndicator,
    Alert,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Navbar from './navbar';
import { useAuth } from './auth_context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styles from './index_styles';

const EditWorkout = () => {
    const { uid } = useAuth();
    const router = useRouter();
    const { workoutId } = useLocalSearchParams();

    const [exercises, setExercises] = useState([]);
    const [allExercises, setAllExercises] = useState([]);
    const [loading, setLoading] = useState(false);

    const [recommendation, setRecommendation] = useState(null);

    // Fetch all user exercises for the dropdown
    const fetchAllExercises = async () => {
        try {
            const response = await fetch(`http://localhost:5001/users/${uid}/exercises`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAllExercises(data);
            } else {
                const error = await response.json();
                console.error('Failed to fetch exercises:', error.error);
            }
        } catch (err) {
            console.error('Error fetching exercises:', err);
        }
    };

    // Fetch existing workout details if editing
    const fetchWorkoutDetails = async () => {
        if (workoutId !== 'new') {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5001/users/${uid}/workouts/${workoutId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const parsedExercises = await Promise.all(
                        data.exercises.map(async (exerciseStr) => {
                            const [sets, reps, weight, eid] = exerciseStr.split('|');
                            const exercise = await fetchExerciseDetails(eid);
                            return {
                                sets,
                                reps,
                                weight,
                                eid,
                                name: exercise.name,
                            };
                        })
                    );
                    setExercises(parsedExercises);
                } else {
                    const error = await response.json();
                    console.error('Failed to fetch workout:', error.error);
                }
            } catch (err) {
                console.error('Error fetching workout:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    // Fetch exercise details by eid
    const fetchExerciseDetails = async (eid) => {
        try {
            const response = await fetch(`http://localhost:5001/users/${uid}/exercises/${eid}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                console.error(`Failed to fetch exercise with eid ${eid}`);
                return { name: 'Unknown Exercise' };
            }
        } catch (err) {
            console.error('Error fetching exercise details:', err);
            return { name: 'Unknown Exercise' };
        }
    };

    useEffect(() => {
        if (uid === null) {
            setTimeout(() => {
                router.push('/login');
            }, 800);
        } else {
            fetchAllExercises();
            fetchWorkoutDetails();
        }
    }, [uid]);

    // Add a new exercise to the workout
    const addExercise = () => {
        setExercises([
            ...exercises,
            { eid: '', name: '', sets: '', reps: '', weight: '' },
        ]);
    };

    // recommend an exercise based on current created workout and user's past pain notes
    const recommendExercise = () =>{
        const recommend_endpoint = `http://localhost:5001/recommend/${uid}/exercise`
        console.log(exercises)    
        fetch(recommend_endpoint, {
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(exercises),
        }).then(response =>{
            if(!response.ok){
                throw new Error(`HTTP error getting recommendation: ${response.status}`);
            }
            return response.json()

        }).then(responseData=>{
            console.log(responseData)
            setRecommendation(responseData)
        }).catch(err =>{
        console.error('Error saving workout:', err);

            alert("Error getting recommendation")
        })
    }

    // Remove an exercise from the workout
    const removeExercise = (index) => {
        const updatedExercises = [...exercises];
        updatedExercises.splice(index, 1);
        setExercises(updatedExercises);
    };

    // Save workout (create or update)
    const saveWorkout = async () => {
        const exerciseStrings = exercises.map((exercise) => {
            const { sets, reps, weight, eid } = exercise;
            return `${sets}|${reps}|${weight}|${eid}`;
        });

        const workoutData = { exercises: exerciseStrings };

        try {
            const method = workoutId === 'new' ? 'POST' : 'PUT';
            const url =
                workoutId === 'new'
                    ? `http://localhost:5001/users/${uid}/workouts`
                    : `http://localhost:5001/users/${uid}/workouts/${workoutId}`;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(workoutData),
            });

            if (response.ok) {
		alert('Success! Workout saved successfully.', [
		    {
			text: 'OK',
		    },
		]);
		router.push('/workout');
            } else {
                const error = await response.json();
                alert('Error', error.error);
            }
        } catch (err) {
            console.error('Error saving workout:', err);
            alert('Error', 'Failed to save workout.');
        }
    };

    if (loading) {
        return (
            <View style={styles.outerWrapper}>
                <Navbar />
                <View style={styles.innerWrapper}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.outerWrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={localStyles.scrollContent}>
                <Navbar />
                <View style={styles.innerWrapper}>
                    <Text style={localStyles.pageTitle}>
                        {workoutId === 'new' ? 'Create Workout' : 'Edit Workout'}
                    </Text>
                    {exercises.map((item, index) => (
                        <View key={index} style={localStyles.exerciseEditItem}>
                            <Picker
                                selectedValue={item.eid}
                                style={localStyles.picker}
                                onValueChange={(value) => {
                                    const selectedExercise = allExercises.find(
                                        (exercise) => exercise.id === value
                                    );
                                    const updatedExercises = [...exercises];
                                    updatedExercises[index].eid = value;
                                    updatedExercises[index].name = selectedExercise.name;
                                    setExercises(updatedExercises);
                                }}
                            >
                                <Picker.Item label="Select Exercise" value="" />
                                {allExercises.map((exercise) => (
                                    <Picker.Item
                                        key={exercise.id}
                                        label={exercise.name}
                                        value={exercise.id}
                                    />
                                ))}
                            </Picker>
                            <TextInput
                                style={localStyles.input}
                                placeholder="Sets"
                                keyboardType="numeric"
                                value={item.sets}
                                onChangeText={(text) => {
                                    const updatedExercises = [...exercises];
                                    updatedExercises[index].sets = text;
                                    setExercises(updatedExercises);
                                }}
                            />
                            <TextInput
                                style={localStyles.input}
                                placeholder="Reps"
                                keyboardType="numeric"
                                value={item.reps}
                                onChangeText={(text) => {
                                    const updatedExercises = [...exercises];
                                    updatedExercises[index].reps = text;
                                    setExercises(updatedExercises);
                                }}
                            />
                            <TextInput
                                style={localStyles.input}
                                placeholder="Weight"
                                keyboardType="numeric"
                                value={item.weight}
                                onChangeText={(text) => {
                                    const updatedExercises = [...exercises];
                                    updatedExercises[index].weight = text;
                                    setExercises(updatedExercises);
                                }}
                            />
                            <TouchableOpacity
                                style={localStyles.deleteButton}
                                onPress={() => removeExercise(index)}
                            >
                                <Text style={localStyles.deleteButtonText}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    <TouchableOpacity style={localStyles.addButton} onPress={addExercise}>
                        <Text style={localStyles.addButtonText}>Add Exercise</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={localStyles.addButton} onPress={recommendExercise}>
                        <Text style={localStyles.addButtonText}>Recommend Exercise</Text>
                    </TouchableOpacity>
                    {recommendation ? <View styles={{borderColor:"red"}}>
                        CHANGE ME&nbsp;
                        recommendations&nbsp;
                        {recommendation['intensity']/*there is an muscle they should choose and an intensity they should aim for */}&nbsp;
                        {recommendation['recommended']}&nbsp;
                        {/*do not currently have way to give specific reps, weights (honestly would take a week); I could also provide an exercise they could do quickly if wanted */}
                    </View>:null}
                    <TouchableOpacity style={localStyles.saveButton} onPress={saveWorkout}>
                        <Text style={localStyles.saveButtonText}>Save Workout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const localStyles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        padding: 10,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 15,
    },
    exerciseEditItem: {
        marginBottom: 15,
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 5,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 10,
    },
    deleteButton: {
        backgroundColor: '#FF5722',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 5,
        marginTop: 10,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 5,
        marginTop: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default EditWorkout;
