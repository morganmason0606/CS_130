import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ScrollView,
    TextInput,
} from 'react-native';
import Navbar from './navbar';
import styles from './index_styles';
import { useAuth } from './auth_context';
import { useRouter } from 'expo-router';

const Notes = () => {
    const { uid } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Pain'); // Default to Pain tab
    const [painNotes, setPainNotes] = useState([]);
    const [newPainLevel, setNewPainLevel] = useState(5); // Default pain level
    const [newBodyPart, setNewBodyPart] = useState('');
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

    // Add a new pain note
    const addPainNote = async () => {
        try {
            const response = await fetch(`http://localhost:5001/add-pain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid,
                    date: new Date().toISOString().split('T')[0], // Format date
                    pain_level: newPainLevel,
                    body_part: newBodyPart,
                }),
            });

            if (response.ok) {
                alert('Success', 'Pain note added successfully.');
                fetchPainNotes();
                setNewPainLevel(5);
                setNewBodyPart('');
            } else {
                const error = await response.json();
                alert('Error', error.error);
            }
        } catch (err) {
            console.error('Error adding pain note:', err);
            alert('Error', 'Failed to add pain note.');
        }
    };

    // Edit a pain note
    const editPainNote = async (hashId, updatedPainLevel, updatedBodyPart) => {
        try {
            const response = await fetch(`http://localhost:5001/edit-pain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid,
                    hash_id: hashId,
                    pain_level: updatedPainLevel,
                    body_part: updatedBodyPart,
                }),
            });

            if (response.ok) {
                alert('Success', 'Pain note updated successfully.');
                fetchPainNotes();
            } else {
                const error = await response.json();
                alert('Error', error.error);
            }
        } catch (err) {
            console.error('Error editing pain note:', err);
            alert('Error', 'Failed to edit pain note.');
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
                alert('Success', 'Pain note deleted successfully.');
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

    const renderPainLevelRadio = () => (
        <View style={localStyles.radioContainer}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                <TouchableOpacity
                    key={level}
                    style={[
                        localStyles.radioButton,
                        newPainLevel === level && localStyles.radioSelected,
                    ]}
                    onPress={() => {console.log(`setting pain to ${level}`); setNewPainLevel(level);}}
                >
                    <Text
                        style={[
                            localStyles.radioText,
                            newPainLevel === level && localStyles.radioTextSelected,
                        ]}
                    >
                        {level}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <ScrollView style={styles.outerWrapper}>
            <Navbar />
            <View style={styles.innerWrapper}>
                <Text style={styles.pageTitle}>Notes</Text>
                <View style={localStyles.tabContainer}>
                    <TouchableOpacity
                        style={[
                            localStyles.tab,
                            activeTab === 'Pain' && localStyles.activeTab,
                        ]}
                        onPress={() => setActiveTab('Pain')}
                    >
                        <Text style={localStyles.tabText}>Pain</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            localStyles.tab,
                            activeTab === 'Other' && localStyles.activeTab,
                        ]}
                        onPress={() => setActiveTab('Other')}
                    >
                        <Text style={localStyles.tabText}>Other</Text>
                    </TouchableOpacity>
                </View>
                {activeTab === 'Pain' && (
                    <ScrollView>
                        <View style={localStyles.form}>
                            <TextInput
                                style={localStyles.input}
                                placeholder="Body Part"
                                value={newBodyPart}
                                onChangeText={setNewBodyPart}
                            />
                            <Text style={localStyles.label}>Pain Level:</Text>
                            {renderPainLevelRadio()}
                            <TouchableOpacity
                                style={localStyles.addButton}
                                onPress={addPainNote}
                            >
                                <Text style={localStyles.addButtonText}>Add Pain Note</Text>
                            </TouchableOpacity>
                        </View>
                        {loading ? (
                            <Text>Loading...</Text>
                        ) : (
                            <FlatList
                                data={painNotes}
                                keyExtractor={(item) => item.hash_id}
                                renderItem={({ item }) => (
                                    <View style={localStyles.noteItem}>
                                        <Text>Date: {item.date.split('T')[0]}</Text>
                                        <Text>Body Part: {item.body_part}</Text>
                                        <Text>Pain Level: {item.pain_level}</Text>
                                        <View style={localStyles.noteActions}>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    editPainNote(
                                                        item.hash_id,
                                                        newPainLevel,
                                                        newBodyPart
                                                    )
                                                }
                                            >
                                                <Text style={localStyles.editButton}>Edit</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => deletePainNote(item.hash_id)}
                                            >
                                                <Text style={localStyles.deleteButton}>Delete</Text>
                                            </TouchableOpacity>
                                        </View>
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
        flexDirection: 'row',
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderColor: 'transparent',
    },
    activeTab: {
        borderColor: '#4CAF50',
    },
    tabText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    form: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    radioContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    radioButton: {
        width: '9%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        margin: 2,
    },
    radioSelected: {
        backgroundColor: '#4CAF50',
    },
    radioText: {
        fontSize: 14,
        color: '#000',
    },
    radioTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    noteItem: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f8f8f8',
        borderRadius: 5,
    },
    noteActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    editButton: {
        color: '#4CAF50',
    },
    deleteButton: {
        color: '#FF5722',
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
});

export default Notes;
