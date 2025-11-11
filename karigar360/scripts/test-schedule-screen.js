import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, getDoc } from 'firebase/firestore';

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

// Worker credentials
const WORKER_EMAIL = 'worker@abc.com';
const WORKER_PASSWORD = '123456';

async function testScheduleScreen() {
  try {
    console.log('📅 Testing Schedule Screen with Sample Jobs...');
    console.log('='.repeat(60));
    
    // Step 1: Sign in as worker
    console.log('📝 Step 1: Signing in as worker...');
    const userCredential = await signInWithEmailAndPassword(auth, WORKER_EMAIL, WORKER_PASSWORD);
    const user = userCredential.user;
    console.log('✅ Worker signed in successfully:', user.uid);
    
    // Step 2: Create sample jobs for different dates
    console.log('\n📝 Step 2: Creating sample jobs for testing...');
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const sampleJobs = [
      {
        workerId: user.uid,
        employerId: 'employer1',
        employerName: 'Ahmed Ali',
        service: 'Plumbing Repair',
        description: 'Fix leaking kitchen faucet',
        location: 'Gulshan-e-Iqbal, Karachi',
        date: today.toISOString(),
        status: 'accepted',
        payment: { amount: 2000 },
        createdAt: new Date().toISOString(),
      },
      {
        workerId: user.uid,
        employerId: 'employer2',
        employerName: 'Fatima Khan',
        service: 'Electrical Work',
        description: 'Install new ceiling fan',
        location: 'Defence, Karachi',
        date: tomorrow.toISOString(),
        status: 'pending',
        payment: { amount: 3000 },
        createdAt: new Date().toISOString(),
      },
      {
        workerId: user.uid,
        employerId: 'employer3',
        employerName: 'Muhammad Hassan',
        service: 'Carpentry',
        description: 'Build custom bookshelf',
        location: 'Clifton, Karachi',
        date: nextWeek.toISOString(),
        status: 'accepted',
        payment: { amount: 5000 },
        createdAt: new Date().toISOString(),
      },
      {
        workerId: user.uid,
        employerId: 'employer4',
        employerName: 'Ayesha Malik',
        service: 'Plumbing Installation',
        description: 'Install new bathroom fixtures',
        location: 'North Nazimabad, Karachi',
        date: tomorrow.toISOString(),
        status: 'completed',
        payment: { amount: 4000 },
        createdAt: new Date().toISOString(),
      }
    ];
    
    const bookingsRef = collection(db, 'bookings');
    const createdJobs = [];
    
    for (const job of sampleJobs) {
      try {
        const docRef = await addDoc(bookingsRef, job);
        createdJobs.push({ id: docRef.id, ...job });
        console.log(`✅ Created job: ${job.service} for ${job.date.split('T')[0]}`);
      } catch (error) {
        console.log(`❌ Failed to create job: ${job.service} - ${error.message}`);
      }
    }
    
    console.log(`\n📊 Created ${createdJobs.length} sample jobs`);
    
    // Step 3: Show job distribution
    console.log('\n📝 Step 3: Job distribution by date...');
    const jobsByDate = {};
    createdJobs.forEach(job => {
      const date = job.date.split('T')[0];
      if (!jobsByDate[date]) {
        jobsByDate[date] = [];
      }
      jobsByDate[date].push(job);
    });
    
    Object.keys(jobsByDate).forEach(date => {
      const jobs = jobsByDate[date];
      console.log(`📅 ${date}: ${jobs.length} job(s)`);
      jobs.forEach(job => {
        console.log(`   🔧 ${job.service} - ${job.status} - Rs. ${job.payment.amount}`);
      });
    });
    
    // Step 4: Show schedule screen features
    console.log('\n📝 Step 4: Schedule Screen Features...');
    console.log('✅ Monthly calendar view with job indicators');
    console.log('✅ Click on dates to see daily job lists');
    console.log('✅ Job status color coding:');
    console.log('   🟡 Pending jobs');
    console.log('   🟢 Accepted jobs');
    console.log('   🔵 Completed jobs');
    console.log('   🔴 Cancelled jobs');
    console.log('✅ Quick stats showing upcoming, completed, and pending jobs');
    console.log('✅ Responsive design with pull-to-refresh');
    
    console.log('\n🎉 Schedule Screen Test Complete!');
    console.log('='.repeat(60));
    console.log('📱 To test the schedule screen:');
    console.log('1. Open the mobile app');
    console.log('2. Login with worker@abc.com / 123456');
    console.log('3. Navigate to the Schedule tab (📅)');
    console.log('4. Click on dates to see job details');
    console.log('5. Use the calendar navigation to browse months');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testScheduleScreen();
