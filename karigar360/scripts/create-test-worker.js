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

// Test worker credentials
const WORKER_EMAIL = 'worker@abc.com';
const WORKER_PASSWORD = '123456';

async function createTestWorker() {
  try {
    console.log('🔧 Creating Test Worker for Booking System...');
    console.log('='.repeat(60));
    
    // Step 1: Create worker in Firebase Auth
    console.log('📝 Step 1: Creating worker in Firebase Auth...');
    console.log(`📧 Email: ${WORKER_EMAIL}`);
    console.log(`🔑 Password: ${WORKER_PASSWORD}`);
    
    const userCredential = await createUserWithEmailAndPassword(auth, WORKER_EMAIL, WORKER_PASSWORD);
    const user = userCredential.user;
    console.log('✅ Worker created in Firebase Auth:', user.uid);
    
    // Step 2: Create worker document in Firestore
    console.log('\n📝 Step 2: Creating worker document in Firestore...');
    const now = new Date();
    const workerData = {
      uid: user.uid,
      email: WORKER_EMAIL,
      role: 'worker',
      phoneNumber: '+92 300 1234567',
      profile: {
        firstName: 'Test',
        lastName: 'Worker',
        fullName: 'Test Worker',
        address: 'Karachi, Pakistan',
        cnicVerified: true,
        cnicNumber: '12345-1234567-1',
        skills: ['Plumbing', 'Electrical Work', 'Carpentry'],
        experience: '5 years',
        hourlyRate: 1500,
        availability: 'Available',
        rating: 4.5,
        totalJobs: 25,
        bio: 'Experienced and reliable worker with 5 years of experience in various trades.'
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      status: 'approved' // Set to approved so worker can login
    };
    
    const workerDocRef = doc(db, 'users', user.uid);
    await setDoc(workerDocRef, workerData);
    console.log('✅ Worker document created in Firestore');
    
    // Step 3: Verify worker data
    console.log('\n📝 Step 3: Verifying worker data...');
    const workerDoc = await getDoc(workerDocRef);
    const storedData = workerDoc.data();
    
    console.log('📊 Worker Details:');
    console.log(`   📧 Email: ${storedData.email}`);
    console.log(`   👤 Role: ${storedData.role}`);
    console.log(`   📊 Status: ${storedData.status}`);
    console.log(`   🔧 Skills: ${storedData.profile.skills.join(', ')}`);
    console.log(`   💰 Hourly Rate: Rs. ${storedData.profile.hourlyRate}`);
    console.log(`   ⭐ Rating: ${storedData.profile.rating}/5`);
    console.log(`   📅 Created: ${storedData.createdAt}`);
    
    // Step 4: Test worker login
    console.log('\n📝 Step 4: Testing worker login...');
    
    // Sign out first
    await auth.signOut();
    console.log('✅ Signed out from creation session');
    
    // Sign in as worker
    const loginCredential = await signInWithEmailAndPassword(auth, WORKER_EMAIL, WORKER_PASSWORD);
    console.log('✅ Worker login successful');
    
    // Get worker data from Firestore
    const loginWorkerDoc = await getDoc(doc(db, 'users', loginCredential.user.uid));
    const loginWorkerData = loginWorkerDoc.data();
    
    console.log('📊 Login verification:');
    console.log(`   📧 Email: ${loginWorkerData.email}`);
    console.log(`   👤 Role: ${loginWorkerData.role}`);
    console.log(`   📊 Status: ${loginWorkerData.status}`);
    console.log(`   🔧 Skills: ${loginWorkerData.profile.skills.join(', ')}`);
    
    console.log('\n🎉 Test Worker Creation Complete!');
    console.log('='.repeat(60));
    console.log('📋 Worker Credentials:');
    console.log(`   📧 Email: ${WORKER_EMAIL}`);
    console.log(`   🔑 Password: ${WORKER_PASSWORD}`);
    console.log(`   👤 Role: worker`);
    console.log(`   📊 Status: approved`);
    console.log(`   🔧 Skills: Plumbing, Electrical Work, Carpentry`);
    console.log(`   💰 Hourly Rate: Rs. 1,500`);
    console.log(`   ⭐ Rating: 4.5/5`);
    console.log('\n✅ You can now use this worker account to test the booking system!');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Worker already exists, testing login...');
      try {
        await signInWithEmailAndPassword(auth, WORKER_EMAIL, WORKER_PASSWORD);
        console.log('✅ Existing worker can sign in successfully');
        console.log('\n📋 Worker Credentials:');
        console.log(`   📧 Email: ${WORKER_EMAIL}`);
        console.log(`   🔑 Password: ${WORKER_PASSWORD}`);
        console.log('✅ You can use this existing worker account to test the booking system!');
      } catch (signInError) {
        console.error('❌ Worker sign in failed:', signInError.message);
      }
    } else {
      console.error('❌ Error creating worker:', error.message);
    }
  }
}

// Run the function
createTestWorker();
