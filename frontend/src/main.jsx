// src/main.jsx - UPDATED VERSION WITH FIREBASE
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App';

// ✅ Firebase Import and Initialization
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
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

// Make Firebase available globally (optional)
window.firebaseApp = app;
window.firebaseAnalytics = analytics;

// ✅ CSS IMPORTS IN CORRECT ORDER:
// 1. Bootstrap CSS First
import 'bootstrap/dist/css/bootstrap.min.css';

// 2. Bootstrap JS Bundle
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// 3. FontAwesome Icons
import '@fortawesome/fontawesome-free/css/all.min.css';

// 4. Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css';

// 5. Custom CSS Last (Overrides Bootstrap)
import './index.css';

// Create React Root
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found! Check index.html');
}

const root = ReactDOM.createRoot(rootElement);

// Render App with all providers
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);