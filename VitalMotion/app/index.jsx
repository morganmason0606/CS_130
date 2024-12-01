import { View, Text } from 'react-native';
import Navbar from './navbar.js';
import styles from './index_styles.js';
import { useAuth } from './auth_context.js';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
    const { uid } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (uid === null) {
        setTimeout(() => {router.push('/login');}, 800);
      }
      else {
        console.log('User ID:', uid);
      }
    }, [uid]); // Runs whenever uid changes

    useEffect(() => { // set title in browser
      document.title = 'VitalMotion';
    }, []);

  return (
      <View style={styles.outerWrapper}>
        <Navbar />
        <View style={styles.innerWrapper}>
        </View>
      </View>
  );
}
