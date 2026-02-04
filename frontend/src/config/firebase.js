// src/config/firebase.js - CORRECTED VERSION
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// ✅ CORRECT FIREBASE CONFIG (your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyAegCqca48S22H3EwRrEmS5JcsZKX79cfQ",
  authDomain: "blooddonationmnagmentsystem.firebaseapp.com",
  projectId: "blooddonationmnagmentsystem",
  storageBucket: "blooddonationmnagmentsystem.firebasestorage.app",
  messagingSenderId: "425803897153",
  appId: "1:425803897153:web:85ebe97183bd45c640a9c0",
  measurementId: "G-THDTND7JQ2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// ✅ CORRECT EXPORTS
export { app, analytics, database };
export default app;