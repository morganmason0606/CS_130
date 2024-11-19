import { View, Text } from 'react-native';
import Navbar from './navbar';
import styles from './index_styles';

const Workout = () => {
    return (
        <View style={styles.outerWrapper}>
            <Navbar />
            <View style={styles.innerWrapper}>
                <Text style={styles.pageTitle}>Workout</Text>
                <Text style={styles.pageSubtitle}>Your Workouts</Text>
            </View>
        </View>
    );
};

export default Workout;