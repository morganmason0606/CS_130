import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';


/**
 * Authentication context to manage and provide user authentication state and actions.
 * @typedef {Object} AuthContextType
 * @property {int} uid - user id, will be === undefined if not logged in
 * @property {Function} setUid - sets user id; done on Login page
 * @property {boolean} loading - If page is loading
 * @property {Function} setLoading - sets if page is loading
 * @property {Function} login - login function
 * @property {Function} logout - logout function
 */


const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * Provides Authentication state and actions to children 
 * @param {Object} child - child element 
 * @returns AuthContext
 * 
 */
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
