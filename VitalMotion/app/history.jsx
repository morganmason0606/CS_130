import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useAuth } from './auth_context';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import Navbar from './navbar';
import Graph from './history_graph';

import styles from './index_styles';
import theme from './design_system';

/**
 * History page component
 * @returns {JSX.Element}
 */
const History = () => {
    const { uid } = useAuth();
    const router = useRouter();

    const [workouts, setWorkouts] = useState([]);
    const [painNotes, setPainNotes] = useState([]);
    const [combinedHistory, setCombinedHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const [startDate, setStartDate] = useState('2024-01-01');       // YYYY-MM-DD format; random default values
    const [endDate, setEndDate] = useState('2024-11-28');           // YYYY-MM-DD format; random default values
    const [currentDate, _] = useState(new Date().toISOString().split('T')[0]);

    const [activeTab, setActiveTab] = useState('workouts');   // Active tab for pain or workouts; default: workouts

    // Set end date to current date if it is in the future
    useEffect(() => {
        currentDate > endDate ? setEndDate(endDate) : setEndDate(currentDate);
    }, [endDate]);

    // Fetch workout and pain history
    const fetchHistory = async () => {
        setLoading(true);
        try {
            // Fetch all completed workouts
            const workoutResponse = await fetch(
                `https://hassanrizvi14.pythonanywhere.com/users/${uid}/workouts/ALL/completed`,
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
                setWorkouts(parsedWorkouts);
            }

            // Fetch all pain notes
            const painResponse = await fetch(`https://hassanrizvi14.pythonanywhere.com/get-all-pain`, {
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
                setPainNotes(parsedPainNotes);
            }

            // Combine and sort by date
            const combinedHistory = [...parsedWorkouts, ...parsedPainNotes].sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            );
            setCombinedHistory(combinedHistory);
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch exercise name from eid
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
            fetchHistory();  // TODO: Bug – History does not refresh when workout or notes are added unless page is reloaded.
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

    const renderCalendars = () => {
        return(
            <View style={graphCalendarStyles.calendarContainer}>
                {/* Start Date Calendar */}
                <View style={graphCalendarStyles.calendarSubcontainer}>
                    <Text style={graphCalendarStyles.dateLabel}>Selected Start Date:
                        <Text style={graphCalendarStyles.dateValue}> {convertDate(startDate)}</Text>
                    </Text>
                    <Calendar
                        onDayPress={(newDate) => {
                            if (newDate.month < 10) {
                                newDate.month = `0${newDate.month}`;
                            }
                            if (newDate.day < 10) {
                                newDate.day = `0${newDate.day}`;
                            }
                            const newStartDate = `${newDate.year}-${newDate.month}-${newDate.day}`;
                            setStartDate(newStartDate);
                        }}
                        current={startDate}             // Date string in YYYY-MM-DD format (determines month to show)
                        maxDate={endDate}               // Date string in YYYY-MM-DD format (latest date user can select)
                        markedDates={{                  // Style selected dates
                            [startDate]: {
                                selected: true,
                            },
                        }}
                        style={graphCalendarStyles.calendar}
                        theme={calendarTheme}
                    />
                </View>

                {/* End Date Calendar */}
                <View style={graphCalendarStyles.calendarSubcontainer}>
                    <Text style={graphCalendarStyles.dateLabel}>Selected End Date:
                        <Text style={graphCalendarStyles.dateValue}> {convertDate(endDate)}</Text>
                    </Text>
                    <Calendar
                        onDayPress={(newDate) => {
                            if (newDate.month < 10) {
                                newDate.month = `0${newDate.month}`;
                            }
                            if (newDate.day < 10) {
                                newDate.day = `0${newDate.day}`;
                            }
                            const newEndDate = `${newDate.year}-${newDate.month}-${newDate.day}`;
                            setEndDate(newEndDate);
                        }}
                        current={endDate}               // Date string in YYYY-MM-DD format (determines month to show)
                        minDate={startDate}             // Date string in YYYY-MM-DD format (earliest date user can select)
                        maxDate={currentDate}           // Date string in YYYY-MM-DD format (latest date user can select)
                        markedDates={{                  // Style selected dates
                            [endDate]: {
                                selected: true,
                            },
                        }}
                        style={graphCalendarStyles.calendar}
                        theme={calendarTheme}
                    />
                </View>
            </View>
        )
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <Navbar />
            <ScrollView style={styles.innerWrapper}>
                <View style={localStyles.row}>
                    <View>
                        <Text style={styles.pageTitle}>History</Text>
                        <Text style={styles.pageSubtitle}>Your Completed Workouts:</Text>  {/** TODO: Make subheading more general since we display non-workout info. */}
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

                <View style={graphCalendarStyles.graphCalendarOuterContainer}>
                    <View style={graphCalendarStyles.graphCalendarInnerContainer}>
                        {renderCalendars()}

                        {/* Tabs for viewing different graphs. */}
                        <View style={localStyles.tabContainer}>
                            <TouchableOpacity
                                style={[
                                    localStyles.tab,
                                    activeTab === 'workouts' && localStyles.tabActive,
                                ]}
                                onPress={() => setActiveTab('workouts')}
                            >
                                <Text style={localStyles.tabText}>Workout Logs</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    localStyles.tab,
                                    activeTab === 'pain' && localStyles.tabActive,
                                ]}
                                onPress={() => setActiveTab('pain')}
                            >
                                <Text style={localStyles.tabText}>Pain Notes</Text>
                            </TouchableOpacity>
                        </View>

                        {activeTab === 'workouts' && 
                            <Graph
                                key={`${startDate}-${endDate}`}     // Re-render graph when date range changes
                                startDate={startDate}               // Date string in YYYY-MM-DD format
                                endDate={endDate}                   // Date string in YYYY-MM-DD format
                                type={'workouts'}                   // Type of data to display (workouts or pain)
                                data={workouts}
                            />
                        }

                        {activeTab === 'pain' && 
                            <Graph
                                key={`${startDate}-${endDate}`}     // Re-render graph when date range changes
                                startDate={startDate}               // Date string in YYYY-MM-DD format
                                endDate={endDate}                   // Date string in YYYY-MM-DD format
                                type={'pain'}                       // Type of data to display (workouts or pain)
                                data={painNotes}
                            />
                        }
                    </View>

                    <View style={{flex: 0.5,}}>
                        {combinedHistory.length === 0 ? (
                            <Text style={localStyles.emptyMessage}>No history found.</Text>
                        ) : (
                            <FlatList
                                data={combinedHistory}
                                keyExtractor={(_, index) => index.toString()}
                                renderItem={renderHistoryItem}
                            />
                        )}
                    </View>
                </View>
            </ScrollView>
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
    tabContainer: {
        display: 'flex',
        flexDirection: 'row',
    },
    tab: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        marginBottom: '1rem',
        padding: '0.5rem',
        borderBottomWidth: 4,
        borderColor: 'transparent',
    },
    tabActive: {
        borderColor: theme.colors.aqua,
    },
    tabText: {
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.bold,
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
    emptyMessage: {
        textAlign: 'center',
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.bold,
    },
});

const graphCalendarStyles = StyleSheet.create({
    button: {
        width: '8%',
        backgroundColor: theme.colors.aqua,
        padding: '0.5rem',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
    },
    buttonText: {
        textAlign: 'center',
        color: theme.colors.white,
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.bold,
    },
    graphCalendarOuterContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        columnGap: 20,
    },
    graphCalendarInnerContainer: {
        flex: 1,
        padding: '1rem',
        marginBottom: '1rem',
        borderRadius: '0.5rem',
        backgroundColor: theme.colors.dustyAqua,
    },
    dateLabel: {
        marginVertical: '0.5rem',
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.bolder,
    },
    dateValue: {
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.regular,
    },
    calendarContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        paddingTop: 0,
        marginBottom: '1rem',

        borderRadius: '0.5rem',
        backgroundColor: theme.colors.lightAqua,
    },
    calendarSubcontainer: {
        width: '48%',
    },
    calendar: {
        borderRadius: '0.5rem',
    },
});

const calendarTheme = {
    // Selected days
    selectedDayBackgroundColor: theme.colors.aqua, // Background color of selected date
    selectedDayTextColor: theme.colors.white, // Text color of selected date

    // Non-selected days
    textDayFontSize: theme.fontSizes.regular,
    textDisabledColor: theme.colors.darkGrey, // Color of disabled dates
    todayTextColor: theme.colors.aqua, // Color of today's date
    dayTextColor: theme.colors.black, // Color of non-disabled dates
    
    // Month and navigation arrows
    arrowColor: theme.colors.aqua,
    textMonthFontSize: theme.fontSizes.regular,
    textMonthFontWeight: theme.fontWeights.bold,
    monthTextColor: theme.colors.aqua, // Color of the month title

    // Day headers (e.g., Sun, Mon)
    textDayHeaderFontSize: theme.fontSizes.small,
    textSectionTitleColor: theme.colors.dustyAqua,
};

export default History;
