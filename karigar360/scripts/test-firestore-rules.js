import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkqSpFkKlRigyyR732gNjSTICFsSjYdkM",
  authDomain: "kaarigar360.firebaseapp.com",
  projectId: "kaarigar360",
  storageBucket: "kaarigar360.firebasestorage.app",
  messagingSenderId: "601840315116",
  appId: "1:601840315116:android:922c14a626df6f711c93c9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testFirestoreRules() {
  console.log('🧪 Testing Firestore Rules...');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Try to read users without authentication (should fail)
    console.log('🔍 Test 1: Reading users without authentication...');
    try {
      const usersRef = collection(db, 'users');
      await getDocs(usersRef);
      console.log('❌ FAIL: Should not be able to read users without auth');
    } catch (error) {
      if (error.code === 'permission-denied') {
        console.log('✅ PASS: Correctly denied access without authentication');
      } else {
        console.log('❌ FAIL: Unexpected error:', error.message);
      }
    }
    
    // Test 2: Sign in as test user and try to read users
    console.log('\n🔍 Test 2: Reading users with test user authentication...');
    try {
      await signInWithEmailAndPassword(auth, 'test@example.com', 'test123456');
      console.log('✅ Signed in as test user');
      
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      console.log(`✅ PASS: Successfully read ${usersSnapshot.docs.length} users`);
      
      // Show user details
      usersSnapshot.docs.forEach((doc, index) => {
        const userData = doc.data();
        console.log(`   👤 User ${index + 1}: ${userData.email} (${userData.role}) - Status: ${userData.status}`);
      });
      
    } catch (error) {
      console.log('❌ FAIL: Error reading users:', error.message);
    }
    
    // Test 3: Try to sign in as admin
    console.log('\n🔍 Test 3: Testing admin authentication...');
    try {
      await signInWithEmailAndPassword(auth, 'admin@kaarigar360.com', 'admin123456');
      console.log('✅ Signed in as admin');
      
      // Try to read admin actions (admin only)
      const adminActionsRef = collection(db, 'adminActions');
      const adminActionsSnapshot = await getDocs(adminActionsRef);
      console.log(`✅ PASS: Admin can read admin actions (${adminActionsSnapshot.docs.length} actions)`);
      
    } catch (error) {
      console.log('❌ FAIL: Admin authentication failed:', error.message);
    }
    
    console.log('\n🎉 Firestore Rules Test Complete!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFirestoreRules();
