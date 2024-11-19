import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Dimensions } from 'react-native';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';
import theme from './design_system.js';
import styles from './login_styles.js';

const LoginScreen = () => {
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
  	const [isHovered, setIsHovered] = useState(false);
	const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
	const router = useRouter();

	// Update width on screen resize
	useEffect(() => {
		const onChange = () => {
			setScreenWidth(Dimensions.get('window').width);
		};

		Dimensions.addEventListener('change', onChange);

		return () => {
			Dimensions.removeEventListener('change', onChange);
		};
	}, []);

    const handleLogin = async () => {
	    setError('');
        if (!password) {
            setError('Password cannot be empty.');
            return;
        }
	    console.log('Attempting login with:', email, password);
	    try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		console.log('User credential:', userCredential);
		const idToken = await userCredential.user.getIdToken();
		console.log('ID Token:', idToken);
		
		//Send the token to your Flask backend
		const response = await fetch('http://localhost:5001/verify-token', {
		    method: 'POST',
		    headers: {
			'Content-Type': 'application/json',
		    },
		    body: JSON.stringify({ token: idToken }),
		});

		console.log('Response from backend:', response);
		const data = await response.json();

		if (response.ok) {
		    console.log('Login Successful!', `Welcome, User ID: ${data.uid}`);
        alert('Login Successful!', `Welcome, User ID: ${data.uid}`);
			  router.push('/workout');  // navigate to workout page upon login
      
		} else {
		    console.log('Login Failed', data.error);
		}
	    } catch (error) {
		console.error('Error during login:', error);
		handleFireBaseError(error);
	    }
    };

    const handleSignUp = async () => {
        setError('');
		if (!firstName | !lastName | !email | !password) {
            setError('Please fill in all fields.');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('User signed up:', userCredential.user);
			const idToken = await userCredential.user.getIdToken();
			console.log('ID Token:', idToken);
			
			//Send the token to your Flask backend
			const response = await fetch('http://localhost:5001/verify-token', {
				method: 'POST',
				headers: {
				'Content-Type': 'application/json',
				},
				body: JSON.stringify({ token: idToken }),
			});
			const data = await response.json();

			if (response.ok) {
				const setup_response = await fetch('http://localhost:5001/setup-user', {
					    method: 'POST',
			    headers: {
					'Content-Type': 'application/json',
				    },
				    body: JSON.stringify({ uid: data.uid, firstName:firstName, lastName:lastName}),
				});
				console.log('Setup response:', setup_response);	
			}	
			
			alert('Sign-up successful! Please log in.');
			setIsSignUp(false); // Switch to login mode after successful sign-up

        } catch (error) {
            handleFireBaseError(error);
        }
    };

    const handleFireBaseError = (error) => {
	// Map Firebase authentication errors to user-friendly messages
	    // Credit for this code to google firebase documentation and my past self in CS35L
	    switch (error.code) {
	      case "auth/invalid-credential":
			setError("Invalid username or password");
			break;
	      case "auth/invalid-email":
			setError("Invalid email address. Please provide a valid email.");
			break;
	      case "auth/user-not-found":
			setError("User not found. Please sign up before logging in.");
			break;
	      case "auth/email-already-in-use":
			setError("This email is already in use. Try logging in.");
			break;
	      case "auth/invalid-email":
			setError("Invalid email address. Please provide a valid email.");
			break;
	      case "auth/weak-password":
			setError("Password is too weak. Please use a stronger password.");
			break;	
	      // Add more cases for other Firebase error codes as needed
	      default:
			setError("An error occurred. Please try again later.");
			break;
	    }
	  };
	
    return (
        <View
			style={[
				styles.container,
				{
					marginLeft: screenWidth*0.3,
					marginRight: screenWidth*0.3
				}
			]}
		>
			{isSignUp ? <Text style={styles.title}>Register</Text> : <Text style={styles.title}>Login</Text>}

			{isSignUp && (
				<>
					<Text style={styles.label}>
						First Name
						<Text style={theme.required}>*</Text>
					</Text>
					<TextInput
						style={styles.input}
						testID="firstName"
						value={firstName}
						onChangeText={setFirstName}
					/>
					<Text style={styles.label}>
						Last Name
						<Text style={theme.required}>*</Text>
					</Text>
					<TextInput
						style={styles.input}
						testID="lastName"
						value={lastName}
						onChangeText={setLastName}
					/>
				</>
			)}
			
			<Text style={styles.label}>
				Email
				<Text style={theme.required}>*</Text>
			</Text>
            <TextInput
				style={styles.input}
				testID="email"
				value={email}
				onChangeText={setEmail}
			/>
			{(error !== '') && <Text style={theme.error}>{error}</Text>}

			<Text style={styles.label}>
				Password
				<Text style={theme.required}>*</Text>
			</Text>
            <TextInput
				style={styles.input}
				testID="password"
				secureTextEntry
				value={password}
				onChangeText={setPassword}
			/>

            {isSignUp ? (
				<Text style={styles.submitButton} onPress={handleSignUp}>Register</Text>
            ) : (
                <Text style={styles.submitButton} onPress={handleLogin}>Login</Text>
            )}

			<Text
				style={[
					styles.pageSwapText,
					isHovered && styles.pageSwapTextHovered,
				]}
				onClick={() => setIsSignUp(!isSignUp)}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				{isSignUp ? "Already have an account? Log in here!" : "Don't have an account? Register for one here!"}
			</Text>
        </View>
    );
};

export default LoginScreen;

