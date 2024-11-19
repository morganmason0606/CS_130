import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native';
//import styles from './index_styles';

import theme from './design_system.js';

const ExerciseCard = ({name, reps, weight, sets}) => {
    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{name}</Text>
            <Text style={styles.cardDetail}>Reps: {reps}</Text>
            <Text style={styles.cardDetail}>Weight: {weight}</Text>
            <Text style={styles.cardDetail}>Sets: {sets}</Text>
        </View>
    );
};

const styles = StyleSheet.create({ // stylesheet here for now
    card: {
        width: '30%',
        padding: 20,
        margin: 15,
        marginVertical: 20,
        borderRadius: 10,
    },
    cardTitle: {
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.bold,
        marginBottom: 5,
    },
    cardDetail: {
        fontSize: theme.fontSizes.regular,
        marginTop: 5,
    },
});

export default ExerciseCard;