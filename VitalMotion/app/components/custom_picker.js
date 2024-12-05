import React from 'react';
import { StyleSheet, Picker } from 'react-native';
import theme from '../design_system';

/**
 * custom component for dropdown menu
 * @param {object} - props {data: list of values, selected value: the currently selected value, onValueChange; function for on value change, style: json for component css}
 * @returns {JSX.Element}
 */
const CustomPicker = ({ data, selectedValue, onValueChange, placeholder, style }) => {
  return (
    <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={[styles.picker, style]}
    >
        <Picker.Item label={placeholder} value="" />
        {data.map((item) => (
          <Picker.Item key={item.id} label={item.name} value={item.id} />
        ))}
    </Picker>
  );
};

const styles = StyleSheet.create({
    picker: {
        backgroundColor: theme.colors.offWhite,
        borderColor: theme.colors.aqua,
        borderWidth: 2,
        padding: '0.5rem',
        height: 40,
        marginBottom: 10,
        borderRadius: '0.5rem',
        fontSize: theme.fontSizes.small,
    },
    // TODO: Define styles for focused and/or active states.
});

export default CustomPicker;