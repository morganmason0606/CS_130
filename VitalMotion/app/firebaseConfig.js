// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { credentials } from "../credentials";

// Initialize Firebase
const app = initializeApp(credentials);
const auth = getAuth(app);

export { auth };
