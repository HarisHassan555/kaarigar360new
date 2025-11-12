# Kaarigar360 Application - Complete Overview

## 📱 Application Overview

Kaarigar360 is a comprehensive mobile and web platform that connects skilled workers (kaarigars) with employers who need their services. The application features a robust user approval system, role-based access control, booking management, and an admin portal for user management.

---

## 🔐 User Registration & Account Creation Flow

### Step 1: Registration Process

The registration process is a **5-step wizard** that collects comprehensive user information:

#### **Step 1: Personal Information**
- First Name
- Last Name
- Role Selection (Employer or Worker)

#### **Step 2: Contact Information**
- Phone Number
- Complete Address

#### **Step 3: Account Security**
- Email Address
- Password (minimum 6 characters)
- Password Confirmation

#### **Step 4: Identity Information**
- CNIC Number (National ID)

#### **Step 5: Identity Verification**
- CNIC Front Side Photo Upload
- CNIC Back Side Photo Upload

### Step 2: Account Creation in Firebase

When a user completes registration:

1. **Firebase Authentication Account** is created with email and password
2. **Firestore User Document** is created with:
   - User ID (from Firebase Auth)
   - Email, Phone, Address
   - Role (employer/worker)
   - **Status: 'pending'** (critical for approval flow)
   - Profile information (name, CNIC, etc.)
   - CNIC photos uploaded to Firebase Storage
   - `createdAt` and `updatedAt` timestamps

3. **CNIC Photos** are uploaded to Firebase Storage in the path:
   - `users/{userId}/cnic/front.jpg`
   - `users/{userId}/cnic/back.jpg`

4. **User Status** is set to `'pending'` - meaning the account cannot be used until admin approval

### Step 3: Post-Registration Experience

After successful registration:
- User sees a success message
- User is redirected to Login screen
- User **cannot access the main application** until approved
- If user tries to login, they are blocked and shown a Status Check screen

---

## 👨‍💼 Admin Portal Approval Process

### Admin Portal Access

The admin portal is a separate web application (`kaarigar360admin`) that allows administrators to:
- View dashboard statistics
- Manage pending user approvals
- View all users
- Handle disputes
- View analytics

### Admin Approval Workflow

1. **New User Registration**
   - User completes registration with status: 'pending'
   - User document appears in Firestore `users` collection
   - Admin portal automatically fetches pending users

2. **Admin Reviews User**
   - Admin logs into admin portal
   - Navigates to "Pending Approvals" tab
   - Views user details including:
     - Full name, email, phone
     - CNIC number
     - CNIC photos (front and back - clickable to view full size)
     - Registration date
     - Role (employer/worker)

3. **Admin Actions**
   - **Approve User**: 
     - Sets user status to `'approved'`
     - Sets `cnicVerified` to `true`
     - Updates `updatedAt` timestamp
     - Logs admin action in `adminActions` collection
   - **Reject User**:
     - Sets user status to `'rejected'`
     - Stores rejection reason
     - Logs admin action
   - **Suspend User**:
     - Sets user status to `'suspended'`
     - Stores suspension reason
     - Logs admin action

4. **Post-Approval**
   - User status changes to `'approved'` in Firestore
   - User can now login and access the mobile application
   - User disappears from pending list in admin portal
   - User appears in "All Users" list with approved status

---

## 🔑 Login Flow After Approval

### Authentication Process

1. **User Enters Credentials**
   - Email and password on Login screen

2. **Firebase Authentication**
   - Credentials are verified with Firebase Auth
   - If valid, user authentication token is received

3. **User Status Check**
   - System fetches user document from Firestore
   - Checks user `status` field:
     - **'pending'**: User is blocked, shown Status Check screen
     - **'rejected'**: User is blocked, shown rejection message
     - **'suspended'**: User is blocked, shown suspension message
     - **'approved'**: User proceeds to main application

4. **Role-Based Navigation**
   - If approved, user is redirected based on their role:
     - **Employer** → Employer Navigator (Home, Search, Bookings, Profile tabs)
     - **Worker** → Worker Navigator (Home, My Work, Schedule, Profile tabs)

5. **Session Management**
   - User data is stored in Redux store
   - User session persists across app restarts
   - User can logout to return to login screen

---

## 👔 Employer Features: Booking Workers

### Finding Workers

1. **Home Screen**
   - Welcome message with user's name
   - Quick action cards:
     - "Find Workers" - navigates to search
     - "My Bookings" - navigates to bookings

2. **Worker Search Screen**
   - Search bar to search by name or location
   - Skill filter chips (Carpenter, Electrician, Plumber, etc.)
   - List of available workers showing:
     - Worker name
     - Rating (star rating)
     - Experience years
     - Hourly rate (PKR)
     - Skills tags
     - CNIC verified badge
   - Tap on worker card to view full profile

