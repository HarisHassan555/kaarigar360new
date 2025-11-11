import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';

// Admin credentials
const ADMIN_EMAIL = 'admin@kaarigar360.com';
const ADMIN_PASSWORD = 'admin123456';

export const signInAsAdmin = async (): Promise<FirebaseUser | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Admin signed in successfully');
    return userCredential.user;
  } catch (error: any) {
    console.error('❌ Admin sign in failed:', error);
    if (error.code === 'auth/user-not-found') {
      console.log('Admin user does not exist. Please create the admin user first.');
    }
    throw error;
  }
};

export const signOutAdmin = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('✅ Admin signed out successfully');
  } catch (error) {
    console.error('❌ Admin sign out failed:', error);
    throw error;
  }
};

export const getCurrentAdmin = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const onAdminAuthStateChanged = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Initialize admin authentication on app start
export const initializeAdminAuth = async (): Promise<FirebaseUser | null> => {
  try {
    console.log('🔐 Initializing admin authentication...');
    
    // Check if already signed in
    if (auth.currentUser) {
      console.log('✅ Admin already signed in:', auth.currentUser.email);
      return auth.currentUser;
    }

    console.log('🔑 Attempting to sign in as admin...');
    // Try to sign in as admin
    const adminUser = await signInAsAdmin();
    console.log('✅ Admin signed in successfully:', adminUser?.email);
    return adminUser;
  } catch (error) {
    console.error('❌ Failed to initialize admin auth:', error);
    return null;
  }
};
