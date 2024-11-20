import { View, Text } from 'react-native';
import Navbar from './navbar';
import styles from './index_styles';
import { useAuth } from './auth_context';
import { useEffect } from 'react';
import { useRouter, rootNavigationState } from 'expo-router';

const History = () => {
    const { uid } = useAuth();
    const router = useRouter();

    useEffect(() => {
       if (uid === null) {
          setTimeout(() => {router.push('/login');}, 800);
       }
    }, [uid]); 

    return (
        <View style={styles.outerWrapper}>
            <Navbar />
            <View style={styles.innerWrapper}>
                <Text style={styles.pageTitle}>History</Text>
            </View>
        </View>
    );
};

export default History;
