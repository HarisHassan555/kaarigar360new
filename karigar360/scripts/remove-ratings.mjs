import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';

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

// Test credentials
const TEST_EMAIL = 'test2@test.com';
const TEST_PASSWORD = '123456';

async function removeRatings() {
  try {
    console.log('🚀 Removing ratings from completed tasks...');
    console.log(`📧 Authenticating as: ${TEST_EMAIL}`);

    // Sign in as test user
    const userCredential = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    const user = userCredential.user;
    console.log(`✅ Authenticated as: ${user.email} (${user.uid})`);

    // Get all ratings for this worker
    const ratingsRef = collection(db, 'ratings');
    const ratingsQuery = query(ratingsRef, where('workerId', '==', user.uid));
    const ratingsSnapshot = await getDocs(ratingsQuery);

    console.log(`📊 Found ${ratingsSnapshot.docs.length} ratings to remove`);

    // Delete all ratings
    for (const ratingDoc of ratingsSnapshot.docs) {
      const ratingData = ratingDoc.data();
      await deleteDoc(doc(db, 'ratings', ratingDoc.id));
      console.log(`✅ Removed rating for booking: ${ratingData.bookingId}`);
    }

    // Reset worker's rating to 0
    const workerRef = doc(db, 'users', user.uid);
    await updateDoc(workerRef, {
      'profile.rating': 0,
      updatedAt: new Date().toISOString()
    });

    console.log(`📊 Reset worker's average rating to: 0.0`);

    console.log('\n🎉 Ratings removed successfully!');
    console.log(`🗑️ Removed ${ratingsSnapshot.docs.length} ratings`);
    console.log(`👤 Worker: test2@test.com`);
    
    console.log('\n📱 You can now test the rating system:');
    console.log('1. Login as test2@test.com (worker) - completed jobs will show "No rating received yet"');
    console.log('2. Login as employer - completed jobs will show "Rate Worker" buttons');
    console.log('3. Test the complete rating workflow from start to finish!');

  } catch (error) {
    console.error('❌ Error removing ratings:', error);
  }
}

// Run the script
removeRatings().then(() => {
  console.log('\n✨ Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});

