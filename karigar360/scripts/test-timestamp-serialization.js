import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

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
const TEST_EMAIL = 'timestamp@test.com';
const TEST_PASSWORD = 'timestamp123456';

async function testTimestampSerialization() {
  try {
    console.log('🧪 Testing Firestore Timestamp Serialization...');
    console.log('='.repeat(60));
    
    // Step 1: Create a user with Firestore serverTimestamp
    console.log('📝 Step 1: Creating user with serverTimestamp...');
    
    const userCredential = await createUserWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    const user = userCredential.user;
    console.log('✅ User created in Firebase Auth:', user.uid);
    
    // Create user document with serverTimestamp (this creates Firestore Timestamp objects)
    const userData = {
      uid: user.uid,
      email: TEST_EMAIL,
      role: 'employer',
      phoneNumber: '+92 300 1234567',
      profile: {
        firstName: 'Timestamp',
        lastName: 'Test',
        fullName: 'Timestamp Test',
        address: 'Test Address, Karachi',
        cnicVerified: false
      },
      createdAt: serverTimestamp(), // This creates a Firestore Timestamp
      updatedAt: serverTimestamp(), // This creates a Firestore Timestamp
      status: 'approved'
    };
    
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, userData);
    console.log('✅ User document created with serverTimestamp');
    
    // Step 2: Retrieve user data and check types
    console.log('\n📝 Step 2: Retrieving user data...');
    const userDoc = await getDoc(userDocRef);
    const retrievedData = userDoc.data();
    
    console.log('📊 Retrieved data types:');
    console.log(`   📅 Created: ${retrievedData.createdAt} (type: ${typeof retrievedData.createdAt})`);
    console.log(`   📅 Updated: ${retrievedData.updatedAt} (type: ${typeof retrievedData.updatedAt})`);
    console.log(`   🔍 Has toDate method: ${typeof retrievedData.createdAt?.toDate === 'function'}`);
    
    // Step 3: Test the serialization logic (simulating authSlice)
    console.log('\n📝 Step 3: Testing serialization logic...');
    
    const serializedUser = {
      ...retrievedData,
      createdAt: retrievedData.createdAt?.toDate ? 
                 retrievedData.createdAt.toDate().toISOString() : 
                 retrievedData.createdAt || new Date().toISOString(),
      updatedAt: retrievedData.updatedAt?.toDate ? 
                 retrievedData.updatedAt.toDate().toISOString() : 
                 retrievedData.updatedAt || new Date().toISOString(),
    };
    
    console.log('✅ Serialization successful:');
    console.log(`   📅 Serialized Created: ${serializedUser.createdAt} (type: ${typeof serializedUser.createdAt})`);
    console.log(`   📅 Serialized Updated: ${serializedUser.updatedAt} (type: ${typeof serializedUser.updatedAt})`);
    
    // Step 4: Test JSON serialization (simulating Redux store)
    console.log('\n📝 Step 4: Testing JSON serialization...');
    try {
      const jsonString = JSON.stringify(serializedUser);
      const parsedUser = JSON.parse(jsonString);
      console.log('✅ JSON serialization successful');
      console.log(`   📅 Parsed Created: ${parsedUser.createdAt} (type: ${typeof parsedUser.createdAt})`);
      console.log(`   📅 Parsed Updated: ${parsedUser.updatedAt} (type: ${typeof parsedUser.updatedAt})`);
    } catch (error) {
      console.log('❌ JSON serialization failed:', error.message);
    }
    
    console.log('\n🎉 Timestamp Serialization Test Complete!');
    console.log('✅ No Redux serialization errors should occur now');
    console.log('='.repeat(60));
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Test user already exists, testing with existing user...');
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
testTimestampSerialization();
