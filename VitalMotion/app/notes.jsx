import { View, Text } from 'react-native';
import Navbar from './navbar';
import styles from './index_styles';

const Notes = () => {
    return (
        <View style={styles.outerWrapper}>
        <Navbar />
        <View style={styles.innerWrapper}>
            <Text style={styles.pageTitle}>Notes</Text>
            <Text style={styles.pageSubtitle}>Your Notes</Text>
        </View>
    </View>
    );
};

export default Notes;