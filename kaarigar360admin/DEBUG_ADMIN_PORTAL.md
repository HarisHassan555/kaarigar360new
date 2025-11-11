# Admin Portal Debug Guide

## 🎯 **Problem**
- Firebase entry is created correctly in mobile app
- Admin portal is not showing pending users
- Need to see all status: 'pending' accounts in admin portal

## 🔍 **Debugging Steps**

### **1. Check Admin Portal Console**
Open the admin portal and check the browser console for these logs:

```
🚀 Initializing admin dashboard...
🔐 Initializing admin authentication...
✅ Admin signed in successfully: admin@kaarigar360.com
🔄 Loading dashboard data...
🧪 Testing Firebase connection...
✅ Firebase connection successful!
📊 Found X documents in users collection
🔍 Fetching pending users...
📊 Total users in database: X
👤 User 1: { id: '...', email: '...', status: 'pending', role: '...' }
📊 Found X pending users
👥 Pending users: X
```

### **2. Check Firebase Console**
1. Go to Firebase Console → Firestore Database
2. Check if user documents exist in `users` collection
3. Verify users have `status: 'pending'`
4. Check if admin user exists with role: 'admin'

### **3. Check Firestore Rules**
Make sure these rules are deployed:
```javascript
// Allow admin access to all collections
match /{document=**} {
  allow read, write: if isAdmin();
}

// Users collection
match /users/{userId} {
  allow read: if isAuthenticated();
  allow write: if isOwner(userId) || isAdmin();
  allow create: if isAuthenticated();
}
```

## 🛠️ **Potential Issues & Fixes**

### **Issue 1: Admin Authentication Failed**
**Symptoms**: No admin authentication logs
**Fix**: 
1. Check if admin user exists in Firebase Auth
2. Verify admin credentials in `adminAuth.ts`
3. Check if admin user has role: 'admin' in Firestore

### **Issue 2: Firebase Connection Failed**
**Symptoms**: Firebase connection test fails
**Fix**:
1. Check Firebase config in `firebase.ts`
2. Verify project ID matches mobile app
3. Check if Firestore rules are deployed

### **Issue 3: No Users Found**
**Symptoms**: "Total users in database: 0"
**Fix**:
1. Check if users are being created in correct project
2. Verify Firebase project ID matches
3. Check if users collection exists

### **Issue 4: Users Found But Not Pending**
**Symptoms**: "Total users in database: X" but "Found 0 pending users"
**Fix**:
1. Check if users have `status: 'pending'` field
2. Verify status field is set correctly during registration
3. Check if status field is string type (not boolean)

## 🔧 **Quick Fixes**

### **Fix 1: Deploy Firestore Rules**
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules
```

### **Fix 2: Create Admin User**
```bash
# Run admin creation script
npm run create-admin
```

### **Fix 3: Check Firebase Project**
1. Verify both apps use same Firebase project
2. Check Firebase config matches in both apps
3. Ensure Firestore rules are deployed

## 🧪 **Test Commands**

### **Test Firebase Connection**
```javascript
// In browser console (admin portal)
import { collection, getDocs } from 'firebase/firestore';
const usersRef = collection(db, 'users');
const snapshot = await getDocs(usersRef);
console.log('All users:', snapshot.docs.map(doc => ({
  id: doc.id,
  email: doc.data().email,
  status: doc.data().status
})));
```

### **Test Admin Authentication**
```javascript
// In browser console (admin portal)
console.log('Current user:', auth.currentUser);
console.log('User email:', auth.currentUser?.email);
```

### **Test Pending Users Query**
```javascript
// In browser console (admin portal)
import { query, where } from 'firebase/firestore';
const q = query(usersRef, where('status', '==', 'pending'));
const pendingSnapshot = await getDocs(q);
console.log('Pending users:', pendingSnapshot.docs.map(doc => doc.data()));
```

## 📊 **Expected Results**

### **Console Logs Should Show**:
```
🚀 Initializing admin dashboard...
🔐 Initializing admin authentication...
✅ Admin signed in successfully: admin@kaarigar360.com
🔄 Loading dashboard data...
🧪 Testing Firebase connection...
✅ Firebase connection successful!
📊 Found X documents in users collection
🔍 Fetching pending users...
📊 Total users in database: X
👤 User 1: { id: 'user1', email: 'user@example.com', status: 'pending', role: 'worker' }
📊 Found 1 pending users
👤 Pending User: user@example.com Status: pending
✅ Returning 1 pending users
📊 Dashboard data loaded:
👥 Pending users: 1
```

### **Admin Portal Should Show**:
- Pending users in "Pending Approvals" tab
- User details with CNIC photos
- Approve/Reject buttons
- User information (name, email, role, status)

## 🚨 **Common Issues**

1. **Firebase Project Mismatch**: Admin portal and mobile app using different Firebase projects
2. **Firestore Rules Not Deployed**: Rules not allowing admin access
3. **Admin User Not Created**: No admin user in Firebase Auth
4. **Status Field Missing**: Users created without status field
5. **Authentication Issues**: Admin not properly authenticated

## 🎯 **Next Steps**

1. **Check console logs** for specific error messages
2. **Verify Firebase connection** is working
3. **Check if admin user exists** and is authenticated
4. **Verify users are being created** with correct status
5. **Test with fresh user registration**

## 📞 **If Still Not Working**

1. **Clear browser cache** and restart admin portal
2. **Check Firebase Console** for user documents
3. **Verify Firestore rules** are deployed
4. **Test with a new user registration**
5. **Check if both apps use same Firebase project**
