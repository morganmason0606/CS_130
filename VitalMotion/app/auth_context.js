import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

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
      } else {
        // No user logged in, clear UID and redirect
        setUid(null);
      }
      setLoading(false); // Mark as loaded after checking auth state
    });

    return () => unsubscribe(); // Clean up on unmount
  }, [router]);

  const login = (userUid) => {
    setUid(userUid);
  };

  const logout = () => {
    setUid(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ uid, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
