import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    User,
    UserCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User as AppUser } from '../../types/index';
import { getFirebaseServices } from './init';

// Create user account in Firebase Auth and Firestore
export const createUserAccount = async (
  email: string,
  password: string,
  userData: Omit<AppUser, 'uid' | 'createdAt' | 'updatedAt'>
): Promise<AppUser> => {
  try {
    const { auth, db } = await getFirebaseServices();

    // Create user in Firebase Auth
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;
    const now = new Date();

    // Update Firebase Auth profile
    await updateProfile(user, {
      displayName: userData.profile.fullName,
    });

    // Create user document in Firestore
    const newUser: AppUser = {
      uid: user.uid,
      email: user.email!,
      ...userData,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    console.log('👤 Creating user document:', newUser.email, 'Status:', newUser.status);
    await setDoc(doc(db, 'users', user.uid), newUser);
    console.log('✅ User document created successfully');

    return newUser;
  } catch (error: any) {
    console.error('Error creating user account:', error);
    throw new Error(error.message || 'Failed to create user account');
  }
};

// Sign in user
export const signInUser = async (email: string, password: string): Promise<AppUser> => {
  try {
    const { auth, db } = await getFirebaseServices();

    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      throw new Error('User profile not found. Please contact support.');
    }

    const userData = userDoc.data() as AppUser;
    
    // Check user status - only allow approved users to login
    if (userData.status === 'pending') {
      throw new Error('Your account is pending approval. Please wait for admin approval before accessing the app.');
    }
    
    if (userData.status === 'rejected') {
      throw new Error('Your account has been rejected. Please contact support for more information.');
    }
    
    if (userData.status === 'suspended') {
      throw new Error('Your account has been suspended. Please contact support for more information.');
    }
    
    if (userData.status !== 'approved') {
      throw new Error('Your account is not approved. Please contact support.');
    }
    
    return userData;
  } catch (error: any) {
    console.error('Error signing in user:', error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Invalid email or password');
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    }
    throw new Error(error.message || 'Failed to sign in');
  }
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    const { auth } = await getFirebaseServices();
    await signOut(auth);
  } catch (error: any) {
    console.error('Error signing out user:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

// Get current user data from Firestore
export const getCurrentUserData = async (user: User): Promise<AppUser | null> => {
  try {
    const { db } = await getFirebaseServices();
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as AppUser;
  } catch (error: any) {
    console.error('Error getting current user data:', error);
    throw new Error(error.message || 'Failed to get user data');
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updatedData: Partial<AppUser['profile']>
): Promise<AppUser> => {
  try {
    const { db } = await getFirebaseServices();
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const currentData = userDoc.data() as AppUser;
    const updatedUser: AppUser = {
      ...currentData,
      profile: {
        ...currentData.profile,
        ...updatedData,
        fullName: updatedData.firstName && updatedData.lastName
          ? `${updatedData.firstName} ${updatedData.lastName}`
          : currentData.profile.fullName,
      },
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userRef, updatedUser);

    return updatedUser;
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    throw new Error(error.message || 'Failed to update profile');
  }
};