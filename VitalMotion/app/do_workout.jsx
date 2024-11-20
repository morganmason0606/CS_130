import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import Navbar from './navbar';
import { useAuth } from './auth_context';
import { useRouter, useLocalSearchParams } from 'expo-router';

const DoWorkout = () => {
    const { uid } = useAuth();
    const router = useRouter();
    const { templateId } = useLocalSearchParams();

    const [workout, setWorkout] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const [difficulty, setDifficulty] = useState(5); // Default difficulty
    const [dateCompleted, setDateCompleted] = useState(''); // Date Completed

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

    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <Navbar />
            <View style={styles.innerWrapper}>
                <Text style={styles.pageTitle}>Perform Workout</Text>

                {/* Notes Section */}
                <View style={styles.notesContainer}>
                    <Text style={styles.sectionTitle}>Notes:</Text>
                    <TextInput
                        style={styles.notesInput}
                        placeholder="Enter any notes about your workout..."
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                    />
                </View>

                {/* Difficulty Input */}
                <View style={styles.difficultyContainer}>
                    <Text style={styles.sectionTitle}>Difficulty:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter difficulty (1-10)"
                        keyboardType="numeric"
                        value={difficulty.toString()}
                        onChangeText={(value) => setDifficulty(Number(value))}
                    />
                    <Text style={styles.difficultyValue}>Difficulty: {difficulty}</Text>
                </View>

                {/* Date Completed Section */}
                <View style={styles.dateContainer}>
                    <Text style={styles.sectionTitle}>Date Completed:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter date (YYYY-MM-DD)"
                        value={dateCompleted}
                        onChangeText={setDateCompleted}
                    />
                </View>

                {/* Exercises List */}
                {workout?.exercises?.map((item, index) => (
                    <View style={styles.exerciseItem} key={index}>
                        <Text style={styles.exerciseName}>{item.name}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Sets"
                            value={item.sets.toString()}
                            keyboardType="numeric"
                            onChangeText={(text) => {
                                const updatedWorkout = { ...workout };
                                updatedWorkout.exercises[index].sets = text;
                                setWorkout(updatedWorkout);
                            }}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Reps"
                            value={item.reps.toString()}
                            keyboardType="numeric"
                            onChangeText={(text) => {
                                const updatedWorkout = { ...workout };
                                updatedWorkout.exercises[index].reps = text;
                                setWorkout(updatedWorkout);
                            }}
                        />
                        <TextInput
                            style={styles.input}
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
                ))}

                {/* Complete Workout Button */}
                <TouchableOpacity style={styles.completeButton} onPress={completeWorkout}>
                    <Text style={styles.completeButtonText}>Complete Workout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    outerWrapper: {
        flex: 1,
        padding: 10,
    },
    scrollContent: {
        padding: 10,
    },
    innerWrapper: {
        padding: 15,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    notesContainer: {
        marginBottom: 20,
    },
    notesInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    difficultyContainer: {
        marginBottom: 20,
    },
    dateContainer: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    exerciseItem: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f8f8f8',
        borderRadius: 5,
    },
    exerciseName: {
        fontWeight: 'bold',
        marginBottom: 10,
    },
    completeButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    completeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default DoWorkout;
