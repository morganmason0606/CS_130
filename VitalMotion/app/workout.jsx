import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Button,
    Alert,
    StyleSheet,
    ScrollView,
} from 'react-native';
import Navbar from './navbar';
import styles from './index_styles';
import { useAuth } from './auth_context';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

const Workout = () => {
    const { uid } = useAuth();
    const router = useRouter();

    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWorkouts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5001/users/${uid}/workouts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setWorkouts(await parseWorkouts(data));
            } else {
                const error = await response.json();
                console.error('Failed to fetch workouts:', error.error);
            }
        } catch (err) {
            console.error('Error fetching workouts:', err);
        } finally {
            setLoading(false);
        }
    };

    const parseWorkouts = async (workoutsArray) => {
        return await Promise.all(
            workoutsArray.map(async (workout) => {
                const parsedExercises = await Promise.all(
                    workout.exercises.map(async (exerciseStr) => {
                        const [sets, reps, weight, eid] = exerciseStr.split('|');
                        const name = await fetchExerciseName(eid);
                        return { sets, reps, weight, eid, name };
                    })
                );
                return { id: workout.id, exercises: parsedExercises };
            })
        );
    };

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
            fetchWorkouts();
        }
    }, [uid]);

    const deleteWorkout = async (workoutId) => {
        try {
            const response = await fetch(`http://localhost:5001/users/${uid}/workouts/${workoutId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                alert('Success', 'Workout deleted successfully.');
                fetchWorkouts();
            } else {
                const error = await response.json();
                alert('Error', error.error);
            }
        } catch (err) {
            console.error('Error deleting workout:', err);
            alert('Error', 'Failed to delete workout.');
        }
    };

    const renderExercises = ({ item, index }) => (
        <View style={[styles.workoutWrapper, localStyles.workoutContainer]}>
            <Text style={localStyles.workoutTitle}>Workout #{index + 1}</Text>
            <View style={localStyles.actionButtons}>
                <TouchableOpacity
                    style={localStyles.editButton}
                    onPress={() =>
                        router.push({ pathname: '/edit_workout', params: { workoutId: item.id } })
                    }
                >
                    <Text style={localStyles.buttonText}>Edit Workout</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={localStyles.deleteButton}
                    onPress={() => {
                        alert(
                            'Delete Workout',
                        );
			deleteWorkout(item.id);
                    }}
                >
                    <Text style={localStyles.buttonText}>Delete</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={item.exercises}
                keyExtractor={(exercise) => exercise.eid}
                renderItem={({ item: exercise }) => (
                    <View style={styles.exerciseItem}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <Text style={styles.exerciseDetails}>
                            {exercise.sets} sets x {exercise.reps} reps @ {exercise.weight} lbs
                        </Text>
                    </View>
                )}
            />
        </View>
    );

    return (
        <View style={styles.outerWrapper}>
            <Navbar />
            <ScrollView style={styles.innerWrapper}>
                <Text style={styles.pageTitle}>Workouts</Text>
                <Button
                    title="Create New Workout"
                    onPress={() => router.push({ pathname: '/edit_workout', params: { workoutId: 'new' } })}
                />
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <FlatList
                        data={workouts}
                        keyExtractor={(item) => item.id}
                        renderItem={renderExercises}
                        ListEmptyComponent={
                            <Text style={styles.emptyMessage}>No workouts found.</Text>
                        }
                    />
                )}
            </ScrollView>
        </View>
    );
};

const localStyles = StyleSheet.create({
    workoutContainer: {
        marginBottom: 20,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#f8f8f8',
    },
    workoutTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    editButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    deleteButton: {
        backgroundColor: '#FF5722',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default Workout;
