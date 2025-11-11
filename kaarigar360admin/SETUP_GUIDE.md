# Kaarigar360 Admin Portal - Setup Guide

## 🎯 **No Hardcoded Data - Real Firebase Integration**

The admin portal now fetches **real data** from Firebase and shows only users with `status: 'pending'` for approval.

## 🚀 **Quick Setup (3 Steps)**

### **Step 1: Create Admin User**
```bash
# Run this command to create the admin user in Firebase
npm run create-admin
```

### **Step 2: Deploy Firestore Rules**
```bash
# Deploy the admin-specific Firestore rules
firebase deploy --only firestore:rules
```

### **Step 3: Start the Portal**
```bash
npm run dev
```

## 🔧 **What's Fixed**

### ✅ **Removed All Hardcoded Data**
- ❌ No more mock data fallbacks
- ✅ Real Firebase data only
- ✅ Proper error handling for permission issues

### ✅ **Real User Data**
- ✅ Fetches actual users from Firebase
- ✅ Shows only users with `status: 'pending'`
- ✅ Real user profiles, CNIC photos, skills
- ✅ Actual booking and dispute data

### ✅ **Admin Authentication**
- ✅ Automatic admin sign-in on portal load
- ✅ Proper Firebase authentication
- ✅ Admin-specific Firestore rules

## 📊 **What You'll See**

### **Pending Approvals Tab**
- **Real users** with `status: 'pending'`
- **Actual CNIC photos** uploaded by users
- **Real user profiles** with skills and ratings
- **Actual registration dates** and contact info

### **All Users Tab**
- **Complete user list** from Firebase
- **Real user statuses** (pending, approved, rejected)
- **Actual user roles** (worker, employer)
- **Real registration dates**

### **Dashboard Stats**
- **Real statistics** calculated from Firebase data
- **Actual user counts** and revenue
- **Real booking numbers** and completion rates
- **Live dispute counts**

## 🔐 **Firebase Configuration**

### **Admin User Credentials**
- **Email**: `admin@kaarigar360.com`
- **Password**: `admin123456`
- **Auto-sign-in**: Portal automatically signs in as admin

### **Firestore Rules**
The rules now allow:
- ✅ Admin read/write access to all collections
- ✅ User data access for authenticated users
- ✅ Proper permission handling

## 🎯 **Expected Behavior**

### **If Firebase is Connected:**
- ✅ Shows real users with pending status
- ✅ Displays actual user profiles and CNIC photos
- ✅ Real statistics and analytics
- ✅ Live data updates

### **If Firebase Permission Issues:**
- ❌ Clear error messages (no mock data)
- ❌ Proper error handling
- ❌ User-friendly error display

## 🛠️ **Troubleshooting**

### **"Missing or insufficient permissions" Error**
1. **Create admin user**: `npm run create-admin`
2. **Deploy Firestore rules**: `firebase deploy --only firestore:rules`
3. **Check Firebase console** for user creation

### **"Admin user does not exist" Error**
1. Run: `npm run create-admin`
2. Check Firebase Authentication console
3. Verify admin user exists

### **No Users Showing**
1. **Check main app**: Ensure users are being created with `status: 'pending'`
2. **Check Firestore**: Verify users collection exists
3. **Check rules**: Ensure admin rules are deployed

## 📋 **Data Requirements**

For the admin portal to work, your main Kaarigar360 app should create users with:

```typescript
// User document structure in Firestore
{
  uid: "user-id",
  role: "worker" | "employer",
  status: "pending" | "approved" | "rejected",
  phoneNumber: "+92-300-1234567",
  email: "user@example.com",
  profile: {
    firstName: "Ahmad",
    lastName: "Khan",
    fullName: "Ahmad Khan",
    address: "DHA Phase 5, Karachi",
    cnic: "42101-1234567-8",
    cnicVerified: false,
    cnicPhotos: {
      front: "https://...",
      back: "https://..."
    },
    skills: ["Carpenter", "Electrician"],
    rating: 4.5
  },
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

## 🎉 **Ready to Use**

The admin portal now:
- ✅ **Fetches real data** from your Firebase database
- ✅ **Shows pending users** for approval
- ✅ **Displays actual user profiles** with CNIC photos
- ✅ **Calculates real statistics** from your data
- ✅ **No hardcoded data** - everything is live from Firebase

Start the portal and you'll see your actual users waiting for approval! 🚀
