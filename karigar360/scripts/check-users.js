import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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

async function checkUsers() {
  try {
    console.log('🔍 Checking users in Firestore...');
    
    // Get all users from Firestore
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    console.log(`📊 Found ${usersSnapshot.docs.length} users in Firestore:`);
    console.log('='.repeat(80));
    
    usersSnapshot.docs.forEach((doc, index) => {
      const userData = doc.data();
      console.log(`👤 User ${index + 1}:`);
      console.log(`   📧 Email: ${userData.email}`);
      console.log(`   🆔 UID: ${doc.id}`);
      console.log(`   👤 Role: ${userData.role || 'Not set'}`);
      console.log(`   📊 Status: ${userData.status || 'Not set'}`);
      console.log(`   📅 Created: ${userData.createdAt || 'Not set'}`);
      console.log(`   📅 Updated: ${userData.updatedAt || 'Not set'}`);
      console.log('   ' + '-'.repeat(60));
    });
    
    console.log('\n🔐 Test Credentials:');
    console.log('If you want to test login, try these credentials:');
    usersSnapshot.docs.forEach((doc, index) => {
      const userData = doc.data();
      if (userData.email) {
        console.log(`   Email: ${userData.email}`);
        console.log(`   Password: [You need to know the password for this account]`);
        console.log(`   Status: ${userData.status}`);
        console.log('   ' + '-'.repeat(40));
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
}

// Run the function
checkUsers();
