import React, {useState} from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import theme from '../design_system';

const CustomButton = ({ title, onPress, style, pointerEvents, isDisabled }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <TouchableOpacity
            style={[styles.button, style, hovered && styles.buttonHovered]}
            onPress={onPress}
            onPressIn={() => setHovered(true)}
            onPressOut={() => setHovered(false)}
            pointerEvents={pointerEvents}
            disabled={isDisabled}
        >
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        display: 'flex',
        textAlign: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.aqua,
        padding: 15,
        borderRadius: 10,
        height: 50,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    buttonText: {
        color: theme.colors.white,
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.bold,
    },
    buttonHovered: {
        backgroundColor: theme.links.light.hover,
    },
});

export default CustomButton;