# Kaarigar360 Admin Portal Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase
Update `src/services/firebase.ts` with your Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 3. Set up Firestore Rules
Add these rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Bookings collection
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null;
    }
    
    // Disputes collection
    match /disputes/{disputeId} {
      allow read, write: if request.auth != null;
    }
    
    // Admin actions collection
    match /adminActions/{actionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access the Portal
- Open http://localhost:5173
- Login with: `admin` / `admin123`

## Features Overview

### 🔐 Admin Authentication
- Secure login system
- Session management
- Role-based access

### 👥 User Management
- **Pending Approvals**: Review new registrations
- **User Verification**: CNIC verification workflow
- **Status Management**: Approve, reject, or suspend users
- **Detailed Profiles**: Complete user information view

### 📊 Analytics Dashboard
- **Real-time Stats**: Users, bookings, revenue
- **Growth Metrics**: Registration trends
- **Revenue Analytics**: Monthly tracking
- **Skill Analytics**: Popular worker skills

### ⚖️ Dispute Resolution
- **Dispute Management**: View and resolve disputes
- **Resolution Tracking**: Progress monitoring
- **Audit Trail**: Complete action history

## Data Structure

### Users Collection
```typescript
{
  uid: string;
  role: 'employer' | 'worker' | 'admin';
  phoneNumber: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    fullName: string;
    address: string;
    cnic?: string;
    cnicVerified: boolean;
    cnicPhotos?: {
      front: string;
      back: string;
    };
    skills?: string[];
    rating?: number;
    profilePicture?: string;
  };
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
}
```

### Bookings Collection
```typescript
{
  id: string;
  workerId: string;
  employerId: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  date: Date;
  task: string;
  description?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  payment: {
    amount: number;
    status: 'pending' | 'completed';
  };
  createdAt: Date;
}
```

### Disputes Collection
```typescript
{
  id: string;
  bookingId: string;
  reporterId: string;
  reportedUserId: string;
  type: 'payment' | 'service' | 'behavior' | 'other';
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}
```

## Admin Workflow

### 1. User Approval Process
1. Navigate to "Pending Approvals"
2. Review user details and CNIC photos
3. Click "View Details" for complete information
4. Approve, reject, or suspend with reasons

### 2. Analytics Monitoring
1. Navigate to "Analytics" tab
2. Select time range (7d, 30d, 90d, 1y)
3. Monitor platform health and growth
4. Track revenue and user metrics

### 3. Dispute Resolution
1. Navigate to "Disputes" tab
2. Review dispute details
3. Resolve with appropriate actions
4. Track resolution progress

## Security Notes

- All admin actions are logged for audit purposes
- User data is protected with proper access controls
- CNIC photos are securely stored and accessed
- Admin authentication is required for all operations

## Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Check Firebase configuration
   - Verify Firestore rules
   - Ensure project is active

2. **Authentication Issues**
   - Verify Firebase Auth is enabled
   - Check admin user permissions
   - Review security rules

3. **Data Loading Issues**
   - Check Firestore collections exist
   - Verify data structure matches types
   - Review console for errors

### Support
For technical support, check the console logs and ensure all dependencies are properly installed.
