import { useState, useEffect } from 'react';
import { Text, View, Pressable, Image } from 'react-native';
import { Link } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { useAuth } from './auth_context';
import styles from './index_styles.js';
import Logo from './images/Logo.png';

export default function Navbar() {
  const [isHoveredWorkout, setIsHoveredWorkout] = useState(false);
  const [isHoveredHistory, setIsHoveredHistory] = useState(false);
  const [isHoveredNotes, setIsHoveredNotes] = useState(false);
  const [isHoveredLogin, setIsHoveredLogin] = useState(false);
  const [user, setUser] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
   try {
    // Sign out from Firebase
    console.log('Logging out...');
    await signOut(auth);
    logout();  // This will clear the uid in context and redirect the user
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
      <View style={styles.logoContainer}>
        <Image alt="VitalMotion logo with running man" source={Logo} style={styles.logo} />
      </View>
      <View style={styles.navLinks}>
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
          <Pressable
                    onMouseEnter={() => { handleMouseEnter('Login') }}
            onMouseLeave={() => { handleMouseLeave('Login') }}
            onPress={handleLogout}
          >
            <Text style={[styles.pageLink, isHoveredLogin && styles.pageLinkHovered]}>Logout</Text>
          </Pressable>
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
    </View>
  );
}
