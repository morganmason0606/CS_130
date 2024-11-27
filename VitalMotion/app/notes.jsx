import React, { useState, useEffect} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useAuth } from './auth_context.js';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import Navbar from './navbar.js';
import ModalForm, { PainNoteForm, MedicationNoteForm, JournalNoteForm} from './notes_forms.jsx';
import styles from './index_styles.js';
import theme from './design_system.js';

const Notes = () => {
    const { uid } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Pain');   // Default to Pain tab
    const [painNotes, setPainNotes] = useState([]);
    const [loading, setLoading] = useState(false);

    // TODO: Remove placeholder when fetching from backend is implemented.
    const [journals, setJournals] = useState([
        { id: 1, date: '2021-09-01', content: 'Journal entry 1' },
    ]);

    // TODO: Remove placeholder when fetching from backend is implemented.
    const [medNotes, setMedNotes] = useState([
        { id: 1, date: '2021-09-01', content: 'Medication note 1' },
    ]);
    
    // TODO: Fetch journals from backend.
    const fetchJournals = async () => {
        return;
    };

    // TODO: Delete journals from backend.
    const deleteJournal = async (id) => {
        return;
    };

    // TODO: Fetch medication notes from backend.
    const fetchMedNotes = async () => {
        setMedNotes([]);
        return;
    };

    // TODO: Delete medication notes from backend.
    const deleteMedNote = async (id) => {
        return;
    };

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
            fetchJournals();    // TODO: Check if this should be called here.
            fetchMedNotes();    // TODO: Check if this should be called here.
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
                <View style={localStyles.headerContainer}>
                    <Text style={styles.pageTitle}>Notes</Text>
                    {activeTab === 'Pain' && <ModalForm type="Pain Note" form={<PainNoteForm uid={uid} fetchPainNotes={fetchPainNotes} />} />}
                    {/* {activeTab === 'Medication' && <ModalForm type="Medication Note" form={<MedicationNoteForm />}/>} {/** TODO: Modify as needed. Given unexpected text node error. */} 
                    {activeTab === 'Journal' && <ModalForm type="Journal Entry" form={<JournalNoteForm />}/>}
                </View>
                
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
                            activeTab === 'Medication' && localStyles.tabActive,
                        ]}
                        onPress={() => setActiveTab('Medication')}
                    >
                        <Text style={localStyles.tabText}>Medication</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            localStyles.tab,
                            activeTab === 'Journal' && localStyles.tabActive,
                        ]}
                        onPress={() => setActiveTab('Journal')}
                    >
                        <Text style={localStyles.tabText}>Journal</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'Pain' && (
                    <ScrollView>
                        {loading ? (
                            <Text style={localStyles.loading}>Loading...</Text>
                        ) : (
                            painNotes && painNotes.length === 0 ?
                            (
                                <Text style={localStyles.noContent}>No pain notes to display.</Text>
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
                                                    <Text style={localStyles.noteValue}> {item.pain_level}/10</Text>
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
                            )
                        )}
                    </ScrollView>
                )}

                {activeTab === 'Medication' && (
                    <ScrollView>
                        {loading ? (
                            <Text style={localStyles.loading}>Loading...</Text>
                        ) : (
                            medNotes && medNotes.length === 0 ? (
                                <Text style={localStyles.noContent}>No medication notes to display.</Text>
                            ) : (
                                medNotes.map((medNote) => (
                                    <View key={medNote.id} style={localStyles.noteContainer}>
                                        <View>
                                            <Text style={localStyles.noteLabel}>Date:
                                                <Text style={localStyles.noteValue}> {convertDate(medNote.date)}</Text>
                                            </Text>
                                            <Text style={localStyles.noteValue}>{medNote.content}</Text>  {/** TODO */}
                                        </View>
                                        <TouchableOpacity
                                            style={localStyles.deleteButton}
                                            onPress={() => deleteMedNote(medNote.id)}  /** TODO */
                                        >
                                            <Feather name="trash-2" size={26} style={styles.iconButton} />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )
                        )}
                    </ScrollView>
                )}

                {activeTab === 'Journal' && (
                    <ScrollView>
                        {loading ? (
                            <Text style={localStyles.loading}>Loading...</Text>
                        ) : (
                            journals && journals.length === 0 ? (
                                <Text style={localStyles.noContent}>No journals to display.</Text>
                            ) : (
                                journals.map((journal) => (
                                    <View key={journal.id} style={localStyles.noteContainer}>
                                        <View>
                                            <Text style={localStyles.noteLabel}>Date:
                                                <Text style={localStyles.noteValue}> {convertDate(journal.date)} {`\n\n`}</Text>
                                            </Text>
                                            <Text style={localStyles.noteValue}>{journal.content}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={localStyles.deleteButton}
                                            onPress={() => deleteJournal(journal.id)}  /** TODO */
                                        >
                                            <Feather name="trash-2" size={26} style={styles.iconButton} />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )
                        )}
                    </ScrollView>
                )}
            </View>
        </ScrollView>
    );
};

const localStyles = StyleSheet.create({
    headerContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
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
    loading:{
        marginTop: '1rem',
        textAlign: 'center',
        fontSize: theme.fontSizes.regular,
    },
    noContent:{
        marginTop: '1rem',
        textAlign: 'center',
        fontSize: theme.fontSizes.regular,
    },
    noteContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: '1rem',
        padding: '1rem',

        borderRadius: '0.5rem',
        backgroundColor: theme.colors.grey,
    },
    noteLabel: {
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.bolder,
        marginBottom: 5,
    },
    noteValue: {
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.regular,
    },
});

export default Notes;