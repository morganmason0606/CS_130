import { View, Text } from 'react-native';
import Navbar from './navbar';
import styles from './index_styles';

const History = () => {
    return (
        <View style={styles.outerWrapper}>
            <Navbar />
            <View style={styles.innerWrapper}>
                <Text style={styles.pageTitle}>History</Text>
            </View>
        </View>
    );
};

export default History;