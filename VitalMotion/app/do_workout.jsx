import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useAuth } from './auth_context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Navbar from './navbar';
import CustomButton from './components/custom_button';
import CustomTextInput from './components/custom_text_input';
import theme from './design_system';
import styles from './index_styles';

const DoWorkout = () => {
    const { uid } = useAuth();
    const router = useRouter();
    const { templateId } = useLocalSearchParams();

    const [workout, setWorkout] = useState(null);
    const [workoutTemplate, setWorkoutTemplate] = useState(null); // copy for "intended" reference
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const [difficulty, setDifficulty] = useState(1); // Default difficulty
    const today = new Date();
    const [dateCompleted, setDateCompleted] = useState(today.toISOString().slice(0, 10)); // to YYYY-MM-DD format

    // Fetch workout template
    const fetchWorkoutTemplate = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:5001/users/${uid}/workouts/${templateId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                // Parse and set initial workout state with exercise names and default values
                const parsedExercises = await Promise.all(
                    data.exercises.map(async (exerciseStr) => {
                        const [sets, reps, weight, eid] = exerciseStr.split('|');
                        const exerciseName = await fetchExerciseName(eid);
                        return {
                            eid,
                            name: exerciseName,
                            sets,
                            reps,
                            weight,
                        };
                    })
                );
                setWorkout({ ...data, exercises: parsedExercises });
                setWorkoutTemplate(JSON.parse(JSON.stringify({ ...data, exercises: parsedExercises })));
            } else {
                const error = await response.json();
                console.error('Failed to fetch workout template:', error.error);
            }
        } catch (err) {
            console.error('Error fetching workout template:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch exercise name from eid
    const fetchExerciseName = async (eid) => {
        try {
            const response = await fetch(
                `http://localhost:5001/users/${uid}/exercises/${eid}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                return data.name;
            } else {
                console.error(`Failed to fetch exercise name for eid ${eid}`);
                return 'Unknown Exercise';
            }
        } catch (err) {
            console.error('Error fetching exercise name:', err);
            return 'Unknown Exercise';
        }
    };

    // Complete workout
    const completeWorkout = async () => {
        // Validate exercise data before processing
        for (const exercise of workout.exercises) {
            const { sets, reps, weight} = exercise;
            
            // Verify that sets, reps, and weight are not empty
            if (!sets || !reps || !weight) {
                alert('Sets, reps, and weight must not be empty.');
                return;
            }
            if (isNaN(sets) || isNaN(reps) || isNaN(weight) || sets <= 0 || reps <= 0 || weight < 0) {
                alert('Sets, reps, and weight must be non-negative numbers.');
                return;
            }
            if (dateCompleted === '') {
                alert('Please input date workout was completed.');
                return;
            }
            // Use regex to validate YYYY-MM-DD format
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;
            if (!datePattern.test(dateCompleted)) {
                alert('Date must be in YYYY-MM-DD format.');
                return;
            }

            // Another check to ensure date is valid
            const dateObject = new Date(dateCompleted);
            const isValidDate = dateObject instanceof Date && !isNaN(dateObject);
            try {
                dateObject.toISOString().split('T')[0]; // ensure no extra time info
            } catch {
                alert('Please provide a valid date in YYYY-MM-DD format.');
                return;
            }
            if (!isValidDate) {
                alert('Please provide a valid date in YYYY-MM-DD format.');
                return;
            }
        }

        try {
            const formattedExercises = workout.exercises.map(
                (exercise) =>
                    `${exercise.sets}|${exercise.reps}|${exercise.weight}|${exercise.eid}`
            );

            const payload = {
                exercises: formattedExercises,
                notes,
                difficulty,
                dateCompleted,
            };

            const response = await fetch(
                `http://localhost:5001/users/${uid}/workouts/${templateId}/completed`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (response.ok) {
                alert('Success', 'Workout completed successfully.');
                router.push('/history');
            } else {
                const error = await response.json();
                alert('Error', error.error);
            }
        } catch (err) {
            console.error('Error completing workout:', err);
            alert('Error', 'Failed to complete workout.');
        }
    };

    const handleSliding = (value) => {
        setDifficulty(value.toString());
        return;
    } 

    useEffect(() => {
        if (uid === null) {
            setTimeout(() => {
                router.push('/login');
            }, 800);
        } else {
            fetchWorkoutTemplate();
        }
    }, [uid]);

    if (loading) {
        return (
            <View style={styles.outerWrapper}>
                <Navbar />
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    const handleCancel = () => {
        router.push('/workout');
    }

    return (
        <View style={styles.outerWrapper}>
            <Navbar />
            <ScrollView style={styles.innerWrapper}>
                <Text style={styles.pageTitle}>Log Workout</Text>

                <View style={localStyles.logContainer}>
                    {/* Exercises List */}
                    <Text style={localStyles.sectionTitle}>Exercises:</Text>
                    {workout?.exercises?.map((item, index) => (
                        <View style={localStyles.exerciseContainer} key={index}>
                            <Text style={localStyles.exerciseName}>{item.name}</Text>
                            <View style={localStyles.row}>
                                <Text style={localStyles.textInputLabel}>Sets (intended: {workoutTemplate?.exercises[index]?.sets}):</Text>
                                <CustomTextInput
                                    placeholder="Sets"
                                    value={item.sets.toString()}
                                    keyboardType="numeric"
                                    onChangeText={(text) => {
                                        const updatedWorkout = { ...workout };
                                        updatedWorkout.exercises[index].sets = text;
                                        setWorkout(updatedWorkout);
                                    }}
                                />
                            </View>
                            <View style={localStyles.row}>
                                <Text style={localStyles.textInputLabel}>Reps (intended: {workoutTemplate?.exercises[index]?.reps}):</Text>
                                <CustomTextInput
                                    placeholder="Reps"
                                    value={item.reps.toString()}
                                    keyboardType="numeric"
                                    onChangeText={(text) => {
                                        const updatedWorkout = { ...workout };
                                        updatedWorkout.exercises[index].reps = text;
                                        setWorkout(updatedWorkout);
                                    }}
                                />
                            </View>
                            <View style={localStyles.row}>
                                <Text style={localStyles.textInputLabel}>Weight (intended: {workoutTemplate?.exercises[index]?.weight} lbs):</Text>
                                <CustomTextInput
                                    placeholder="Weight"
                                    value={item.weight.toString()}
                                    keyboardType="numeric"
                                    onChangeText={(text) => {
                                        const updatedWorkout = { ...workout };
                                        updatedWorkout.exercises[index].weight = text;
                                        setWorkout(updatedWorkout);
                                    }}
                                />
                            </View>
                        </View>
                    ))}

                    {/* Difficulty Input */}
                    <View style={[localStyles.inputContainer, localStyles.row, localStyles.sliderRow]}>
                        <Text style={[localStyles.textInputLabel, localStyles.sectionTitle]}>Difficulty: {difficulty} </Text>
                        <View style={localStyles.sliderContainer}>
                            <Text> 1 (Easy) </Text>
                            <Slider
                                style={localStyles.slider}
                                minimumValue={1}
                                maximumValue={10}
                                step={1}
                                value={1}
                                onValueChange={handleSliding}
                                minimumTrackTintColor={theme.colors.aqua}
                                maximumTrackTintColor={theme.colors.darkGrey}
                                // renderStepNumber
                            />
                            <Text> 10 (Difficult) </Text>
                        </View>
                    </View>

                    {/* Date Completed Section */}
                    <View style={[localStyles.inputContainer, localStyles.row]}>
                        <Text style={[localStyles.sectionTitle, localStyles.dateTitle]}>Date Completed (YYYY-MM-DD):</Text>
                        <CustomTextInput
                            placeholder="Enter date"
                            value={dateCompleted}
                            onChangeText={setDateCompleted}
                        />
                    </View>

                    {/* Notes Section */}
                    <View style={localStyles.inputContainer}>
                        <Text style={localStyles.sectionTitle}>Notes:</Text>
                        <CustomTextInput
                            style={localStyles.notesInput}
                            placeholder="Enter any notes about your workout..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                        />
                    </View>
                </View>

                {/* Complete Workout Button */}
                <CustomButton
                    title="Complete Workout"
                    onPress={completeWorkout}>
                </CustomButton>
                <CustomButton
                    title="Cancel"
                    onPress={handleCancel}
                    style={localStyles.cancelButton}
                />
            </ScrollView>
        </View>
    );
};

const localStyles = StyleSheet.create({
    logContainer: {
        backgroundColor: theme.colors.grey,
        width: '100%',
        padding: 35,
        marginVertical: 20,
        borderRadius: 30,
    },
    inputContainer: {
        marginVertical: 15,
    },
    sectionTitle: {
        fontSize: theme.fontSizes.regular,
        marginVertical: 10,
    },
    dateTitle: {
        width: 360,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
        gap: 10,
    },
    sliderRow: {
        justifyContent: 'flex-start',
        gap: 25,
    },
    slider: {
        width: 500,
    },
    sliderContainer: {
        flexDirection: 'row',
        gap: 3,
    },
    exerciseContainer: {
        marginTop: 10,
        backgroundColor: theme.colors.offWhite,
        borderRadius: 15,
        padding: 20,
    },
    exerciseName: {
        fontSize: theme.fontSizes.regular,
        marginBottom: 15,
    },
    textInputLabel: {
        fontSize: theme.fontSizes.small,
        width: 200,
    },
    notesInput: {
        height: 80,
    },
    cancelButton: {
        marginVertical: 10,
        backgroundColor: theme.colors.darkGrey,
    },
});

export default DoWorkout;
