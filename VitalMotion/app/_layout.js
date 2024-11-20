import React from 'react';
import { AuthProvider, useAuth } from './auth_context'; // Import the useAuth hook
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <AuthWrapper />
      </View>
    </AuthProvider>
  );
}

const AuthWrapper = () => {
  const { loading } = useAuth();

  // If still loading, return a placeholder component like a spinner or simple text
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;// Render the main app after loading
};
