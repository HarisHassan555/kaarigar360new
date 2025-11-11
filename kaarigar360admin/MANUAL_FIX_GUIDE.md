# Manual Fix Guide - Permission Error

## 🎯 **Problem**
- Admin portal shows pending users ✅
- But getting "Missing or insufficient permissions" when approving ❌
- Need to manually fix Firestore rules and admin user

## 🔧 **Step 1: Copy and Paste Firestore Rules**

### **Go to Firebase Console:**
1. Go to https://console.firebase.google.com/project/kaarigar360
2. Click on "Firestore Database"
3. Click on "Rules" tab
4. **Delete all existing rules**
5. **Copy and paste these rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
        (request.auth.token.role == 'admin' || 
         request.auth.uid in ['admin-1', 'admin-2'] ||
         request.auth.email == 'admin@kaarigar360.com');
    }

    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection - allow read for authenticated users, write for owners and admins
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated();
    }

    // Bookings collection
    match /bookings/{bookingId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
      allow create: if isAuthenticated();
    }

    // Ratings collection
    match /ratings/{ratingId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
      allow create: if isAuthenticated();
    }

    // Skills collection
    match /skills/{skillId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }

    // Disputes collection
    match /disputes/{disputeId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
      allow create: if isAuthenticated();
    }

    // Admin actions collection
    match /adminActions/{actionId} {
      allow read, write: if isAdmin();
    }

    // Allow admin access to all collections (this should allow admin to read everything)
    match /{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
```

6. **Click "Publish"**

## 🔧 **Step 2: Create Admin User in Firestore**

### **Go to Firestore Database:**
1. Click on "Firestore Database"
2. Click on "Start collection"
3. **Collection ID:** `users`
4. **Document ID:** Use the UID from Authentication (see Step 3)
5. **Add these fields:**

```json
{
  "uid": "admin-uid-from-auth",
  "email": "admin@kaarigar360.com",
  "role": "admin",
  "phoneNumber": "",
  "profile": {
    "firstName": "Admin",
    "lastName": "User",
    "fullName": "Admin User",
    "address": "Admin HQ",
    "cnicVerified": true
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "status": "approved"
}
```

## 🔧 **Step 3: Get Admin User UID**

### **Go to Authentication:**
1. Go to Firebase Console → Authentication
2. Click on "Users" tab
3. Find user: `admin@kaarigar360.com`
4. **Copy the UID** (it looks like: `abc123def456...`)
5. **Use this UID** in Step 2 above

## 🔧 **Step 4: Test Admin Portal**

### **Open Admin Portal:**
1. Go to admin portal: `http://localhost:5173`
2. Check browser console for logs
3. Look for: `✅ Admin signed in successfully: admin@kaarigar360.com`

### **Test User Approval:**
1. Click "Approve" on any pending user
2. Check console for success logs
3. Verify user status changes in Firebase Console

## 🔍 **Debugging Steps**

### **Check 1: Admin Authentication**
```javascript
// In browser console (admin portal)
console.log('Current user:', auth.currentUser);
console.log('User email:', auth.currentUser?.email);
console.log('User UID:', auth.currentUser?.uid);
```

### **Check 2: Firebase Console**
1. **Authentication:** Verify admin user exists
2. **Firestore:** Verify admin document exists with `role: 'admin'`
3. **Rules:** Verify rules are published and active

### **Check 3: Console Logs**
Look for these logs in admin portal:
```
🔐 Initializing admin authentication...
✅ Admin signed in successfully: admin@kaarigar360.com
🔐 Approving user: user-id-123
✅ User approved successfully
```

## 🚨 **If Still Not Working**

### **Option 1: More Permissive Rules**
If the above rules don't work, try these more permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all authenticated users to read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **Option 2: Check Admin User**
1. **Delete admin user** from Authentication
2. **Recreate admin user** with email: `admin@kaarigar360.com`
3. **Create admin document** in Firestore with `role: 'admin'`

### **Option 3: Clear Cache**
1. **Clear browser cache**
2. **Restart admin portal**
3. **Test again**

## 🎯 **Expected Results**

### **After Fix:**
1. ✅ **Admin portal shows** pending users
2. ✅ **Approve button works** without permission errors
3. ✅ **User status changes** to 'approved' in Firestore
4. ✅ **User can login** to mobile app after approval
5. ✅ **Console shows success** logs

### **Console Logs Should Show:**
```
🔐 Initializing admin authentication...
✅ Admin signed in successfully: admin@kaarigar360.com
🔐 Approving user: user-id-123
👤 Admin ID: admin-1
📝 Updating user document...
✅ User approved successfully
✅ Admin action logged successfully
```

## 🎉 **Success!**

After following these steps, the admin portal should work perfectly:
- ✅ **Shows pending users**
- ✅ **Approves users without errors**
- ✅ **Updates user status correctly**
- ✅ **Allows users to login after approval**

**Try approving a user now - the permission error should be completely gone!** 🚀

