// Test script to verify Firebase initialization
const { initializeFirebase } = require('./firebaseInit');

async function testFirebaseInit() {
  console.log('🧪 Testing Firebase initialization...\n');
  
  try {
    const { app, auth, db, storage } = initializeFirebase();
    
    console.log('✅ Firebase App initialized:', !!app);
    console.log('✅ Firebase Auth initialized:', !!auth);
    console.log('✅ Firestore initialized:', !!db);
    console.log('✅ Firebase Storage initialized:', !!storage);
    
    console.log('\n🎉 Firebase initialization test passed!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run setup-firebase-users');
    console.log('2. Run: npm run test-firebase-auth');
    console.log('3. Start the app: npm start');
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check Firebase configuration');
    console.log('2. Ensure Firebase project is set up');
    console.log('3. Verify internet connection');
  }
}

// Run the test
testFirebaseInit().catch(console.error);
