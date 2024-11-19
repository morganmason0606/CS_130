import { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import styles from './index_styles.js';

export default function Navbar() {
  const [isHoveredWorkout, setIsHoveredWorkout] = useState(false);
  const [isHoveredHistory, setIsHoveredHistory] = useState(false);
  const [isHoveredNotes, setIsHoveredNotes] = useState(false);
  const [isHoveredLogin, setIsHoveredLogin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out: ", error.message);
    }
  };
  
  const handleMouseEnter = (page) => {
    switch (page){
      case 'Workout':
        setIsHoveredWorkout(true)
        break;
      case 'History':
        setIsHoveredHistory(true)
        break;
      case 'Notes':
        setIsHoveredNotes(true)
        break;
      case 'Login':
        setIsHoveredLogin(true)
        break;
      default:
        break;
    }
  }
  const handleMouseLeave = (page) => {
    switch (page){
      case 'Workout':
        setIsHoveredWorkout(false)
        break;
      case 'History':
        setIsHoveredHistory(false)
        break;
      case 'Notes':
        setIsHoveredNotes(false)
        break;
      case 'Login':
        setIsHoveredLogin(false)
        break;
      default:
        break;
    }
  }

  return (
    <View style={styles.navbar}>
    <Link
        href="/workout"
        style={[styles.pageLink, isHoveredWorkout && styles.pageLinkHovered]}
        onMouseEnter={()=>{handleMouseEnter('Workout')}}
        onMouseLeave={()=>{handleMouseLeave('Workout')}}
    >
        Workout
    </Link>

    <Link
        href="/history"
        style={[styles.pageLink, isHoveredHistory && styles.pageLinkHovered]}
        onMouseEnter={()=>{handleMouseEnter('History')}}
        onMouseLeave={()=>{handleMouseLeave('History')}}
    >
        History
    </Link>

    <Link
        href="/notes"
        style={[styles.pageLink, isHoveredNotes && styles.pageLinkHovered]}
        onMouseEnter={()=>{handleMouseEnter('Notes')}}
        onMouseLeave={()=>{handleMouseLeave('Notes')}}
    >
        Notes 
    </Link>

    {/* Login/Logout option based on if user is signed in */}
    {user ? (
      <Link
        href="#"
        style={[styles.pageLink, isHoveredLogin && styles.pageLinkHovered]}
        onMouseEnter={() => { handleMouseEnter('Login') }}
        onMouseLeave={() => { handleMouseLeave('Login') }}
        onPress={handleLogout}
      >
        Logout
      </Link>
    ) : (
      <Link
          href="/login"
          style={[styles.pageLink, isHoveredLogin && styles.pageLinkHovered]}
          onMouseEnter={()=>{handleMouseEnter('Login')}}
          onMouseLeave={()=>{handleMouseLeave('Login')}}
      >
          Login
      </Link>
    )}
    </View>
  );
}
