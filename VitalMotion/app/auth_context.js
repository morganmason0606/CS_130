import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is logged in, set the UID
        setUid(user.uid);
        await AsyncStorage.setItem('uid', user.uid);
      } else {
        // No user logged in, clear UID and redirect
        setUid(null);
        await AsyncStorage.removeItem('uid');
      }
      setLoading(false); // Mark as loaded after checking auth state
    });

    return () => unsubscribe(); // Clean up on unmount
  }, [router]);

  const login = (userUid) => {
    setUid(userUid);
    AsyncStorage.setItem('uid', userUid);
  };

  const logout = () => {
    setUid(null);
    AsyncStorage.removeItem('uid');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ uid, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
