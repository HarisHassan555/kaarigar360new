const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkqSpFkKlRigyyR732gNjSTICFsSjYdkM",
  authDomain: "kaarigar360.firebaseapp.com",
  projectId: "kaarigar360",
  storageBucket: "kaarigar360.firebasestorage.app",
  messagingSenderId: "601840315116",
  appId: "1:601840315116:android:922c14a626df6f711c93c9"
};

async function debugAuthentication() {
  try {
    console.log('🔍 Debugging Firebase Authentication...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized');
    console.log('🔐 Auth instance:', auth.app.name);
    console.log('📊 Firestore instance:', db.app.name);
    
    // Check if there are any users in the database
    console.log('👥 Checking for users in database...');
    
    // Try to get a user document (this will test permissions)
    const testUserId = 'test-user-id';
    const userRef = doc(db, 'users', testUserId);
    
    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        console.log('✅ User document found:', userDoc.data());
      } else {
        console.log('ℹ️ User document does not exist (this is normal for test)');
      }
    } catch (error) {
      console.error('❌ Error accessing user document:', error.message);
      console.error('❌ This suggests Firestore rules or authentication issues');
    }
    
    console.log('✅ Authentication debug completed');
    
  } catch (error) {
    console.error('❌ Authentication debug failed:', error);
    console.error('❌ Error details:', error.code, error.message);
  }
}

debugAuthentication();
