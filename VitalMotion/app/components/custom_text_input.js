import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import theme from '../design_system';


/**
 * for creating custom text input 
 * @param {Object} props - {style: json of css, placeholder: place hodler placehodler text; keyboardType: text, value: string- inputed value, 
 * onChangeText:function - on change function, label: form label: rest: any other information needed}
 * @returns {JSX.Element}
 */
const CustomTextInput = ({ style, placeholder, keyboardType, value, onChangeText, label, ...rest }) => {
  return (
    <TextInput
        style={[styles.textInput, style]}
        placeholder={placeholder}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
        label={label}
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