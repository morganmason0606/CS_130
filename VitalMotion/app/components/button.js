import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import theme from '../design_system';

const CustomButton = ({ title, onPress, style }) => (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
        <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    button: {
        display: 'flex',
        textAlign: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.aqua,
        padding: 15,
        borderRadius: 10,
        height: 50,
        flex: 'auto',
        // TODO: align button text vertically
    },
    buttonText: {
        color: theme.colors.white,
        fontSize: theme.fontSizes.regular,
        fontWeight: theme.fontWeights.bold,
    },
});

export default CustomButton;