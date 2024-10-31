import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    const handleLogin = async () => {
	    setError('');
	    console.log('Attempting login with:', email, password);
	    try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		console.log('User credential:', userCredential);
		const idToken = await userCredential.user.getIdToken();
		console.log('ID Token:', idToken);
		
		//Send the token to your Flask backend
		const response = await fetch('http://localhost:5000/verify-token', {
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
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('User signed up:', userCredential.user);
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
	      case "auth/wrong-password":
		setError("Wrong password. Please check your password.");
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
        <View>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
            {isSignUp ? (
                <Button title="Sign Up" onPress={handleSignUp} />
            ) : (
                <Button title="Login" onPress={handleLogin} />
            )}
            {(error !== '') && <Text>{error}</Text>}
            <Text onPress={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign up"}
            </Text>
        </View>
    );
};

export default LoginScreen;

