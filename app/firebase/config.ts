// Import the Firebase SDK components
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
// Replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDp1LaLHvNdJhJpCQg1xyZB4NviNlgfnYQ",
  authDomain: "chatapp-ad13f.firebaseapp.com",
  projectId: "chatapp-ad13f",
  storageBucket: "chatapp-ad13f.firebasestorage.app",
  messagingSenderId: "68032398548",
  appId: "1:68032398548:web:2035baff4c8072f03e2741",
  databaseURL: "https://chatapp-ad13f-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);
const database = getDatabase(app);

export { app, auth, firestore, database }; 