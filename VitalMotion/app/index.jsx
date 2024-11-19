import { useState } from 'react';
import { Text, View } from 'react-native';
import Navbar from './navbar.js';
import styles from './index_styles.js';

const Index = () => {
  return (
    <View style={styles.outerWrapper}>
      <Navbar />
      <View style={styles.innerWrapper}>
        <Text>Home screen (under construction :D) </Text>
      </View>
    </View>
  );
};

export default Index;