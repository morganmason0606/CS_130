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
import theme from './design_system';

const History = () => {
    const { uid } = useAuth();
    const router = useRouter();

    const [workouts, setWorkouts] = useState([]);
    const [painNotes, setPainNotes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch workout and pain history
    const fetchHistory = async () => {
        setLoading(true);
        try {
            // Fetch all completed workouts
            const workoutResponse = await fetch(
                `http://localhost:5001/users/${uid}/workouts/ALL/completed`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            let parsedWorkouts = [];
            if (workoutResponse.ok) {
                const workoutData = await workoutResponse.json();
                parsedWorkouts = await Promise.all(
                    workoutData.map(async (workout) => {
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
                            type: 'workout',
                            date: workout.dateCompleted,
                            notes: workout.notes,
                            difficulty: workout.difficulty,
                            exercises: parsedExercises,
                        };
                    })
                );
            }

            // Fetch all pain notes
            const painResponse = await fetch(`http://localhost:5001/get-all-pain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uid }),
            });

            let parsedPainNotes = [];
            if (painResponse.ok) {
                const painData = await painResponse.json();
                parsedPainNotes = painData.pain.map((note) => ({
                    type: 'pain',
                    date: note.date,
                    pain_level: note.pain_level,
                    body_part: note.body_part,
                }));
            }

            // Combine and sort by date
            const combinedHistory = [...parsedWorkouts, ...parsedPainNotes].sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            );
            setWorkouts(combinedHistory);
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

    const getWorkoutMessage = (numWorkouts) => {
        if (numWorkouts === 0) return "Start your first workout!";
        if (numWorkouts <= 5) return "Keep it up!";
        if (numWorkouts <= 10) return "Nice job!";
        return "You're on fire!";
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

    const renderHistoryItem = ({ item }) => {
        if (item.type === 'workout') {
            return (
                <View style={localStyles.historyContainer}>
                    <Text style={localStyles.date}>Date: {item.date}</Text>
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
        } else if (item.type === 'pain') {
            return (
                <View style={localStyles.historyContainer}>
                    <Text style={localStyles.date}>Date: {item.date}</Text>
                    <Text style={localStyles.painLevel}>Pain Level: {item.pain_level}/10</Text>
                    <Text style={localStyles.bodyPart}>Body Part: {item.body_part}</Text>
                </View>
            );
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <Navbar />
            <View style={styles.innerWrapper}>
                <View style={localStyles.row}>
                    <View>
                        <Text style={styles.pageTitle}>History</Text>
                        <Text style={styles.pageSubtitle}>Your Completed Workouts:</Text>
                    </View>
                    <View style={localStyles.workoutsCompletedContainer}>
                        <Text style={localStyles.workoutsCompletedText}>
                            Workouts Completed: {workouts.length}
                        </Text>
                        <Text style={localStyles.motivationText}>
                            {getWorkoutMessage(workouts.length)}
                        </Text>
                    </View>
                </View>
                {workouts.length === 0 ? (
                    <Text style={styles.emptyMessage}>No history found.</Text>
                ) : (
                    <FlatList
                        data={workouts}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderHistoryItem}
                    />
                )}
            </View>
        </ScrollView>
    );
};

const localStyles = StyleSheet.create({
    historyContainer: {
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    workoutsCompletedContainer: {
        backgroundColor: theme.colors.aqua,
        padding: 15,
        borderRadius: 10,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    workoutsCompletedText: {
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.white,
    },
    motivationText: {
        color: theme.colors.white,
        fontStyle: 'italic',
        marginTop: 5,
    },
    date: {
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
    painLevel: {
        fontSize: 14,
        marginBottom: 5,
    },
    bodyPart: {
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
