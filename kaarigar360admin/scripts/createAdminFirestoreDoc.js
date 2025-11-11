import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

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
const db = getFirestore(app);
const auth = getAuth(app);

// Admin credentials
const ADMIN_EMAIL = 'admin@kaarigar360.com';
const ADMIN_PASSWORD = 'admin123456';

async function createAdminFirestoreDoc() {
  try {
    console.log('🔐 Signing in as admin...');
    
    // Sign in as admin
    const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const adminUser = userCredential.user;
    
    console.log('✅ Admin signed in successfully');
    console.log('👤 Admin UID:', adminUser.uid);
    
    // Create admin document in Firestore
    const adminDocRef = doc(db, 'users', adminUser.uid);
    
    const adminData = {
      uid: adminUser.uid,
      email: ADMIN_EMAIL,
      role: 'admin',
      phoneNumber: '',
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        fullName: 'Admin User',
        address: 'Admin HQ',
        cnicVerified: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'approved'
    };
    
    console.log('📝 Creating admin document in Firestore...');
    await setDoc(adminDocRef, adminData);
    
    console.log('✅ Admin document created successfully!');
    console.log('📊 Admin data:', adminData);
    
    console.log('🎉 Admin setup complete!');
    console.log('🔗 Admin UID:', adminUser.uid);
    console.log('📧 Admin Email:', ADMIN_EMAIL);
    console.log('👑 Admin Role:', 'admin');
    
  } catch (error) {
    console.error('❌ Error creating admin document:', error);
    
    if (error.code === 'auth/user-not-found') {
      console.log('❌ Admin user does not exist. Please create the admin user first.');
    } else if (error.code === 'auth/wrong-password') {
      console.log('❌ Wrong password. Please check admin credentials.');
    } else if (error.code === 'permission-denied') {
      console.log('❌ Permission denied. Please check Firestore rules.');
    } else {
      console.log('❌ Error details:', error.message);
    }
    
    process.exit(1);
  }
}

// Run the function
createAdminFirestoreDoc();
