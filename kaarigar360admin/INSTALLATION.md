# Kaarigar360 Admin Portal - Installation Guide

## 🔧 **Fixed Firebase Import Issues**

### ✅ **Updated Firebase Version**
- Changed from Firebase v10+ to v9.23.0 for compatibility
- Fixed `User` type import issues
- Resolved module export errors

## 🚀 **Installation Steps**

### **Step 1: Install Dependencies**
```bash
npm install
```

### **Step 2: Create Admin User**
```bash
npm run create-admin
```

### **Step 3: Deploy Firestore Rules**
```bash
firebase deploy --only firestore:rules
```

### **Step 4: Start Development Server**
```bash
npm run dev
```

## 🔐 **Firebase Configuration**

### **Admin User**
- **Email**: `admin@kaarigar360.com`
- **Password**: `admin123456`
- **Auto-authentication**: Portal signs in automatically

### **Firestore Rules**
The rules allow admin access to all collections:
```javascript
// Admin can read/write all collections
match /{document=**} {
  allow read, write: if isAdmin();
}
```

## 📊 **What You'll See**

### **Real Data from Firebase**
- ✅ **Pending users** with `status: 'pending'`
- ✅ **Actual user profiles** with CNIC photos
- ✅ **Real statistics** calculated from your data
- ✅ **Live booking and dispute data**

### **No Hardcoded Data**
- ❌ No mock data fallbacks
- ✅ Real Firebase queries only
- ✅ Proper error handling

## 🛠️ **Troubleshooting**

### **Firebase Import Errors**
If you see import errors:
1. **Clear node_modules**: `rm -rf node_modules`
2. **Reinstall**: `npm install`
3. **Restart dev server**: `npm run dev`

### **Permission Errors**
1. **Create admin user**: `npm run create-admin`
2. **Deploy rules**: `firebase deploy --only firestore:rules`
3. **Check Firebase console** for user creation

### **No Data Showing**
1. **Check main app**: Ensure users are created with `status: 'pending'`
2. **Check Firestore**: Verify users collection exists
3. **Check authentication**: Ensure admin user is signed in

## 🎯 **Expected Behavior**

The admin portal will:
- ✅ **Automatically sign in** as admin
- ✅ **Fetch real users** with pending status
- ✅ **Display actual user profiles** with CNIC photos
- ✅ **Calculate real statistics** from your database
- ✅ **Show live data** from Firebase

## 📋 **Data Requirements**

Your main Kaarigar360 app should create users with:
```typescript
{
  status: "pending", // This is what the admin portal looks for
  role: "worker" | "employer",
  profile: {
    cnicPhotos: { front: "...", back: "..." },
    skills: ["Carpenter", "Electrician"],
    // ... other profile data
  }
}
```

The admin portal is now ready to work with real Firebase data! 🚀
