import React, { useState, useEffect, useRef} from 'react';
import {
    View,
    Text,
    Animated,
    Modal,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useAuth } from './auth_context';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import Navbar from './navbar';
import CustomPicker from './components/custom_picker.js';
import styles from './index_styles.js';
import theme from './design_system.js';

const PainNoteForm = ({ uid, fetchPainNotes }) =>  {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [newBodyPart, setNewBodyPart] = useState('');
    const [newPainLevel, setNewPainLevel] = useState(5);            // Default pain level = 5
    const [hoveredPainLevel, setHoveredPainLevel] = useState(0);

    // Static list of body parts
    const ABS = "Abs";
    const BACK = "Back";
    const BICEPS = "Biceps";
    const CHEST = "Chest";
    const FOREARMS = "Forearms";
    const GLUTES = "Glutes";
    const HAMSTRINGS = "Hamstrings";
    const QUADRICEPS = "Quadriceps";
    const SHOULDERS = "Shoulders";
    const TRAPS = "Traps";
    const TRICEPS = "Triceps";
    const muscles = [
        ABS,
        BACK,
        BICEPS,
        CHEST,
        FOREARMS,
        GLUTES,
        HAMSTRINGS,
        QUADRICEPS,
        SHOULDERS,
        TRAPS,
        TRICEPS,
    ];
    const musclesMap = muscles.map((muscle, i) => ({ id: i+1, name: muscle }));    
    
    // Animated value for the vertical slide
    const slideValue = useRef(new Animated.Value(-500)).current;

    const toggleModal = () => {
        // Close modal if it's already open: slide out and hide modal
        if (isModalVisible) {
            Animated.timing(slideValue, {
                toValue: -500, // Slide out off-screen
                duration: 300,
                useNativeDriver: true,
            }).start(() => setIsModalVisible(false));
        }
        // Open modal: slide in and show modal
        else {
            setIsModalVisible(true);
            Animated.timing(slideValue, {
                toValue: 0, // Slide to the center
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    };

    const renderPainLevelRadio = () => (
        <View style={formStyles.radioContainer}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                <TouchableOpacity
                    key={level}
                    style={[
                        formStyles.radioButton,
                        newPainLevel === level && formStyles.radioButtonSelected,
                        newPainLevel !== level && hoveredPainLevel === level && formStyles.radioButtonHovered,
                    ]}
                    onPress={() => {console.log(`Set new pain level to ${level}.`); setNewPainLevel(level);}}
                    onMouseEnter={() => {setHoveredPainLevel(level)}}
                    onMouseLeave={() => {setHoveredPainLevel(0)}}
                >
                    <Text
                        style={[
                            formStyles.radioText,
                            newPainLevel === level && formStyles.radioTextSelected,
                        ]}
                    >
                        {level}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    // Add a new pain note
    const addPainNote = async () => {
        // Body part is required
        if(newBodyPart === '') {
            alert('Please select a body part.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/add-pain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid,
                    date: new Date().toISOString().split('T')[0], // Format date as MM/DD/YYYY
                    pain_level: newPainLevel,
                    body_part: newBodyPart,
                }),
            });

            if (response.ok) {
                console.log('Pain note added successfully.');
                fetchPainNotes();
                setNewPainLevel(5);     // Reset pain level to default value.
                setNewBodyPart('');     // Unselect body part.
                toggleModal();          // Close modal only if successful.
            } else {
                const error = await response.json();
                alert('Error', error.error);
            }
        } catch (err) {
            console.error('Error adding pain note:', err);
            alert('Error', 'Failed to add pain note.');
        }
    };

    const handlePickerSelection = (value) => {
        const muscle = musclesMap.find((muscle) => muscle.id === parseInt(value));
        setNewBodyPart(muscle.name);
    }

    return (
        <View style={formStyles.container}>
            {/* Open Button */}
            <TouchableOpacity style={formStyles.openButton} onPress={toggleModal}>
                <Text style={formStyles.textButtonText}>New Pain Note</Text>
            </TouchableOpacity>

            {/* Modal Popup */}
            <Modal
                transparent={true}
                animationType="none"
                visible={isModalVisible}
            >
                <View style={formStyles.modalOverlay}>
                    {/* Animated Modal Content */}
                    <Animated.View
                        style={[
                            formStyles.modalContent,
                            { transform: [{ translateY: slideValue }] }, // Slide animation
                        ]}
                    >
                        <Text style={formStyles.modalTitle}>New Pain Note</Text>

                        <Text style={formStyles.label}>Body Part<Text style={theme.required}>*</Text></Text>

                        <CustomPicker
                            data={musclesMap}
                            style={formStyles.picker}
                            value={newBodyPart}
                            onValueChange={(value) => handlePickerSelection(value)}
                            placeholder="Select body part"
                        />

                        <Text style={formStyles.label}>Pain Level<Text style={theme.required}>*</Text></Text>
                        {renderPainLevelRadio()}

                        {/* Add Button */}
                        <TouchableOpacity
                            style={[formStyles.textButton, formStyles.addButton]}
                            onPress={addPainNote}
                        >
                            <Text style={formStyles.textButtonText}>Add Pain Note</Text>
                        </TouchableOpacity>

                        {/* Cancel Button */}
                        <TouchableOpacity style={[formStyles.textButton, formStyles.cancelButton]} onPress={toggleModal}>
                            <Text style={formStyles.textButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    )
}

const Notes = () => {
    const { uid } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Pain');   // Default to Pain tab
    const [painNotes, setPainNotes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch all pain notes
    const fetchPainNotes = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5001/get-all-pain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uid }),
            });

            if (response.ok) {
                const data = await response.json();
                setPainNotes(data.pain);
            } else {
                const error = await response.json();
                console.error('Failed to fetch pain notes:', error.error);
            }
        } catch (err) {
            console.error('Error fetching pain notes:', err);
        } finally {
            setLoading(false);
        }
    };

    // Delete a pain note
    const deletePainNote = async (hashId) => {
        try {
            const response = await fetch(`http://localhost:5001/remove-pain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uid, hash_id: hashId }),
            });

            if (response.ok) {
                console.log('Pain note deleted successfully.');
                fetchPainNotes();
            } else {
                const error = await response.json();
                alert('Error', error.error);
            }
        } catch (err) {
            console.error('Error deleting pain note:', err);
            alert('Error', 'Failed to delete pain note.');
        }
    };

    useEffect(() => {
        if (uid === null) {
            setTimeout(() => {
                router.push('/login');
            }, 800);
        } else {
            fetchPainNotes();
        }
    }, [uid]);

    const convertDate = (date) => {
        const [year, month, day] = date.split('-');
        return `${month}/${day}/${year}`;
    }

    return (
        <ScrollView style={styles.outerWrapper}>
            <Navbar />

            <View style={styles.innerWrapper}>
                <Text style={styles.pageTitle}>Notes</Text>
                
                <View style={localStyles.tabContainer}>
                    <TouchableOpacity
                        style={[
                            localStyles.tab,
                            activeTab === 'Pain' && localStyles.tabActive,
                        ]}
                        onPress={() => setActiveTab('Pain')}
                    >
                        <Text style={localStyles.tabText}>Pain</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            localStyles.tab,
                            activeTab === 'Other' && localStyles.tabActive,
                        ]}
                        onPress={() => setActiveTab('Other')}
                    >
                        <Text style={localStyles.tabText}>Other</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'Pain' && (
                    <ScrollView>
                        <PainNoteForm uid={uid} fetchPainNotes={fetchPainNotes}/>

                        {loading ? (
                            <Text>Loading...</Text>
                        ) : (
                            <FlatList
                                data={painNotes}
                                keyExtractor={(item) => item.hash_id}
                                renderItem={({ item }) => (
                                    <View style={localStyles.noteContainer}>
                                        <View>
                                            <Text style={localStyles.noteLabel}>Date:
                                                <Text style={localStyles.noteValue}> {convertDate(item.date.split('T')[0])}</Text>
                                            </Text>
                                            <Text style={localStyles.noteLabel}>Body Part:
                                                <Text style={localStyles.noteValue}> {item.body_part}</Text>
                                            </Text>
                                            <Text style={localStyles.noteLabel}>Pain Level:
                                                <Text style={localStyles.noteValue}> {item.pain_level}</Text>
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={localStyles.deleteButton}
                                            onPress={() => deletePainNote(item.hash_id)}
                                        >
                                            <Feather name="trash-2" size={26} style={styles.iconButton} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        )}
                    </ScrollView>
                )}
            </View>
        </ScrollView>
    );
};

const localStyles = StyleSheet.create({
    tabContainer: {
        display: 'flex',
        flexDirection: 'row',
    },
    tab: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        padding: '0.5rem',
        borderBottomWidth: 2,
        borderColor: 'transparent',
    },
    tabActive: {
        borderColor: theme.colors.aqua,
    },
    tabText: {
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.bold,
    },
    noteContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        padding: '1rem',

        borderRadius: '0.5rem',
        backgroundColor: theme.colors.grey,
    },
    noteLabel: {
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.bold,
        marginBottom: 5,
    },
    noteValue: {
        fontWeight: theme.fontWeights.regular,
    },
});

const formStyles = StyleSheet.create({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    openButton: {
        padding: '0.5rem',
        borderRadius: '0.5rem',
        backgroundColor: theme.colors.aqua,
    },
    modalOverlay: {
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.darkGrey + '80',
    },
    modalContent: {
        width: '80%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '1.5rem',

        borderRadius: '0.5rem',
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: '0.5rem',
        backgroundColor: theme.colors.white,
    },
    modalTitle: {
        alignSelf: 'center',
        marginBottom: '1rem',
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.bold,
    },
    label: {
        marginBottom: '0.5rem',
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.bold,
    },
    picker: {
        width: '100%',
    },
    radioContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginVertical: '1rem',
    },
    radioButton: {
        width: '9%',
        aspectRatio: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0.25rem',
        
        borderRadius: '25%',
        borderWidth: 2,
        borderColor: theme.colors.aqua,
    },
    radioButtonSelected: {
        backgroundColor: theme.colors.aqua,
    },
    radioButtonHovered: {
        backgroundColor: theme.colors.lightAqua,
    },
    radioText: {
        color: theme.colors.black,
        fontSize: theme.fontSizes.regular,
    },
    radioTextSelected: {
        color: theme.colors.white,
        fontWeight: theme.fontWeights.bold,
    },
    textButton: {
        width: '100%',
        padding: '0.5rem',
        borderRadius: '0.5rem',
    },
    textButtonText: {
        textAlign: 'center',
        color: theme.colors.white,
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.bold,
    },
    addButton: {
        marginBottom: '0.5rem',
        backgroundColor: theme.colors.aqua,
    },
    cancelButton: {
        backgroundColor: theme.colors.darkGrey,
    },
});

export default Notes;
