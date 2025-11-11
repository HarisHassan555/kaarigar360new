// Script to create admin user in Firebase
// Run this with: node scripts/createAdminUser.js

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDkqSpFkKlRigyyR732gNjSTICFsSjYdkM",
  authDomain: "kaarigar360.firebaseapp.com",
  projectId: "kaarigar360",
  storageBucket: "kaarigar360.firebasestorage.app",
  messagingSenderId: "601840315116",
  appId: "1:601840315116:android:922c14a626df6f711c93c9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const ADMIN_EMAIL = 'admin@kaarigar360.com';
const ADMIN_PASSWORD = 'admin123456';

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Try to create the admin user
    const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Admin user created successfully:', userCredential.user.uid);
    
    // Sign in to verify
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Admin user can sign in successfully');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Admin user already exists, testing sign in...');
      try {
        await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        console.log('✅ Admin user can sign in successfully');
      } catch (signInError) {
        console.error('❌ Admin sign in failed:', signInError.message);
      }
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
  }
}

createAdminUser();