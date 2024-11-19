import { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Navbar from './navbar.js';
import styles from './index_styles.js';

export default function Index() {
  return (
    <Navbar>
      <Text style={styles.innerWrapper}>Home screen (under construction :D) </Text>
    </Navbar>
  );
}
