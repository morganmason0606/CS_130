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

    // Function to get a random message from messages array
    const getRandomMessage = (messages) => {
        const randomIndex = Math.floor(Math.random() * messages.length);
        return messages[randomIndex];
    };
  
    const getWorkoutMessage = (numWorkouts) => {
        if (numWorkouts === 0) {
        const messages = [
            "Start your first workout!",
            "Let's get moving!",
            "Log a workout!",
        ];
        return getRandomMessage(messages);
        }
        if (numWorkouts <= 5) {
        const messages = [
            "Keep it up!",
            "You're doing great!",
            "Let's reach 10 workouts!",
        ];
        return getRandomMessage(messages);
        }
        if (numWorkouts <= 10) {
        const messages = [
            "Nice job!",
            "You're crushing it!",
            "Way to go!",
        ];
        return getRandomMessage(messages);
        }
        const messages = [
        "You're on fire!",
        "Keep pushing!",
        "Amazing progress!",
        ];
        return getRandomMessage(messages);
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

    // Convert date from YYYY-MM-DD format to MM/DD/YYYY format
    const convertDate = (date) => {
        const newDate = date.split('-');
        return `${newDate[1]}/${newDate[2]}/${newDate[0]}`;
    };

    const renderHistoryItem = ({ item }) => {
        if (item.type === 'workout') {
            return (
                <View>
                    <Text style={[localStyles.historyType, localStyles.workoutType]}>Workout</Text>

                    <View style={localStyles.historyContainer}>
                        <Text style={localStyles.label}>Date:
                            <Text style={localStyles.value}> {convertDate(item.date)}</Text>
                        </Text>
                        <Text style={localStyles.label}>Notes:
                            <Text style={localStyles.value}> {item.notes || 'None'}</Text>
                        </Text>
                        <Text style={localStyles.label}>Difficulty:
                            <Text style={localStyles.value}> {item.difficulty}/10</Text>
                        </Text>

                        <Text style={localStyles.label}>Exercises:</Text>
                        {item.exercises.map((exercise, index) => (
                            <View key={index} style={localStyles.label}>
                                <Text style={localStyles.sublabel}>{exercise.name}</Text>
                                <Text style={localStyles.value}>
                                    {exercise.sets} sets x {exercise.reps} reps @ {exercise.weight} lbs
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            );
        } else if (item.type === 'pain') {
            return (
                <View>
                    <Text style={[localStyles.historyType, localStyles.painType]}>Pain</Text>

                    <View style={localStyles.historyContainer}>
                        <Text style={localStyles.label}>Date:
                            <Text style={localStyles.value}> {convertDate(item.date)}</Text>
                        </Text>
                        <Text style={localStyles.label}>Pain Level:
                            <Text style={localStyles.value}> {item.pain_level}/10</Text>
                        </Text>
                        <Text style={localStyles.label}>Body Part:
                            <Text style={localStyles.value}> {item.body_part}</Text>
                        </Text>
                    </View>
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    workoutsCompletedContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0.5rem',
        borderRadius: '0.5rem',
        backgroundColor: theme.colors.aqua,
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
    historyType:{
        textAlign: 'center',
        padding: '0.5rem',
        
        borderTopLeftRadius: '0.5rem',
        borderTopRightRadius: '0.5rem',        
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.bolder,
    },
    workoutType: {
        backgroundColor: theme.colors.dustyAqua,
        color: theme.colors.white,
    },
    painType: {
        backgroundColor: theme.colors.dustyPurple,
        color: theme.colors.white,
    },
    medType: {  // TODO: Use for medication notes.
        backgroundColor: theme.colors.dustyPink,
        color: theme.colors.white,
    },
    historyContainer: {
        backgroundColor: theme.colors.grey,
        marginBottom: '1rem',
        paddingHorizontal: '0.5rem',
        paddingTop: '0.5rem',

        borderBottomLeftRadius: '0.5rem',
        borderBottomRightRadius: '0.5rem',
    },
    label: {
        marginBottom: '0.5rem',
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.bolder,
    },
    sublabel:{
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.bold,
    },
    value: {
        marginBottom: '0.5rem',
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.regular,
    },
});

export default History;
