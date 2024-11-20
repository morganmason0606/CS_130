import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import Navbar from './navbar';
import styles from './index_styles';
import { useAuth } from './auth_context';
import { useRouter } from 'expo-router';

const History = () => {
    const { uid } = useAuth();
    const router = useRouter();

    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch all completed workouts
    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5001/users/${uid}/workouts/ALL/completed`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                // Parse and sort workouts by date
                const parsedWorkouts = await Promise.all(
                    data.map(async (workout) => {
                        const parsedExercises = await Promise.all(
                            workout.exercises.map(async (exerciseStr) => {
                                const [sets, reps, weight, eid] = exerciseStr.split('|');
                                const exerciseName = await fetchExerciseName(eid);
                                return {
                                    name: exerciseName,
                                    sets,
                                    reps,
                                    weight,
                                };
                            })
                        );
                        return {
                            dateCompleted: workout.dateCompleted,
                            notes: workout.notes,
                            difficulty: workout.difficulty,
                            exercises: parsedExercises,
                        };
                    })
                );
                setWorkouts(parsedWorkouts.sort((a, b) => new Date(b.dateCompleted) - new Date(a.dateCompleted)));
            } else {
                const error = await response.json();
                console.error('Failed to fetch history:', error.error);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch exercise name from eid
    const fetchExerciseName = async (eid) => {
        try {
            const response = await fetch(`http://localhost:5001/users/${uid}/exercises/${eid}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

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

    useEffect(() => {
        if (uid === null) {
            setTimeout(() => {
                router.push('/login');
            }, 800);
        } else {
            fetchHistory();
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

    const renderWorkout = ({ item }) => (
        <View style={localStyles.workoutContainer}>
            <Text style={localStyles.dateCompleted}>Date: {item.dateCompleted}</Text>
            <Text style={localStyles.notes}>Notes: {item.notes || 'None'}</Text>
            <Text style={localStyles.difficulty}>Difficulty: {item.difficulty}/10</Text>
            <Text style={localStyles.exercisesTitle}>Exercises:</Text>
            {item.exercises.map((exercise, index) => (
                <View key={index} style={localStyles.exerciseItem}>
                    <Text style={localStyles.exerciseName}>{exercise.name}</Text>
                    <Text>
                        {exercise.sets} sets x {exercise.reps} reps @ {exercise.weight} lbs
                    </Text>
                </View>
            ))}
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <Navbar />
            <View style={styles.innerWrapper}>
                <Text style={styles.pageTitle}>Workout History</Text>
                {workouts.length === 0 ? (
                    <Text style={styles.emptyMessage}>No completed workouts found.</Text>
                ) : (
                    <FlatList
                        data={workouts}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderWorkout}
                    />
                )}
            </View>
        </ScrollView>
    );
};

const localStyles = StyleSheet.create({
    workoutContainer: {
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    dateCompleted: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    notes: {
        fontSize: 14,
        marginBottom: 5,
    },
    difficulty: {
        fontSize: 14,
        marginBottom: 10,
    },
    exercisesTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    exerciseItem: {
        marginBottom: 5,
    },
    exerciseName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default History;
