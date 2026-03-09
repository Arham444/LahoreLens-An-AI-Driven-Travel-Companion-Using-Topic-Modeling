import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBJxev6FSq7yOMq28GpMXblBRMZjg8wF3k",
    authDomain: "lahorelens-476e9.firebaseapp.com",
    projectId: "lahorelens-476e9",
    storageBucket: "lahorelens-476e9.firebasestorage.app",
    messagingSenderId: "174169140135",
    appId: "1:174169140135:web:90ae5d73b6c01ca5f3e482",
    measurementId: "G-X22P5PC05X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
