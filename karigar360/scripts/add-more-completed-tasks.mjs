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

// Additional test data for completed tasks and ratings
const additionalBookings = [
  {
    status: 'completed',
    date: new Date('2024-02-01T09:00:00Z'),
    task: 'Air Conditioning Repair',
    service: 'Air Conditioning Repair',
    description: 'Fixed AC unit not cooling properly, replaced filters and recharged refrigerant',
    location: {
      latitude: 24.8607,
      longitude: 67.0011,
      address: 'Clifton Block 2, Karachi'
    },
    payment: {
      amount: 4000,
      status: 'completed'
    },
    employerName: 'Fatima Sheikh',
    createdAt: new Date('2024-01-28T14:00:00Z'),
    updatedAt: new Date('2024-02-01T11:00:00Z')
  },
  {
    status: 'completed',
    date: new Date('2024-02-05T13:00:00Z'),
    task: 'Kitchen Renovation',
    service: 'Kitchen Renovation',
    description: 'Installed new cabinets, countertops, and plumbing fixtures',
    location: {
      latitude: 24.8607,
      longitude: 67.0011,
      address: 'Gulberg, Lahore'
    },
    payment: {
      amount: 15000,
      status: 'completed'
    },
    employerName: 'Hassan Raza',
    createdAt: new Date('2024-02-01T10:00:00Z'),
    updatedAt: new Date('2024-02-05T15:00:00Z')
  },
  {
    status: 'completed',
    date: new Date('2024-02-10T08:00:00Z'),
    task: 'Bathroom Tiling',
    service: 'Bathroom Tiling',
    description: 'Complete bathroom renovation with new tiles, fixtures, and waterproofing',
    location: {
      latitude: 24.8607,
      longitude: 67.0011,
      address: 'Defence Phase 5, Karachi'
    },
    payment: {
      amount: 8000,
      status: 'completed'
    },
    employerName: 'Ayesha Malik',
    createdAt: new Date('2024-02-07T16:00:00Z'),
    updatedAt: new Date('2024-02-10T10:00:00Z')
  },
  {
    status: 'completed',
    date: new Date('2024-02-15T11:00:00Z'),
    task: 'Generator Installation',
    service: 'Generator Installation',
    description: 'Installed backup generator with automatic transfer switch and fuel system',
    location: {
      latitude: 24.8607,
      longitude: 67.0011,
      address: 'North Nazimabad, Karachi'
    },
    payment: {
      amount: 25000,
      status: 'completed'
    },
    employerName: 'Omar Khan',
    createdAt: new Date('2024-02-12T09:00:00Z'),
    updatedAt: new Date('2024-02-15T13:00:00Z')
  },
  {
    status: 'completed',
    date: new Date('2024-02-20T14:00:00Z'),
    task: 'Garden Landscaping',
    service: 'Garden Landscaping',
    description: 'Designed and implemented garden layout with plants, irrigation, and lighting',
    location: {
      latitude: 24.8607,
      longitude: 67.0011,
      address: 'DHA Phase 8, Karachi'
    },
    payment: {
      amount: 12000,
      status: 'completed'
    },
    employerName: 'Zara Ahmed',
    createdAt: new Date('2024-02-17T11:00:00Z'),
    updatedAt: new Date('2024-02-20T16:00:00Z')
  },
  {
    status: 'completed',
    date: new Date('2024-02-25T10:00:00Z'),
    task: 'Security System Installation',
    service: 'Security System Installation',
    description: 'Installed CCTV cameras, alarm system, and access control',
    location: {
      latitude: 24.8607,
      longitude: 67.0011,
      address: 'F-8, Islamabad'
    },
    payment: {
      amount: 18000,
      status: 'completed'
    },
    employerName: 'Bilal Shah',
    createdAt: new Date('2024-02-22T08:00:00Z'),
    updatedAt: new Date('2024-02-25T12:00:00Z')
  }
];