3. **Worker Profile Screen**
   - Full worker details:
     - Profile picture
     - Name, rating, experience
     - Skills list
     - Hourly rate
     - Description
     - Location
   - "Book Worker" button to create booking

### Creating a Booking

1. **Booking Screen**
   - Employer selects:
     - **Task/Service** (required)
     - **Description** (optional)
     - **Date** (from date picker - next 30 days)
     - **Time** (hour, minute, AM/PM picker)
     - **Address** (required)
   
2. **Booking Validation**
   - All required fields must be filled
   - Date and time must be in the future
   - User must be logged in

3. **Booking Creation**
   - Booking document created in Firestore `bookings` collection with:
     - `workerId`: Selected worker's ID
     - `employerId`: Current user's ID
     - `status`: 'pending' (awaiting worker acceptance)
     - `date`: Combined date and time
     - `task`: Task/service name
     - `description`: Optional description
     - `location`: Address with coordinates
     - `payment`: Amount (from worker's hourly rate) and status: 'pending'
     - `createdAt`: Timestamp

4. **Post-Booking**
   - Success message shown to employer
   - Booking appears in "My Bookings" screen
   - Worker receives notification (appears in their "My Work" screen)

### Managing Bookings

**My Bookings Screen** shows:
- All bookings created by employer
- Filtered by status:
  - Pending (awaiting worker acceptance)
  - Accepted (worker accepted, job scheduled)
  - Completed (job finished)
  - Cancelled
- Each booking shows:
  - Task name
  - Worker name
  - Date and time
  - Location
  - Status badge
  - Payment status

---

## 🔧 Worker Features: Managing Work

### Home Screen
- Welcome message
- Quick stats and overview
- Recent activity

### My Work Screen
- Tabbed interface showing:
  - **Pending**: Booking requests from employers
  - **Accepted**: Bookings worker has accepted
  - **Completed**: Finished jobs

### Accepting/Declining Bookings

1. **Pending Bookings**
   - Worker sees booking request with:
     - Task description
     - Date and time
     - Location/address
     - Employer information
     - Payment amount
   - Worker can:
     - **Accept**: Changes status to 'accepted'
     - **Decline**: Changes status to 'cancelled'

2. **Accepted Bookings**
   - Shows confirmed jobs
   - Worker can view details
   - Status shows as "Accepted"

3. **Completed Bookings**
   - Shows finished jobs
   - Displays ratings received from employer (if any)

### Schedule Screen

Workers have a dedicated **Schedule Screen** that provides:

1. **Calendar View**
   - Monthly calendar display
   - Days with bookings are highlighted
   - Job count indicator on days with multiple jobs
   - Navigate between months

2. **Date Selection**
   - Tap on any date to see detailed job list for that day
   - Shows all bookings scheduled for selected date

3. **Job Details**
   - For each booking on selected date:
     - Task/service name
     - Time (formatted)
     - Employer name
     - Location/address
     - Payment amount
     - Status badge (Pending/Accepted/Completed)
     - Description

4. **Quick Stats**
   - Upcoming jobs count
   - Completed jobs count
   - Pending requests count

---

## 🚫 Double-Booking Prevention Mechanism

### Current Implementation

The application tracks worker availability through the booking system, but the **explicit conflict checking** happens at the application logic level:

### How It Works

1. **Booking Creation**
   - When employer creates a booking, it's stored with:
     - `workerId`: The worker being booked
     - `date`: Specific date and time
     - `status`: 'pending' (initially)

2. **Worker Acceptance**
   - When worker accepts a booking, status changes to 'accepted'
   - Worker can see all their bookings in Schedule screen
   - Schedule screen visually shows conflicts (multiple jobs on same day/time)

3. **Conflict Prevention Logic**

   **At Booking Creation:**
   - System validates that date/time is in the future
   - However, **explicit overlap checking** is not currently implemented at the database level
   - Multiple pending bookings can be created for the same worker at the same time

   **At Worker Acceptance:**
   - Worker can see all pending requests in "My Work" screen
   - Worker can see their schedule in "Schedule" screen
   - Worker must manually check for conflicts before accepting
   - If worker accepts conflicting bookings, both will show in schedule

4. **Recommended Enhancement**

   To prevent double-booking, the system should:
   - Before creating booking, check if worker has any 'accepted' bookings at the same date/time
   - Before worker accepts, check for existing 'accepted' bookings at that date/time
   - Show warning/error if conflict detected
   - Query existing bookings:
     ```typescript
     // Pseudo-code for conflict check
     const existingBookings = await getBookings(undefined, workerId);
     const conflictingBooking = existingBookings.find(booking => 
       booking.status === 'accepted' &&
       booking.date.getTime() === newBookingDate.getTime()
     );
     if (conflictingBooking) {
       throw new Error('Worker is already booked at this time');
     }
     ```

### Current State

- **Visual Conflict Detection**: Schedule screen shows all bookings, making conflicts visible
- **Manual Prevention**: Workers must check schedule before accepting
- **No Automatic Blocking**: System does not automatically prevent double-booking
- **Future Enhancement**: Should implement automatic conflict checking at booking creation and acceptance

---

## 📱 Screen Purposes & Navigation

### Authentication Screens

#### **LoginScreen**
- **Purpose**: User authentication
- **Features**: Email/password login, forgot password link, registration link
- **Navigation**: On success → Role-based navigator (Employer/Worker)

#### **RegisterScreen**
- **Purpose**: New user registration
- **Features**: 5-step registration wizard, role selection, CNIC photo upload
- **Navigation**: On success → Login screen

#### **StatusCheckScreen**
- **Purpose**: Show account approval status for pending/rejected/suspended users
- **Features**: Status display, check status button, contact support
- **Navigation**: Can logout to return to login

### Employer Screens

#### **HomeScreen** (Employer)
- **Purpose**: Dashboard and quick actions
- **Features**: Welcome message, quick action cards (Find Workers, My Bookings)
- **Navigation**: Can navigate to Search or Bookings tabs

#### **WorkerSearchScreen**
- **Purpose**: Browse and search for workers
- **Features**: Search bar, skill filters, worker cards with ratings/prices
- **Navigation**: Tap worker → WorkerProfileScreen

#### **WorkerProfileScreen**
- **Purpose**: View detailed worker information
- **Features**: Full profile, skills, ratings, hourly rate, description
- **Navigation**: "Book Worker" → BookingScreen

#### **BookingScreen**
- **Purpose**: Create new booking request
- **Features**: Task input, date/time picker, address input
- **Navigation**: On success → HomeScreen

#### **MyBookingsScreen**
- **Purpose**: View and manage employer's bookings
- **Features**: List of all bookings, status filters, booking details
- **Navigation**: Tap booking → PaymentScreen or RatingScreen

#### **PaymentScreen**
- **Purpose**: Process payment for completed bookings
- **Features**: Payment method selection, amount display, payment processing

#### **RatingScreen**
- **Purpose**: Rate and review worker after job completion
- **Features**: Star rating, review text input, submit rating

#### **ProfileScreen** (Employer)
- **Purpose**: View and edit employer profile
- **Features**: Profile information, edit capabilities, logout

### Worker Screens

#### **HomeScreen** (Worker)
- **Purpose**: Worker dashboard
- **Features**: Welcome message, quick stats, recent activity

#### **MyWorkScreen**
- **Purpose**: Manage booking requests and accepted jobs
- **Features**: Tabbed interface (Pending/Accepted/Completed), accept/decline actions
- **Navigation**: Shows all bookings for worker

#### **ScheduleScreen**
- **Purpose**: Visual calendar view of worker's schedule
- **Features**: Monthly calendar, date selection, job details for selected date, conflict visualization
- **Navigation**: Tap date → See jobs for that date

#### **ProfileScreen** (Worker)
- **Purpose**: View and edit worker profile
- **Features**: Profile information, skills, hourly rate, edit capabilities, logout

### Admin Portal Screens

#### **Dashboard** (Admin Portal)
- **Purpose**: Overview and user management
- **Tabs**:
  - **Overview**: Statistics (total users, workers, pending approvals, revenue, bookings, disputes)
  - **Pending Approvals**: List of users awaiting approval with approve/reject actions
  - **All Users**: Complete user list with status and actions
  - **Disputes**: Manage user disputes
  - **Analytics**: Detailed analytics dashboard

---

## 🔄 Complete User Journey

### New User Journey

1. **Registration**
   - User downloads app
   - Clicks "Create Account"
   - Completes 5-step registration
   - Uploads CNIC photos
   - Account created with status: 'pending'

2. **Waiting for Approval**
   - User tries to login
   - Blocked and shown Status Check screen
   - User sees "Account Pending Approval" message
   - User can check status periodically

3. **Admin Approval**
   - Admin logs into portal
   - Sees user in "Pending Approvals"
   - Reviews CNIC photos and details
   - Clicks "Approve"
   - User status changes to 'approved'

4. **First Login**
   - User logs in successfully
   - Redirected to role-based home screen
   - Can now use full application features

### Employer Journey

1. **Finding Workers**
   - Opens app → Home screen
   - Clicks "Find Workers" or navigates to Search tab
   - Searches/filters workers
   - Views worker profiles

2. **Booking a Worker**
   - Selects worker
   - Views profile
   - Clicks "Book Worker"
   - Fills booking form (task, date, time, address)
   - Submits booking
   - Booking created with status: 'pending'

3. **Managing Bookings**
   - Navigates to "My Bookings"
   - Sees all bookings with status
   - Waits for worker acceptance
   - Once accepted, job is scheduled
   - After completion, can rate worker

### Worker Journey

1. **Receiving Booking Requests**
   - Opens app → Home screen
   - Navigates to "My Work" tab
   - Sees "Pending" bookings
   - Views booking details (task, date, time, location, payment)

2. **Accepting/Declining**
   - Reviews booking request
   - Checks Schedule screen for conflicts
   - Accepts or declines
   - If accepts, status changes to 'accepted'

3. **Managing Schedule**
   - Opens Schedule screen
   - Views monthly calendar
   - Sees days with bookings highlighted
   - Taps date to see job details
   - Can see all upcoming jobs

4. **Completing Work**
   - Attends job at scheduled time
   - Completes work
   - Employer marks as completed
   - Receives rating (if employer rates)

---

## 🗄️ Data Structure

### Firestore Collections

#### **users**
- Stores all user accounts (employers, workers, admins)
- Fields: uid, email, role, status, profile, createdAt, updatedAt
- Status values: 'pending', 'approved', 'rejected', 'suspended'

#### **bookings**
- Stores all booking requests and confirmed bookings
- Fields: id, workerId, employerId, status, date, task, description, location, payment, createdAt
- Status values: 'pending', 'accepted', 'completed', 'cancelled'

#### **ratings**
- Stores ratings and reviews
- Fields: bookingId, workerId, employerId, rating (1-5), review, createdAt

#### **adminActions**
- Logs all admin actions
- Fields: adminId, targetUserId, action, details, createdAt

#### **disputes**
- Stores user disputes
- Fields: id, type, status, details, createdAt

### Firebase Storage

#### **CNIC Photos**
- Path: `users/{userId}/cnic/front.jpg`
- Path: `users/{userId}/cnic/back.jpg`

---

## 🔒 Security & Permissions

### User Status-Based Access

- **Pending**: Cannot login, sees Status Check screen
- **Approved**: Full access to application
- **Rejected**: Cannot login, sees rejection message
- **Suspended**: Cannot login, sees suspension message

### Firestore Security Rules

- Users can read their own data
- Users can update their own profile
- Employers can create bookings
- Workers can update booking status (accept/decline)
- Admins have full access through admin portal

---

## 📊 Key Features Summary

### For Employers
- ✅ Search and filter workers by skill/location
- ✅ View detailed worker profiles with ratings
- ✅ Create booking requests with date/time
- ✅ Manage all bookings (pending/accepted/completed)
- ✅ Process payments
- ✅ Rate workers after job completion

### For Workers
- ✅ Receive booking requests
- ✅ Accept or decline bookings
- ✅ View schedule in calendar format
- ✅ See all upcoming and completed jobs
- ✅ Manage profile and skills
- ✅ View ratings received

### For Admins
- ✅ Approve/reject/suspend users
- ✅ View all users and their status
- ✅ Review CNIC photos for verification
- ✅ View dashboard statistics
- ✅ Manage disputes
- ✅ Access analytics

---

## 🚀 Technical Stack

### Mobile App (React Native/Expo)
- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack & Tab navigators)
- **State Management**: Redux Toolkit
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Language**: TypeScript

### Admin Portal (Web)
- **Framework**: React with Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (same as mobile app)
- **Language**: TypeScript

---

## 📝 Notes & Future Enhancements

### Current Limitations

1. **Double-Booking Prevention**: Not automatically enforced - relies on worker checking schedule manually
2. **Payment Integration**: Currently simulated - needs real payment gateway
3. **Notifications**: Not implemented - users must check app for updates
4. **Location Services**: Address is text input - could integrate map picker

### Recommended Enhancements

1. **Automatic Conflict Detection**: Check for overlapping bookings before creation/acceptance
2. **Push Notifications**: Notify users of new bookings, acceptances, etc.
3. **Real Payment Gateway**: Integrate payment processing
4. **Map Integration**: Use maps for location selection and worker search
5. **Chat/Messaging**: Allow communication between employer and worker
6. **Worker Availability Calendar**: Let workers set available time slots
7. **Booking Duration**: Add duration field to bookings for better conflict detection

---

## 📞 Support & Contact

For technical support or questions:
- Email: support@kaarigar360.com
- Check Status Check screen in app for support options

---

*This document provides a comprehensive overview of the Kaarigar360 application. For technical implementation details, refer to the source code and inline documentation.*

