import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getMessaging } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if config is valid
const validateConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'databaseURL',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  for (const field of requiredFields) {
    if (!firebaseConfig[field]) {
      console.error(`Missing required Firebase config field: ${field}`);
      return false;
    }

    if (field === 'databaseURL' && !firebaseConfig[field].startsWith('https://')) {
      console.error('Invalid databaseURL format. Must start with https://');
      return false;
    }
  }

  return true;
};

let app;
let database;
let messaging;
let analytics;

try {
  if (validateConfig()) {
    app = initializeApp(firebaseConfig);
    
    // Initialize Realtime Database with error handling
    try {
      database = getDatabase(app);
      console.log('Firebase Realtime Database initialized successfully');
    } catch (dbError) {
      console.error('Error initializing Firebase Realtime Database:', dbError);
    }
    
    // Only initialize analytics and messaging in browser environment
    if (typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics initialized successfully');
      } catch (analyticsError) {
        console.error('Error initializing Firebase Analytics:', analyticsError);
      }
      
      if ('Notification' in window) {
        try {
          messaging = getMessaging(app);
          console.log('Firebase Cloud Messaging initialized successfully');
        } catch (messagingError) {
          console.error('Error initializing Firebase Cloud Messaging:', messagingError);
        }
      }
    }
  } else {
    console.error('Firebase initialization skipped due to invalid configuration');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export { app, database, messaging, analytics };