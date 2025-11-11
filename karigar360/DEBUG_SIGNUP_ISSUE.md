# Debug Signup Loader Issue

## 🔍 **Problem**
- User gets stuck on loader after signup
- Admin portal shows no pending requests
- User cannot access the app

## 🛠️ **Debugging Steps**

### **1. Check Mobile App Console**
Open the mobile app and check the console for these logs:
```
👤 Creating user document: user@example.com Status: pending
✅ User document created successfully
```

### **2. Check Admin Portal Console**
Open the admin portal and check the console for these logs:
```
🔍 Fetching pending users...
🔗 Firebase connection: [DEFAULT]
📊 Total users in database: X
📊 Found X pending users
👤 User: user@example.com Status: pending
```

### **3. Check Firebase Console**
1. Go to Firebase Console → Firestore Database
2. Check if user document exists in `users` collection
3. Verify the user has `status: 'pending'`

### **4. Check Authentication Flow**
The issue might be in the authentication flow. Here's what should happen:

#### **Expected Flow:**
1. User registers → Status: 'pending'
2. User tries to login → Blocked with pending message
3. User sees StatusCheck screen
4. Admin sees user in portal

#### **Current Issue:**
- User gets stuck on loader (likely in auth initialization)
- Admin portal doesn't show users (likely Firebase connection issue)

## 🔧 **Potential Fixes**

### **Fix 1: Authentication Loop Issue**
The `initializeAuth` function was causing a loop by signing out pending users. This has been fixed.

### **Fix 2: Firebase Connection Issue**
Check if admin portal can connect to Firebase:
- Verify Firebase config is correct
- Check if Firestore rules allow admin access
- Verify admin authentication is working

### **Fix 3: Status Check Screen Issue**
Make sure the StatusCheck screen is properly imported and rendered.

## 🚀 **Testing Steps**

### **1. Test User Registration**
1. Register a new user
2. Check console for user creation logs
3. Verify user document in Firestore
4. Check if user can see StatusCheck screen

### **2. Test Admin Portal**
1. Open admin portal
2. Check console for Firebase connection logs
3. Verify pending users are fetched
4. Check if users appear in UI

### **3. Test Complete Flow**
1. Register user → Should see StatusCheck screen
2. Admin approves user → User should be able to login
3. User login → Should access main app

## 📱 **Quick Fixes**

### **If User Stuck on Loader:**
1. Check if StatusCheck screen is imported in App.tsx
2. Verify user status is being set correctly
3. Check authentication state management

### **If Admin Portal Shows No Users:**
1. Check Firebase connection
2. Verify Firestore rules
3. Check admin authentication
4. Check if users are actually being created

## 🔍 **Debug Commands**

### **Check User Status:**
```javascript
// In browser console (admin portal)
console.log('Current user:', auth.currentUser);
console.log('Firebase app:', db.app.name);
```

### **Check Firestore Data:**
```javascript
// In browser console
import { collection, getDocs } from 'firebase/firestore';
const usersRef = collection(db, 'users');
const snapshot = await getDocs(usersRef);
console.log('All users:', snapshot.docs.map(doc => doc.data()));
```

## 🎯 **Expected Results**

### **After Registration:**
- User should see StatusCheck screen (not stuck on loader)
- User document should exist in Firestore with status: 'pending'
- Admin portal should show the user in pending list

### **After Admin Approval:**
- User status should change to 'approved'
- User should be able to login and access main app
- Admin portal should show user as approved

## 🚨 **Common Issues**

1. **Firebase Config Mismatch**: Admin portal and main app using different Firebase projects
2. **Firestore Rules**: Rules not allowing admin access
3. **Authentication Loop**: User being signed out immediately after registration
4. **Import Issues**: StatusCheck screen not properly imported
5. **State Management**: Redux state not updating correctly

## 📞 **Next Steps**

1. Check console logs for specific error messages
2. Verify Firebase connection in both apps
3. Test with a fresh user registration
4. Check Firestore rules and permissions
5. Verify all imports and components are correct
