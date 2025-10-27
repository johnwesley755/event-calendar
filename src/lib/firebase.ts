// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6Mcgmmkj8Ey_9BnlE0KnbvmEcxdLFBOY",
  authDomain: "calendar-5b6b0.firebaseapp.com",
  projectId: "calendar-5b6b0",
  storageBucket: "calendar-5b6b0.firebasestorage.app",
  messagingSenderId: "832021844663",
  appId: "1:832021844663:web:3e1ba6e2ae402929c1f332",
  measurementId: "G-2ML51KE6Q0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only on client side
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.error("Analytics initialization error:", error);
  }
}

// Initialize Firestore
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;