const additionalRatings = [
  {
    rating: 4,
    review: 'Good work on the AC repair. The technician was knowledgeable and completed the job efficiently.',
    createdAt: new Date('2024-02-01T12:00:00Z')
  },
  {
    rating: 5,
    review: 'Exceptional kitchen renovation! The quality of work is outstanding and the design exceeded my expectations. Highly recommended!',
    createdAt: new Date('2024-02-05T16:00:00Z')
  },
  {
    rating: 5,
    review: 'Perfect bathroom tiling work. Attention to detail was excellent and the waterproofing was done professionally.',
    createdAt: new Date('2024-02-10T11:00:00Z')
  },
  {
    rating: 4,
    review: 'Generator installation was done well. The system works perfectly and the technician was very professional.',
    createdAt: new Date('2024-02-15T14:00:00Z')
  },
  {
    rating: 5,
    review: 'Amazing garden transformation! The landscaping design is beautiful and the irrigation system works perfectly. Very satisfied!',
    createdAt: new Date('2024-02-20T17:00:00Z')
  },
  {
    rating: 4,
    review: 'Good security system installation. The cameras are working well and the setup was completed on time.',
    createdAt: new Date('2024-02-25T13:00:00Z')
  }
];

async function addMoreCompletedTasks() {
  try {
    console.log('🚀 Adding more completed tasks and ratings...');
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

    // Create additional bookings
    const bookingsRef = collection(db, 'bookings');
    const createdBookings = [];

    for (let i = 0; i < additionalBookings.length; i++) {
      const bookingData = {
        ...additionalBookings[i],
        workerId: user.uid,
        employerId: employerId,
        createdAt: additionalBookings[i].createdAt.toISOString(),
        updatedAt: additionalBookings[i].updatedAt.toISOString(),
        date: additionalBookings[i].date.toISOString()
      };

      const bookingRef = await addDoc(bookingsRef, bookingData);
      createdBookings.push(bookingRef.id);
      
      console.log(`✅ Created booking ${i + 1}: ${bookingData.task} (ID: ${bookingRef.id})`);
    }

    // Create additional ratings
    const ratingsRef = collection(db, 'ratings');
    
    for (let i = 0; i < additionalRatings.length; i++) {
      const ratingData = {
        ...additionalRatings[i],
        bookingId: createdBookings[i],
        workerId: user.uid,
        employerId: employerId,
        createdAt: additionalRatings[i].createdAt.toISOString()
      };

      await addDoc(ratingsRef, ratingData);
      console.log(`✅ Created rating ${i + 1}: ${ratingData.rating} stars for ${additionalBookings[i].task}`);
    }

    // Get all existing ratings to calculate new average
    const allRatingsQuery = query(ratingsRef, where('workerId', '==', user.uid));
    const allRatingsSnapshot = await getDocs(allRatingsQuery);
    const allRatings = allRatingsSnapshot.docs.map(doc => doc.data().rating);
    
    const averageRating = allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length;
    const workerRef = doc(db, 'users', user.uid);
    
    await updateDoc(workerRef, {
      'profile.rating': averageRating,
      updatedAt: new Date().toISOString()
    });

    console.log(`📊 Updated worker's average rating to: ${averageRating.toFixed(1)}`);

    console.log('\n🎉 Additional completed tasks added successfully!');
    console.log(`📋 Created ${additionalBookings.length} additional completed bookings`);
    console.log(`⭐ Created ${additionalRatings.length} additional ratings`);
    console.log(`👤 Worker: ${workerData.profile.fullName}`);
    console.log(`🏢 Employer: ${employerData.profile.fullName}`);
    console.log(`📊 Total ratings: ${allRatings.length}`);
    console.log(`⭐ New average rating: ${averageRating.toFixed(1)}/5`);
    
    console.log('\n📱 You can now test with more data:');
    console.log('1. Login as test2@test.com (worker) to see more completed jobs with ratings');
    console.log('2. Check the worker profile to see updated overall rating and more reviews');
    console.log('3. Test the rating system with more variety of completed tasks');

  } catch (error) {
    console.error('❌ Error adding more completed tasks:', error);
  }
}

// Run the script
addMoreCompletedTasks().then(() => {
  console.log('\n✨ Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});

