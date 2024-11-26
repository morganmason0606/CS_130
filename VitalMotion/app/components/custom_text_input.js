import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import theme from '../design_system';

const CustomTextInput = ({ style, placeholder, keyboardType, value, onChangeText, ...rest }) => {
  return (
    <TextInput
        style={[styles.textInput, style]}
        placeholder={placeholder}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
        {...rest} 
    />
  );
};

const styles = StyleSheet.create({
    textInput: {
        backgroundColor: theme.colors.offWhite,
        borderColor: theme.colors.aqua,
        borderWidth: 2,
        padding: 10,
        height: 40,
        width: '100%',
        borderRadius: 10,
        fontSize: theme.fontSizes.small,
    },
});

export default CustomTextInput;