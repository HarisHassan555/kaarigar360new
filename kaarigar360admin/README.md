# Kaarigar360 Admin Portal

A comprehensive admin approval portal for the Kaarigar360 platform, built with React, TypeScript, and Firebase.

## Features

### 🔐 Admin Authentication
- Secure login system
- Role-based access control
- Session management

### 👥 User Management
- **Pending Approvals**: Review and approve new user registrations
- **User Verification**: CNIC verification and document review
- **User Status Management**: Approve, reject, or suspend users
- **Detailed User Profiles**: View complete user information including skills, ratings, and verification status

### 📊 Analytics Dashboard
- **Real-time Statistics**: Total users, workers, employers, revenue
- **Growth Metrics**: User registration trends, booking completion rates
- **Revenue Analytics**: Monthly revenue tracking and trends
- **Skill Analytics**: Most popular worker skills
- **Booking Analytics**: Status distribution and completion rates

### ⚖️ Dispute Resolution
- **Dispute Management**: View and resolve user disputes
- **Resolution Tracking**: Track dispute resolution progress
- **Admin Actions**: Log all admin actions for audit trail

### 🎯 Key Capabilities

#### User Approval Workflow
1. **Review Registration**: View complete user profiles with CNIC photos
2. **CNIC Verification**: Verify identity documents
3. **Approval Actions**: Approve, reject, or suspend users with reasons
4. **Status Tracking**: Monitor user status changes

#### Analytics & Reporting
- **Time Range Filters**: 7 days, 30 days, 90 days, 1 year
- **Revenue Tracking**: Monthly revenue trends and totals
- **User Growth**: Registration trends and user type distribution
- **Performance Metrics**: Booking completion rates and platform health

#### Admin Actions
- **Audit Trail**: Complete log of all admin actions
- **User Management**: Comprehensive user status control
- **Dispute Resolution**: Efficient dispute handling workflow

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **UI Components**: Lucide React icons, custom components
- **State Management**: React hooks and context
- **Date Handling**: date-fns library

## Project Structure

```
kaarigar360admin/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── UserCard.tsx    # User display component
│   │   ├── UserModal.tsx   # Detailed user view modal
│   │   ├── StatsCard.tsx   # Statistics display component
│   │   └── AnalyticsDashboard.tsx # Analytics dashboard
│   ├── services/           # Firebase and API services
│   │   ├── firebase.ts     # Firebase configuration
│   │   └── adminService.ts # Admin-specific API calls
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Main type definitions
│   ├── App.tsx             # Main application component
│   ├── Dashboard.tsx       # Main dashboard component
│   └── Login.tsx           # Authentication component
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kaarigar360admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Update `src/services/firebase.ts` with your Firebase configuration
   - Ensure Firestore rules allow admin access
   - Set up Firebase Authentication

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Firebase Configuration

### Firestore Rules
Ensure your Firestore rules allow admin access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin access
    match /{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.role == 'admin';
    }
  }
}
```

### Required Collections
- `users`: User profiles and verification data
- `bookings`: Booking information and status
- `disputes`: Dispute reports and resolutions
- `adminActions`: Admin action audit trail

## Usage

### Admin Login
- Default credentials: `admin` / `admin123`
- Update authentication logic in `src/Login.tsx`

### User Approval Process
1. Navigate to "Pending Approvals" tab
2. Review user details and CNIC photos
3. Click "View Details" for complete information
4. Approve, reject, or suspend with reasons

### Analytics Dashboard
1. Navigate to "Analytics" tab
2. Select time range (7d, 30d, 90d, 1y)
3. View comprehensive metrics and trends
4. Monitor platform health and growth

## Features in Detail

### User Management
- **Complete User Profiles**: View all user information including skills, ratings, and verification status
- **CNIC Verification**: Review identity documents for verification
- **Bulk Actions**: Approve or reject multiple users
- **Status Tracking**: Monitor user status changes over time

### Analytics & Reporting
- **Real-time Metrics**: Live statistics and KPIs
- **Trend Analysis**: Historical data and growth patterns
- **Revenue Tracking**: Financial performance monitoring
- **User Insights**: Registration patterns and user behavior

### Dispute Resolution
- **Dispute Management**: View and categorize disputes
- **Resolution Workflow**: Efficient dispute handling process
- **Communication**: Track dispute resolution progress
- **Audit Trail**: Complete action history

## Security Considerations

- **Role-based Access**: Admin-only access to sensitive data
- **Audit Logging**: Complete action history for compliance
- **Data Validation**: Input validation and sanitization
- **Secure Authentication**: Firebase Authentication integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Kaarigar360 platform. All rights reserved.

## Support

For support and questions, please contact the development team or create an issue in the repository.
