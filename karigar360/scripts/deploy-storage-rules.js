const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Firebase Storage Rules...');

try {
  // Check if firebase CLI is installed
  try {
    execSync('firebase --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Firebase CLI not found. Please install it first:');
    console.error('npm install -g firebase-tools');
    process.exit(1);
  }

  // Check if storage.rules file exists
  const rulesPath = path.join(__dirname, '..', 'storage.rules');
  if (!fs.existsSync(rulesPath)) {
    console.error('❌ storage.rules file not found at:', rulesPath);
    process.exit(1);
  }

  console.log('📁 Storage rules file found:', rulesPath);

  // Deploy storage rules
  console.log('⬆️ Deploying storage rules...');
  execSync('firebase deploy --only storage', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  console.log('✅ Firebase Storage rules deployed successfully!');
  console.log('🔒 Storage security rules are now active');

} catch (error) {
  console.error('❌ Failed to deploy storage rules:', error.message);
  process.exit(1);
}
