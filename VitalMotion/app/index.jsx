import { View, Text, Image } from 'react-native';
import Navbar from './navbar.js';
import styles from './index_styles.js';
import { useAuth } from './auth_context.js';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import Logo from './images/Logo.png';

/**
 * Starting page- this page should not be seen by users as authcontex should immediately push to either /login or /workouts
 * @returns {JSX.Element}
 */
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
          <View style={styles.home}>
            <View style={[styles.logoContainer, styles.homeLogoContainer]}>
              <Image alt="VitalMotion logo with running man" source={Logo} style={styles.homeLogo} />
            </View >
            <View style={styles.homeTextContainer}>
              <Text style={styles.homeText}>Simplify your physical therapy progress.</Text>
              <Text style={styles.homeText}>Manage your discomfort. Achieve your recovery goals.</Text>
            </View>
          </View>
      </View>
  );
}
