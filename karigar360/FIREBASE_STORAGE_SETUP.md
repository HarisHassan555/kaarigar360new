# Firebase Storage Setup Guide

## 🚨 **Issue: Firebase Storage Not Enabled**

The error `storage/unknown` with status 404 indicates that Firebase Storage is not enabled for your project.

## 🔧 **Step-by-Step Fix:**

### **Step 1: Enable Firebase Storage in Console**

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `kaarigar360`
3. **Navigate to Storage**: In the left sidebar, click "Storage"
4. **Click "Get started"**: If you see a "Get started" button, click it
5. **Choose security rules**: Select "Start in test mode" (we'll update rules later)
6. **Select location**: Choose a location close to your users (e.g., `us-central1`)
7. **Click "Done"**: Firebase Storage will be enabled

### **Step 2: Verify Storage is Enabled**

After enabling, you should see:
- ✅ Storage dashboard with usage statistics
- ✅ Files tab showing uploaded files
- ✅ Rules tab for security configuration

### **Step 3: Deploy Storage Rules**

```bash
cd karigar360
node scripts/deploy-storage-rules.js
```

### **Step 4: Test Storage Connection**

```bash
cd karigar360
node scripts/test-storage.js
```

## 🔒 **Storage Security Rules**

The rules I created allow:
- ✅ Users to upload their own CNIC photos
- ✅ Users to read their own photos
- ✅ Admins to read all photos
- ❌ Users cannot access other users' photos

## 🧪 **Testing Steps**

### **1. Test Basic Connection**
```bash
node scripts/test-storage.js
```
**Expected Output:**
```
✅ Firebase Storage initialized
📦 Storage bucket: kaarigar360.firebasestorage.app
✅ Upload successful: connection-test.txt
🔗 Download URL: https://firebasestorage.googleapis.com/...
✅ Firebase Storage test completed successfully!
```

### **2. Test Mobile App Registration**
1. Open the mobile app
2. Register a new user with CNIC photos
3. Check console logs for upload process
4. Verify images appear in Firebase Storage console

## 🚨 **Common Issues & Solutions**

### **Issue 1: Storage Not Enabled**
**Error**: `storage/unknown` with 404 status
**Solution**: Enable Firebase Storage in Console (Step 1 above)

### **Issue 2: Permission Denied**
**Error**: `storage/unauthorized`
**Solution**: Deploy storage rules (Step 3 above)

### **Issue 3: Network Error**
**Error**: `storage/retry-limit-exceeded`
**Solution**: Check internet connection and Firebase project configuration

## 📱 **Mobile App Integration**

Once Storage is enabled, the mobile app will:
1. ✅ Upload CNIC photos to Firebase Storage
2. ✅ Store public URLs in Firestore
3. ✅ Display images in admin portal
4. ✅ Handle upload errors gracefully

## 🔍 **Verification Checklist**

- [ ] Firebase Storage enabled in Console
- [ ] Storage rules deployed successfully
- [ ] Test script runs without errors
- [ ] Mobile app can upload images
- [ ] Admin portal displays images
- [ ] No 404 or permission errors

## 📞 **If Still Having Issues**

1. **Check Firebase Console**: Ensure Storage is enabled and shows usage
2. **Verify Project ID**: Make sure `kaarigar360` is the correct project
3. **Check Authentication**: Ensure user is properly authenticated
4. **Review Console Logs**: Look for detailed error messages
5. **Test with Firebase CLI**: `firebase storage:rules:get` to verify rules

---

**Next Step**: Enable Firebase Storage in the Console, then run the test script again!
