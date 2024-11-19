import { View, Text, ScrollView } from 'react-native';
import Navbar from './navbar';
import styles from './index_styles';
import WorkoutCard from './WorkoutCard';
import { Link } from 'expo-router';

const Workout = () => {
    const workouts = [ // example data for now
        { id: 1, name: 'Leg/Glutes', exercises: [
            { id: 1, name: 'Squat', reps: '3 sets of 12', weight: '100lb', sets: 4 },
            { id: 2, name: 'Deadlift', reps: '4 sets of 10', weight: '140lb', sets: 3 },
            { id: 3, name: 'Bench Press', reps: '4 sets of 8', weight: '80lb', sets: 2 },
            { id: 4, name: 'Pull-up', reps: '4 sets of 10', weight: 'Bodyweight', sets: 2 },
            { id: 5, name: 'Lunge', reps: '3 sets of 12', weight: '60lb', sets: 3 },
        ]},
        { id: 2, name: 'Core', exercises: [
            { id: 1, name: 'Squat', reps: '3 sets of 12', weight: '100lb', sets: 4 },
            { id: 2, name: 'Deadlift', reps: '4 sets of 10', weight: '140lb', sets: 3 },
            { id: 3, name: 'Bench Press', reps: '4 sets of 8', weight: '80lb', sets: 2 },
            { id: 4, name: 'Pull-up', reps: '4 sets of 10', weight: 'Bodyweight', sets: 2 },
            { id: 5, name: 'Lunge', reps: '3 sets of 12', weight: '60lb', sets: 3 },
        ]},
        { id: 3, name: 'Arms', exercises: [
            { id: 1, name: 'Squat', reps: '3 sets of 12', weight: '100lb', sets: 4 },
            { id: 2, name: 'Deadlift', reps: '4 sets of 10', weight: '140lb', sets: 3 },
            { id: 3, name: 'Bench Press', reps: '4 sets of 8', weight: '80lb', sets: 2 },
            { id: 4, name: 'Pull-up', reps: '4 sets of 10', weight: 'Bodyweight', sets: 2 },
            { id: 5, name: 'Lunge', reps: '3 sets of 12', weight: '60lb', sets: 3 },
        ]},
    ];
    return (
        <View style={styles.outerWrapper}>
            <Navbar />
            <ScrollView style={styles.innerWrapper}>
                <Text style={styles.pageTitle}>Workout</Text>
                <Text style={styles.pageSubtitle}>Your Workouts</Text>

                <ScrollView contentContainerStyle={styles.workoutPage}>
                    {workouts.map((workout) => (
                        <Link style={styles.card}
                            key={workout.id}
                            href="/ViewWorkout"
                        >
                        <WorkoutCard name={workout.name} exercises={workout.exercises} />
                        </Link>
                    ))}
                </ScrollView>
            </ScrollView>
        </View>
    );
};

export default Workout;