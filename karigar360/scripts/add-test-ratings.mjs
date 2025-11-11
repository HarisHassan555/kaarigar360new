import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, getDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';

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

// Test data for completed tasks and ratings
const testBookings = [
  {
    status: 'completed',
    date: new Date('2024-01-15T10:00:00Z'),
    task: 'Plumbing Repair',
    service: 'Plumbing Repair',
    description: 'Fixed leaking kitchen faucet and replaced old pipes',
    location: {
      latitude: 24.8607,
      longitude: 67.0011,
      address: 'Block 6, PECHS, Karachi'
    },
    payment: {
      amount: 2500,
      status: 'completed'
    },
    employerName: 'Ahmed Ali',
    createdAt: new Date('2024-01-10T08:00:00Z'),
    updatedAt: new Date('2024-01-15T12:00:00Z')
  },
  {
    status: 'completed',
    date: new Date('2024-01-20T14:00:00Z'),
    task: 'Electrical Work',
    service: 'Electrical Work',
    description: 'Installed new ceiling fan and fixed electrical outlets',
    location: {
      latitude: 24.8607,
      longitude: 67.0011,
      address: 'DHA Phase 2, Karachi'
    },
    payment: {
      amount: 3500,
      status: 'completed'
    },
    employerName: 'Sara Khan',
    createdAt: new Date('2024-01-18T10:00:00Z'),
    updatedAt: new Date('2024-01-20T16:00:00Z')
  },
  {
    status: 'completed',
    date: new Date('2024-01-25T09:00:00Z'),
    task: 'Carpentry Work',
    service: 'Carpentry Work',
    description: 'Built custom bookshelf and repaired wooden door',
    location: {
      latitude: 24.8607,
      longitude: 67.0011,
      address: 'Gulshan-e-Iqbal, Karachi'
    },
    payment: {
      amount: 4500,
      status: 'completed'
    },
    employerName: 'Muhammad Hassan',
    createdAt: new Date('2024-01-22T11:00:00Z'),
    updatedAt: new Date('2024-01-25T11:00:00Z')
  }
];

const testRatings = [
  {
    rating: 5,
    review: 'Excellent work! The plumber was very professional and fixed the leak quickly. Highly recommended.',
    createdAt: new Date('2024-01-15T13:00:00Z')
  },
  {
    rating: 4,
    review: 'Good electrical work, completed on time. The fan installation was perfect.',
    createdAt: new Date('2024-01-20T17:00:00Z')
  },
  {
    rating: 5,
    review: 'Outstanding carpentry skills! The bookshelf looks amazing and the door repair was flawless. Will definitely hire again.',
    createdAt: new Date('2024-01-25T12:00:00Z')
  }
];

async function addTestData() {
  try {
    console.log('🚀 Starting to add test data for completed tasks and ratings...');
    console.log(`📧 Authenticating as: ${TEST_EMAIL}`);

    // Sign in as test user
    const userCredential = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    const user = userCredential.user;
    console.log(`✅ Authenticated as: ${user.email} (${user.uid})`);

    // Get worker data
    const workerDoc = await getDoc(doc(db, 'users', user.uid));
    const workerData = workerDoc.data();
    console.log(`✅ Found worker: ${workerData.profile.fullName}`);

    // Get a test employer ID
    const usersRef = collection(db, 'users');
    const employerQuery = query(usersRef, where('role', '==', 'employer'));
    const employerSnapshot = await getDocs(employerQuery);
    
    if (employerSnapshot.empty) {
      console.error('❌ No employer found');
      return;
    }

    const employerDoc = employerSnapshot.docs[0];
    const employerId = employerDoc.id;
    const employerData = employerDoc.data();
    
    console.log(`✅ Found employer: ${employerData.profile.fullName} (${employerData.email})`);

    // Create bookings
    const bookingsRef = collection(db, 'bookings');
    const createdBookings = [];

    for (let i = 0; i < testBookings.length; i++) {
      const bookingData = {
        ...testBookings[i],
        workerId: user.uid,
        employerId: employerId,
        createdAt: testBookings[i].createdAt.toISOString(),
        updatedAt: testBookings[i].updatedAt.toISOString(),
        date: testBookings[i].date.toISOString()
      };

      const bookingRef = await addDoc(bookingsRef, bookingData);
      createdBookings.push(bookingRef.id);
      
      console.log(`✅ Created booking ${i + 1}: ${bookingData.task} (ID: ${bookingRef.id})`);
    }

    // Create ratings
    const ratingsRef = collection(db, 'ratings');
    
    for (let i = 0; i < testRatings.length; i++) {
      const ratingData = {
        ...testRatings[i],
        bookingId: createdBookings[i],
        workerId: user.uid,
        employerId: employerId,
        createdAt: testRatings[i].createdAt.toISOString()
      };

      await addDoc(ratingsRef, ratingData);
      console.log(`✅ Created rating ${i + 1}: ${ratingData.rating} stars for ${testBookings[i].task}`);
    }

    // Update worker's average rating
    const averageRating = testRatings.reduce((sum, rating) => sum + rating.rating, 0) / testRatings.length;
    const workerRef = doc(db, 'users', user.uid);
    
    await updateDoc(workerRef, {
      'profile.rating': averageRating,
      updatedAt: new Date().toISOString()
    });

    console.log(`📊 Updated worker's average rating to: ${averageRating.toFixed(1)}`);

    console.log('\n🎉 Test data added successfully!');
    console.log(`📋 Created ${testBookings.length} completed bookings`);
    console.log(`⭐ Created ${testRatings.length} ratings`);
    console.log(`👤 Worker: ${workerData.profile.fullName}`);
    console.log(`🏢 Employer: ${employerData.profile.fullName}`);
    
    console.log('\n📱 You can now test the rating system:');
    console.log('1. Login as test2@test.com (worker) to see completed jobs with ratings');
    console.log('2. Login as employer to see the rating modal for completed jobs');
    console.log('3. Check the worker profile to see overall rating and reviews');

  } catch (error) {
    console.error('❌ Error adding test data:', error);
  }
}

// Run the script
addTestData().then(() => {
  console.log('\n✨ Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});

