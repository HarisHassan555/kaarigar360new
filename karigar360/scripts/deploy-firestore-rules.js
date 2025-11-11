// Script to deploy Firestore security rules
const { execSync } = require('child_process');

console.log('🚀 Deploying Firestore security rules...\n');

try {
  // Check if Firebase CLI is installed
  try {
    execSync('firebase --version', { stdio: 'pipe' });
  } catch (error) {
    console.log('📦 Installing Firebase CLI...\n');
    execSync('npm install -g firebase-tools', { stdio: 'inherit' });
  }

  // Login to Firebase (if not already logged in)
  try {
    execSync('firebase projects:list', { stdio: 'pipe' });
    console.log('✅ Firebase CLI is authenticated\n');
  } catch (error) {
    console.log('🔐 Please authenticate with Firebase CLI:');
    console.log('Run: firebase login\n');
    process.exit(1);
  }

  // Deploy Firestore rules
  console.log('📝 Deploying Firestore security rules...\n');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });

  console.log('\n✅ Firestore security rules deployed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. The app should now work without permission errors');
  console.log('2. Start the app: npm start');

} catch (error) {
  console.error('\n❌ Error deploying Firestore rules:', error.message);
  console.log('\n💡 Alternative: Deploy rules manually in Firebase Console');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com');
  console.log('2. Select your project (kaarigar360)');
  console.log('3. Go to Firestore Database > Rules');
  console.log('4. Copy and paste the contents of firestore.rules');
  console.log('5. Click Publish\n');

  console.log('\n🔧 Temporary workaround:');
  console.log('You can temporarily allow all operations by setting rules to:');
  console.log('rules_version = \'2\';');
  console.log('service cloud.firestore {');
  console.log('  match /databases/{database}/documents {');
  console.log('    match /{document=**} {');
  console.log('      allow read, write: if true;');
  console.log('    }');
  console.log('  }');
  console.log('}');
}
