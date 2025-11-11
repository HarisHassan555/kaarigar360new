import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'test123456';

async function createTestUser() {
  try {
    console.log('🧪 Creating test user...');
    console.log(`📧 Email: ${TEST_EMAIL}`);
    console.log(`🔑 Password: ${TEST_PASSWORD}`);
    
    // Try to create the test user
    const userCredential = await createUserWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    const user = userCredential.user;
    
    console.log('✅ Test user created successfully!');
    console.log(`🆔 UID: ${user.uid}`);
    
    // Create user document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userData = {
      uid: user.uid,
      email: TEST_EMAIL,
      role: 'employer',
      phoneNumber: '+92 300 1234567',
      profile: {
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
        address: 'Test Address, Karachi',
        cnicVerified: false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'approved' // Set to approved so login works
    };
    
    console.log('📝 Creating user document in Firestore...');
    await setDoc(userDocRef, userData);
    
    console.log('✅ User document created successfully!');
    console.log('🎉 Test user setup complete!');
    console.log('\n📋 Test Credentials:');
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   Password: ${TEST_PASSWORD}`);
    console.log(`   Status: approved`);
    console.log(`   Role: employer`);
    
    console.log('\n🔐 You can now test login with these credentials!');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Test user already exists, testing sign in...');
      try {
        await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
        console.log('✅ Test user can sign in successfully');
        console.log('\n📋 Test Credentials:');
        console.log(`   Email: ${TEST_EMAIL}`);
        console.log(`   Password: ${TEST_PASSWORD}`);
        console.log('   Status: existing user');
      } catch (signInError) {
        console.error('❌ Test user sign in failed:', signInError.message);
        console.log('💡 The user exists but password might be wrong or account is disabled');
      }
    } else {
      console.error('❌ Error creating test user:', error.message);
    }
  }
}

// Run the function
createTestUser();
