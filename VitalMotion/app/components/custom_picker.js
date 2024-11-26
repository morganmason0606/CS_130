import React from 'react';
import { StyleSheet, Picker } from 'react-native';
import theme from '../design_system';

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
        padding: 10,
        height: 40,
        marginBottom: 10,
        borderRadius: 10,
        fontSize: theme.fontSizes.small,
    },
});

export default CustomPicker;