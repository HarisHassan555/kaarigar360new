// Firebase initialization for Node.js scripts
const { initializeApp, getApps } = require('firebase/app');
const { getAuth, initializeAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
const { getStorage } = require('firebase/storage');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkqSpFkKlRigyyR732gNjSTICFsSjYdkM",
  authDomain: "kaarigar360.firebaseapp.com",
  projectId: "kaarigar360",
  storageBucket: "kaarigar360.firebasestorage.app",
  messagingSenderId: "601840315116",
  appId: "1:601840315116:android:922c14a626df6f711c93c9"
};

let app = null;
let auth = null;
let db = null;
let storage = null;

const initializeFirebase = () => {
  try {
    // Initialize Firebase app
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    // Initialize Firebase Auth for Node.js
    auth = getAuth(app);

    // Initialize other Firebase services
    db = getFirestore(app);
    storage = getStorage(app);

    console.log('✅ Firebase initialized successfully');
    return { app, auth, db, storage };
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
};

const getFirebaseServices = () => {
  if (!app || !auth || !db || !storage) {
    return initializeFirebase();
  }
  return { app, auth, db, storage };
};

module.exports = {
  initializeFirebase,
  getFirebaseServices,
  app,
  auth,
  db,
  storage
};
