import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useAuth } from './auth_context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import Navbar from './navbar';
import CustomButton from './components/custom_button';
import CustomPicker from './components/custom_picker';
import CustomTextInput from './components/custom_text_input';
import CornerNotification from './components/corner_notification';
import styles from './index_styles';
import theme from './design_system';

/**
 * Edit workout component
 * @returns {JSX.Element}
 */
const EditWorkout = () => {
    const { uid } = useAuth();
    const router = useRouter();
    const { workoutId } = useLocalSearchParams();

    const [exercises, setExercises] = useState([]);
    const [allExercises, setAllExercises] = useState([]);
    const [loading, setLoading] = useState(false);

    const [recommendation, setRecommendation] = useState(null);
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [message, setMessage] = useState('');

    // Fetch all user exercises for the dropdown
    /**
     * Gets all exercises necessary for the dropdown applicatoin
     */
    const fetchAllExercises = async () => {
        try {
            const response = await fetch(`https://hassanrizvi14.pythonanywhere.com/users/${uid}/exercises`, {
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
    /**
     * Get workout details
     */
    const fetchWorkoutDetails = async () => {
        if (workoutId !== 'new') {
            setLoading(true);
            try {
                const response = await fetch(`https://hassanrizvi14.pythonanywhere.com/users/${uid}/workouts/${workoutId}`, {
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
            const response = await fetch(`https://hassanrizvi14.pythonanywhere.com/users/${uid}/exercises/${eid}`, {
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

    useEffect(() => {
        if (workoutId === 'new') {
            addExercise(); // automatically add new exercise template if creating new workout
        }
    }, [workoutId]); // run only when workoutId changes

    // Add a new empty exercise to the workout
    const addExercise = () => {
        setExercises([
            ...exercises,
            { eid: '', name: '', sets: '', reps: '', weight: '' },
        ]);
    };

    // recommend an exercise based on current created workout and user's past pain notes
    const recommendExercise = () =>{
        const recommend_endpoint = `https://hassanrizvi14.pythonanywhere.com/recommend/${uid}/exercise`
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
        // Validate exercise data before processing
        for (const exercise of exercises) {
            const { sets, reps, weight, eid } = exercise;
            
            // Verify that sets, reps, and weight are not empty
            if (!eid || !sets || !reps || !weight) {
                alert('Exercise, sets, reps, and weight must not be empty.');
                return;
            }
            if (isNaN(sets) || isNaN(reps) || isNaN(weight) || sets <= 0 || reps <= 0 || weight < 0) {
                alert('Sets, reps, and weight must be non-negative numbers.');
                return;
            }
        }
        
        const exerciseStrings = exercises.map((exercise) => {
            const { sets, reps, weight, eid } = exercise;
            return `${sets}|${reps}|${weight}|${eid}`;
        });

        const workoutData = { exercises: exerciseStrings };

        try {
            const method = workoutId === 'new' ? 'POST' : 'PUT';
            const url =
                workoutId === 'new'
                    ? `https://hassanrizvi14.pythonanywhere.com/users/${uid}/workouts`
                    : `https://hassanrizvi14.pythonanywhere.com/users/${uid}/workouts/${workoutId}`;

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

    const toggleNotification = async () => {
        // Once recommendation is fetched, set the notification message
        if (recommendation) {
            setNotificationVisible(true);
            setMessage(`Based on your previous workouts, you should work your ${recommendation['recommended'].toLowerCase()} at a ${recommendation['intensity']} intensity.`);
        } else {
            // Handle case where recommendation is not available
            setNotificationVisible(false);
            setMessage('No recommendation available.');
        }
        setNotificationVisible(!notificationVisible);
    };

    useEffect(() => {
        recommendExercise();
    }, [toggleNotification]); // run when toggleNotif changes

    const handleCancel = () => {
        router.push('/workout');
    }

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
            <Navbar />
            <ScrollView>
                <View style={styles.innerWrapper}>
                    <View style={localStyles.row}>
                        <View>
                            <Text style={styles.pageTitle}>
                                {workoutId === 'new' ? 'Create New Workout' : 'Edit Workout'}
                            </Text>
                            <Text style={styles.pageSubtitle}> Exercises: </Text>
                        </View>
                        <View>
                            <CustomButton
                                title="+ Add New Exercise"
                                onPress={addExercise}
                            />
                        </View>
                    </View>
                    <View style={localStyles.exerciseCardsContainer}>
                        {exercises.map((item, index) => (
                            <View key={index} style={localStyles.exerciseCard}>
                                <View style={localStyles.row}>
                                    <CustomPicker
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
                                        placeholder="Select Exercise"
                                        data={allExercises}
                                    />
                                    <TouchableOpacity
                                        style={[localStyles.deleteButton, localStyles.button]}
                                        onPress={() => removeExercise(index)}
                                    >
                                        <Feather name="trash-2" size={26} style={styles.iconButton} />
                                    </TouchableOpacity>
                                </View>
                                <View style={localStyles.row}>
                                    <Text style={localStyles.textInputLabel}> # of Sets: </Text>
                                    <CustomTextInput
                                        placeholder="Sets"
                                        keyboardType="numeric"
                                        value={item.sets}
                                        onChangeText={(text) => {
                                            const updatedExercises = [...exercises];
                                            updatedExercises[index].sets = text;
                                            setExercises(updatedExercises);
                                        }}
                                    />
                                </View>
                                <View style={localStyles.row}>
                                    <Text style={localStyles.textInputLabel}> # of Reps: </Text>
                                    <CustomTextInput
                                    
                                        placeholder="Reps"
                                        keyboardType="numeric"
                                        value={item.reps}
                                        onChangeText={(text) => {
                                            const updatedExercises = [...exercises];
                                            updatedExercises[index].reps = text;
                                            setExercises(updatedExercises);
                                        }}
                                    />
                                </View>
                                <View style={localStyles.row}>
                                    <Text style={localStyles.textInputLabel}> Weight (lb): </Text>
                                    <CustomTextInput
                                        placeholder="Weight"
                                        keyboardType="numeric"
                                        value={item.weight}
                                        onChangeText={(text) => {
                                            const updatedExercises = [...exercises];
                                            updatedExercises[index].weight = text;
                                            setExercises(updatedExercises);
                                        }}
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                    
                    {/* MORGAN:TODO FIX ME */}
                    {/* {recommendation ? 
                    <View>
                        <Text style={styles.pageSubtitle}> Recommendation: </Text>
                        <Text> You should work your {recommendation['recommended'].toLowerCase()} at a {recommendation['intensity']} intensity.</Text>
                    </View>
                    :null
                    } */}

                    <CustomButton
                        title="+ Add New Exercise"
                        onPress={addExercise}
                        style={localStyles.button}
                    />
                    <CustomButton
                        title="Save Workout"
                        onPress={saveWorkout}
                        style={localStyles.button}
                    />
                    <CustomButton
                        title="View Exercise Recommendation"
                        onPress={toggleNotification}
                        style={[localStyles.button, localStyles.recommendationButton]}
                    />
                    <CustomButton
                        title="Cancel"
                        onPress={handleCancel}
                        style={[localStyles.cancelButton, localStyles.button]}
                    />
                </View>
            </ScrollView>
            <CornerNotification
                message={message}
                visible={notificationVisible}
                onDismiss={() => setNotificationVisible(false)}
            />
        </KeyboardAvoidingView>
    );
};

const localStyles = StyleSheet.create({
    pageTitle: {
        fontSize: theme.fontSizes.large,
        fontWeight: theme.fontWeights.bold,
    },
    exerciseCardsContainer: {
        marginBottom: 30,
    },
    exerciseCard: {
        backgroundColor: theme.colors.grey,
        padding: 30,
        marginTop: 20,
        borderRadius: 30,
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
    },
    picker: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
        gap: 10,
    },
    textInputLabel: {
        fontSize: theme.fontSizes.small,
        width: 120,
    },
    deleteButton: {
        marginLeft: 10,
    },
    button: {
        marginBottom: 10,
    },
    cancelButton: {
        backgroundColor: theme.colors.darkGrey,
    },
    recommendationButton: {
        backgroundColor: theme.colors.dustyAqua,
    },
});

export default EditWorkout;
