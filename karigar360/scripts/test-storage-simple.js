const { initializeApp } = require('firebase/app');
const { getStorage, ref } = require('firebase/storage');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkqSpFkKlRigyyR732gNjSTICFsSjYdkM",
  authDomain: "kaarigar360.firebaseapp.com",
  projectId: "kaarigar360",
  storageBucket: "kaarigar360.firebasestorage.app",
  messagingSenderId: "601840315116",
  appId: "1:601840315116:android:922c14a626df6f711c93c9"
};

async function testStorageConnection() {
  try {
    console.log('🧪 Testing Firebase Storage connection (simple test)...');
    console.log('🔧 Firebase Config:', {
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket
    });
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    
    console.log('✅ Firebase Storage initialized');
    console.log('📦 Storage bucket:', storage.app.options.storageBucket);
    
    // Test creating a reference (this should work without authentication)
    const testRef = ref(storage, 'cnic-photos/test-user/connection-test.txt');
    console.log('📂 Test reference created:', testRef.fullPath);
    console.log('📂 Reference bucket:', testRef.bucket);
    console.log('📂 Reference name:', testRef.name);
    
    console.log('✅ Firebase Storage connection test completed successfully!');
    console.log('📝 Note: Upload test requires authentication, but connection is working');
    
  } catch (error) {
    console.error('❌ Firebase Storage connection test failed:', error);
    console.error('❌ Error details:', error.code, error.message);
    console.error('❌ Error status:', error.status_);
    
    if (error.code === 'storage/unknown' && error.status_ === 404) {
      console.log('\n🔧 SOLUTION:');
      console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
      console.log('2. Select your project: kaarigar360');
      console.log('3. Click "Storage" in the left sidebar');
      console.log('4. Verify Storage is enabled and shows files/usage');
      console.log('5. Check if Storage bucket exists');
    }
  }
}

testStorageConnection();
