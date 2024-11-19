import { View, Text, ScrollView } from 'react-native';
import Navbar from './navbar';
import styles from './index_styles';
import ExerciseCard from './ExerciseCard';
import { StyleSheet } from 'react-native';

const ViewWorkout = () => {
    const workout = // example data for now
        { id: 1, name: 'Leg/Glutes', exercises: [
            { id: 1, name: 'Squat', reps: '3 sets of 12', weight: '100lb', sets: 4 },
            { id: 2, name: 'Deadlift', reps: '4 sets of 10', weight: '140lb', sets: 3 },
            { id: 3, name: 'Bench Press', reps: '4 sets of 8', weight: '80lb', sets: 2 },
            { id: 4, name: 'Pull-up', reps: '4 sets of 10', weight: 'Bodyweight', sets: 2 },
            { id: 5, name: 'Lunge', reps: '3 sets of 12', weight: '60lb', sets: 3 },
        ]};
    return (
        <View style={styles.outerWrapper}>
            <Navbar />
            <ScrollView style={styles.innerWrapper}>
                <Text style={styles.pageTitle}>{workout.name}</Text>
                <Text style={styles.pageSubtitle}>Exercises</Text>

                <ScrollView contentContainerStyle={styles.workoutPage}>
                {workout.exercises.map((exercise) => (
                    <ExerciseCard
                    key={exercise.id}
                    name={exercise.name}
                    reps={exercise.reps}
                    weight={exercise.weight}
                    sets={exercise.sets}
                    />
                ))}
                </ScrollView>
            </ScrollView>
        </View>
    );
};

export default ViewWorkout;