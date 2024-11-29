import React, { useState, useRef } from 'react';
import { Animated, Modal, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import CustomPicker from './components/custom_picker.js';
import theme from './design_system.js';

const ModalForm = ({ type, form }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);

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
    
    return (
        <View style={formStyles.container}>
            {/* Open Button */}
            <TouchableOpacity style={formStyles.openButton} onPress={toggleModal}>
                <Text style={formStyles.textButtonText}>+ New {type}</Text>
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
                        <View style={{width: '100%'}}>
                            {React.cloneElement(form, { toggleModal })}
                        </View>

                        {/* Cancel Button */}
                        <TouchableOpacity style={[formStyles.textButton, formStyles.cancelButton]} onPress={toggleModal}>
                            <Text style={formStyles.textButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
};

const PainNoteForm = ({ uid, fetchPainNotes, toggleModal}) =>  {
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

    const renderPainLevelRadio = () => (
        <View>
            <View style={formStyles.radioLabelWrapper}>
                <Text style={formStyles.radioLabel}>Not Painful</Text>
                <Text style={formStyles.radioLabel}>Extremely Painful</Text>
            </View>
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
        <ScrollView>
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

        </ScrollView>
    );
};

const JournalNoteForm = ({ uid, fetchJournals, toggleModal }) => {
    const [content, setContent] = useState('');
    const onChangeText = (text) => setContent(text);

	const addJournalEntry = async () => {
	    if (content === '') {
		alert('Please enter some content.');
		return;
	    }

	    try {
		const response = await fetch(`http://localhost:5001/users/${uid}/journals`, {
		    method: 'POST',
		    headers: {
			'Content-Type': 'application/json',
		    },
		    body: JSON.stringify({
			content,
			date: new Date().toISOString().split('T')[0],
		    }),
		});

		if (response.ok) {
		    console.log('Journal entry added successfully.');
		    fetchJournals();
		    setContent('');
		    toggleModal();
		} else {
		    const error = await response.json();
		    alert('Error', error.error);
		}
	    } catch (err) {
		console.error('Error adding journal entry:', err);
		alert('Error', 'Failed to add journal entry.');
	    }
	};

    return (
        <ScrollView>
            <Text style={formStyles.modalTitle}>Journal Entry</Text>
            <Text style={formStyles.label}>Content<Text style={theme.required}>*</Text></Text>
            <TextInput
                style={formStyles.journalInput}
                multiline={true}
                numberOfLines={4}
                onChangeText={onChangeText}
                value={content}
                placeholder="Enter your text here..."
            />
            <TouchableOpacity
                style={[formStyles.textButton, formStyles.addButton]}
                onPress={addJournalEntry}
            >
                <Text style={formStyles.textButtonText}>Add Journal Entry</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const MedicationNoteForm = ({ uid, fetchMedNotes, toggleModal }) => {
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [time, setTime] = useState('');

    const addMedicationNote = async () => {
        if (!name || !dosage || !time) {
            alert('All fields are required.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/users/${uid}/medications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, dosage, time, date: new Date().toISOString().split('T')[0]}),
            });

            if (response.ok) {
                console.log('Medication note added successfully.');
                fetchMedNotes();
                setName('');
                setDosage('');
                setTime('');
                toggleModal();
            } else {
                const error = await response.json();
                alert('Error', error.error);
            }
        } catch (err) {
            console.error('Error adding medication note:', err);
            alert('Error', 'Failed to add medication note.');
        }
    };

    return (
        <ScrollView>
            <Text style={formStyles.modalTitle}>New Medication Note</Text>
            <Text style={formStyles.label}>Name<Text style={theme.required}>*</Text></Text>
            <TextInput style={formStyles.journalInput} value={name} onChangeText={setName} placeholder="Enter medication name" />
            <Text style={formStyles.label}>Dosage<Text style={theme.required}>*</Text></Text>
            <TextInput style={formStyles.journalInput} value={dosage} onChangeText={setDosage} placeholder="Enter dosage" />
            <Text style={formStyles.label}>Time<Text style={theme.required}>*</Text></Text>
            <TextInput style={formStyles.journalInput} value={time} onChangeText={setTime} placeholder="Enter time" />

            <TouchableOpacity style={[formStyles.textButton, formStyles.addButton]} onPress={addMedicationNote}>
                <Text style={formStyles.textButtonText}>Add Medication Note</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const formStyles = StyleSheet.create({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    openButton: {
        padding: '1rem',
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
    radioLabel:{
        fontSize: theme.fontSizes.regular,
        marginBottom: '0.5rem',
    },
    radioLabelWrapper: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    radioContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: '1rem',
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
    journalInput: {
        width: '100%',
        padding: '0.5rem',
        marginBottom: '1rem',
        borderWidth: 2,
        borderColor: theme.colors.aqua,
        borderRadius: '0.5rem',
    }, // TODO: Add styles for focused and/or active states.
});

export default ModalForm;
export { PainNoteForm, MedicationNoteForm, JournalNoteForm };
