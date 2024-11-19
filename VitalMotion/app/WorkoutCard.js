import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native';
//import styles from './index_styles';

import theme from './design_system.js';

const WorkoutCard = ({name, exercises}) => {
    return (
        <View>
            <Text style={styles.cardTitle}>{name}</Text>
            <View>
                {exercises.map(exercise => (
                    <View key={exercise.id}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({ // stylesheet here for now
    card: {
        backgroundColor: theme.colors.grey,
        width: '100%',
        padding: 20,
        marginVertical: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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

export default WorkoutCard;