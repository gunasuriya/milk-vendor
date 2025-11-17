import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, setLogLevel } from "firebase/firestore";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyBMl2iJOLiIKmRcUWKQj-Yqu5CBifJqxUg",
    authDomain: "milk-tracker-827c1.firebaseapp.com",
    projectId: "milk-tracker-827c1",
    storageBucket: "milk-tracker-827c1.firebasestorage.app",
    messagingSenderId: "586078857760",
    appId: "1:586078857760:web:430733929a14ee4fb72a45",
    measurementId: "G-FFH8JENDJ5"
};

// Initialize Firebase
// We use getApps() to check if it's already initialized (good for Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

// Enable debug logging for Firestore (optional, but helpful)
// Note: This check ensures it only runs in the browser
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    setLogLevel('debug'); // Fix: Only log in 'development' mode
  }

// This is the special ID for your app's shared data
const appId = (typeof window !== 'undefined' && (window as any).__app_id) 
  ? (window as any).__app_id 
  : 'default-milk-vendor-app';


export { app, auth, db, appId };