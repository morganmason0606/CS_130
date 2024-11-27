import React, { useState, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../design_system';

const CornerNotification = ({ message, visible, onDismiss }) => {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // slide in from corner when visible
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      // slide out when invisible
      Animated.spring(animation, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.notification,
        {
          opacity: animation,
          transform: [
            {
              translateX: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0], // slide from right
              }),
            },
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0], // slide from bottom
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  notification: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: theme.colors.black,
    opacity: 0.7,
    padding: 10,
    borderRadius: 8,
    width: 'auto',
    zIndex: 1000,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    color: theme.colors.white,
    fontSize: 16,
    marginRight: 10,
  },
  closeButton: {
    backgroundColor: 'transparent',
    padding: 5,
  },
  closeButtonText: {
    color: theme.colors.white,
    fontSize: 18,
  },
});

export default CornerNotification;
