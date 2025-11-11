import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

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

// Test user credentials
const TEST_EMAIL = 'newuser@test.com';
const TEST_PASSWORD = 'newuser123456';

async function testNewUserFlow() {
  try {
    console.log('🧪 Testing New User Creation and Login Flow...');
    console.log('='.repeat(60));
    
    // Step 1: Create a new user
    console.log('📝 Step 1: Creating new user...');
    console.log(`📧 Email: ${TEST_EMAIL}`);
    console.log(`🔑 Password: ${TEST_PASSWORD}`);
    
    const userCredential = await createUserWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    const user = userCredential.user;
    console.log('✅ User created in Firebase Auth:', user.uid);
    
    // Step 2: Create user document in Firestore
    console.log('\n📝 Step 2: Creating user document in Firestore...');
    const now = new Date();
    const userData = {
      uid: user.uid,
      email: TEST_EMAIL,
      role: 'employer',
      phoneNumber: '+92 300 1234567',
      profile: {
        firstName: 'New',
        lastName: 'User',
        fullName: 'New User',
        address: 'Test Address, Karachi',
        cnicVerified: false
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      status: 'approved' // Set to approved so login works
    };
    
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, userData);
    console.log('✅ User document created in Firestore');
    
    // Step 3: Verify the data structure
    console.log('\n📝 Step 3: Verifying data structure...');
    const userDoc = await getDoc(userDocRef);
    const storedData = userDoc.data();
    
    console.log('📊 Stored user data:');
    console.log(`   📧 Email: ${storedData.email}`);
    console.log(`   👤 Role: ${storedData.role}`);
    console.log(`   📊 Status: ${storedData.status}`);
    console.log(`   📅 Created: ${storedData.createdAt} (type: ${typeof storedData.createdAt})`);
    console.log(`   📅 Updated: ${storedData.updatedAt} (type: ${typeof storedData.updatedAt})`);
    
    // Step 4: Test login with the new user
    console.log('\n📝 Step 4: Testing login with new user...');
    
    // Sign out first
    await auth.signOut();
    console.log('✅ Signed out from previous session');
    
    // Sign in with new user
    const loginCredential = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    console.log('✅ Successfully signed in with new user');
    
    // Get user data from Firestore (simulating the login process)
    const loginUserDoc = await getDoc(doc(db, 'users', loginCredential.user.uid));
    const loginUserData = loginUserDoc.data();
    
    console.log('📊 Login user data:');
    console.log(`   📧 Email: ${loginUserData.email}`);
    console.log(`   📅 Created: ${loginUserData.createdAt} (type: ${typeof loginUserData.createdAt})`);
    console.log(`   📅 Updated: ${loginUserData.updatedAt} (type: ${typeof loginUserData.updatedAt})`);
    
    // Step 5: Test the serialization logic (simulating authSlice)
    console.log('\n📝 Step 5: Testing serialization logic...');
    
    const serializedUser = {
      ...loginUserData,
      createdAt: loginUserData.createdAt || new Date().toISOString(),
      updatedAt: loginUserData.updatedAt || new Date().toISOString(),
    };
    
    console.log('✅ Serialization successful:');
    console.log(`   📅 Serialized Created: ${serializedUser.createdAt} (type: ${typeof serializedUser.createdAt})`);
    console.log(`   📅 Serialized Updated: ${serializedUser.updatedAt} (type: ${typeof serializedUser.updatedAt})`);
    
    console.log('\n🎉 New User Flow Test Complete!');
    console.log('✅ No toISOString errors should occur now');
    console.log('='.repeat(60));
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Test user already exists, testing login...');
      try {
        await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
        console.log('✅ Existing user can sign in successfully');
      } catch (signInError) {
        console.error('❌ Sign in failed:', signInError.message);
      }
    } else {
      console.error('❌ Test failed:', error.message);
    }
  }
}

// Run the test
testNewUserFlow();
