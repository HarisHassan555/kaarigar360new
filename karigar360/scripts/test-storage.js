const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkqSpFkKlRigyyR732gNjSTICFsSjYdkM",
  authDomain: "kaarigar360.firebaseapp.com",
  projectId: "kaarigar360",
  storageBucket: "kaarigar360.firebasestorage.app",
  messagingSenderId: "601840315116",
  appId: "1:601840315116:android:922c14a626df6f711c93c9"
};

async function testStorage() {
  try {
    console.log('🧪 Testing Firebase Storage connection...');
    console.log('🔧 Firebase Config:', {
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket
    });
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    
    console.log('✅ Firebase Storage initialized');
    console.log('📦 Storage bucket:', storage.app.options.storageBucket);
    
    // Test creating a reference (using a path that matches your rules)
    const testRef = ref(storage, 'cnic-photos/test-user/connection-test.txt');
    console.log('📂 Test reference created:', testRef.fullPath);
    
    // Test uploading a simple text blob
    const testBlob = new Blob(['Hello Firebase Storage!'], { type: 'text/plain' });
    console.log('📝 Test blob created, size:', testBlob.size);
    
    console.log('⬆️ Uploading test file...');
    const uploadResult = await uploadBytes(testRef, testBlob);
    console.log('✅ Upload successful:', uploadResult.metadata.name);
    
    // Get download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log('🔗 Download URL:', downloadURL);
    
    console.log('✅ Firebase Storage test completed successfully!');
    
  } catch (error) {
    console.error('❌ Firebase Storage test failed:', error);
    console.error('❌ Error details:', error.code, error.message);
    console.error('❌ Error status:', error.status_);
    console.error('❌ Server response:', error.customData?.serverResponse);
    
    if (error.code === 'storage/unknown' && error.status_ === 404) {
      console.log('\n🔧 SOLUTION:');
      console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
      console.log('2. Select your project: kaarigar360');
      console.log('3. Click "Storage" in the left sidebar');
      console.log('4. Click "Get started" to enable Firebase Storage');
      console.log('5. Choose "Start in test mode" and select a location');
      console.log('6. Run this test again after enabling Storage');
    }
  }
}

testStorage();
