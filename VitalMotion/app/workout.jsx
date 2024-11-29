import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Button,
    StyleSheet,
    ScrollView,
    Image,
} from 'react-native';
import { MenuProvider, Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from './auth_context';
import Navbar from './navbar';
import CustomButton from './components/custom_button.js';
import styles from './index_styles';
import theme from './design_system.js';
import Feather from '@expo/vector-icons/Feather';
import WeightImage from './images/Weight.png';

const Workout = () => {
    const { uid } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWorkouts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://hassanrizvi14.pythonanywhere.com/users/${uid}/workouts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
	        console.log('Data:', data);
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
            const response = await fetch(`https://hassanrizvi14.pythonanywhere.com/users/${uid}/exercises/${eid}`, {
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
        } else if (pathname == '/workout') {
            fetchWorkouts();
        }
    }, [uid, pathname]);

    const deleteWorkout = async (workoutId) => {
        try {
            const response = await fetch(`https://hassanrizvi14.pythonanywhere.com/users/${uid}/workouts/${workoutId}`, {
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
        <View style={localStyles.card}>
            <View style={localStyles.row}>
                <Text style={localStyles.cardTitle}>Workout #{index + 1}</Text>
                <View style={localStyles.actionButtons}>
                    <TouchableOpacity
                        onPress={() =>
                            router.push({ pathname: '/edit_workout', params: { workoutId: item.id } })
                        }
                    >
                        <Feather name="edit" size={26} style={styles.iconButton} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                                    alert(
                                        'Delete Workout',
                                    );
                        deleteWorkout(item.id);
                                }}
                    >
                        <Feather name="trash-2" size={26} style={styles.iconButton} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={localStyles.row}>
                <Image alt="Image of barbell" source={WeightImage} style={localStyles.cardImage} />
                <View style={localStyles.exerciseContainer}>
                    <FlatList
                        data={item.exercises}
                        keyExtractor={(exercise) => exercise.eid}
                        renderItem={({ item: exercise }) => (
                            <View>
                                <Text style={localStyles.cardDetail}>
                                    <Text style={localStyles.bold}> {`\u2022 ${exercise.name}`}</Text>: {exercise.sets} sets x {exercise.reps} reps @ {exercise.weight} lbs
                                </Text>
                            </View>
                        )}
                        style={localStyles.exerciseInfo}
                    />
                    <CustomButton
                        title="Start Workout"
                        onPress={() =>
                            router.push({ pathname: '/do_workout', params: { templateId: item.id } })
                        }
                    />
                </View>
            </View>
        </View>
    );

    return (
        <MenuProvider>
            <View style={styles.outerWrapper}>
                <Navbar />
                <ScrollView style={styles.innerWrapper}>
                    <View style={localStyles.row}>
                        <View>
                            <Text style={styles.pageTitle}>Workouts</Text>
                            <Text style={styles.pageSubtitle}>Your Workouts</Text>
                        </View>
                        <View>
                            {/* Using react-native-popup-menu for the button */}
                            <Menu style={localStyles.menu}>
                                <MenuTrigger
                                    text="+ New Workout"
                                    customStyles={triggerStyles}
                                    style={localStyles.menuTrigger}
                                >
                                </MenuTrigger>
                                <MenuOptions customStyles={optionStyles}>
                                    <MenuOption
                                        text="Build From Scratch"
                                        onSelect={() => router.push({ pathname: '/edit_workout', params: { workoutId: 'new' } })}
                                    >
                                    </MenuOption>
                                    <MenuOption
                                        text="Get Recommended Workout"
                                        onSelect={() => router.push({ pathname: '/rec_workout' })}
                                    >
                                    </MenuOption>
                                </MenuOptions>
                            </Menu>

                            {/* <CustomButton
                                title="+ Create New Workout"
                                onPress={() => router.push({ pathname: '/edit_workout', params: { workoutId: 'new' }})}
                            />
                            <CustomButton
                                title="+ Get Workout Recommendation"
                                onPress={() => router.push({ pathname: '/rec_workout'})}
                            /> */}
                        </View>
                    </View>
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
        </MenuProvider>
    );
};

const triggerStyles = {
    triggerText: {
        color: theme.colors.white,
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.bold,
    },
    triggerWrapper: {
        backgroundColor: theme.colors.aqua,
        padding: 15,
        borderRadius: 10,
        height: 50,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    triggerTouchable: {
        activeOpacity: 70,
    },
}

const optionStyles = {
    optionText: {
        color: theme.colors.white,
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.bold,
    },
    optionWrapper: {
        backgroundColor: theme.colors.aqua,
        padding: 10,
    },
}

const localStyles = StyleSheet.create({
    workoutPage: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    menu: {
        marginRight: 30,
        marginTop: 50,
    },
    card: {
        backgroundColor: theme.colors.grey,
        width: '100%',
        padding: 25,
        marginTop: 15,
        marginBottom: 10,
        borderRadius: 30,
    },
    cardTitle: {
        fontSize: theme.fontSizes.large,
        fontWeight: theme.fontWeights.bold,
        marginBottom: 5,
    },
    cardDetail: {
        fontSize: theme.fontSizes.regular,
        marginTop: 5,
    },
    cardImage: {
        color: theme.colors.black,
        flexGrow: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        resizeMode: 'contain',
        height: 150,
    },
    exerciseContainer: {
        flexGrow: 3,
        justifyContent: 'flex-start',
    },
    exerciseInfo: {
        marginTop: 5,
        marginBottom: 15,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 5,
    },
    bold: {
        fontWeight: theme.fontWeights.bold,
    },
    menuTrigger: {
        top: -50,
    },
});

export default Workout;
