import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { User, Worker, Booking, Dispute } from '../types';
import type { AdminAction, DashboardStats } from '../types/admin';

// Test Firebase connection
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing Firebase connection...');
    console.log('🔗 Firebase app:', db.app.name);
    console.log('🔗 Firebase project:', db.app.options.projectId);
    
    // Try to read from a collection
    const testRef = collection(db, 'users');
    const testSnapshot = await getDocs(testRef);
    console.log('✅ Firebase connection successful!');
    console.log('📊 Found', testSnapshot.docs.length, 'documents in users collection');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
};


// Get all users with pending approval
export const getPendingUsers = async (): Promise<User[]> => {
  try {
    console.log('🔍 Fetching pending users...');
    console.log('🔗 Firebase connection:', db.app.name);
    console.log('🔗 Firebase project:', db.app.options.projectId);
    
    // First, let's try to get all users to see if we can connect
    console.log('📡 Attempting to fetch all users...');
    const allUsersRef = collection(db, 'users');
    const allUsersSnapshot = await getDocs(allUsersRef);
    console.log('📊 Total users in database:', allUsersSnapshot.docs.length);
    
    // Log all users to see what we have
    allUsersSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`👤 User ${index + 1}:`, {
        id: doc.id,
        email: data.email,
        status: data.status,
        role: data.role,
        createdAt: data.createdAt
      });
    });
    
    // Now get pending users specifically
    console.log('🔍 Fetching pending users with query...');
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    
    console.log('📊 Found', querySnapshot.docs.length, 'pending users');
    
    const users = querySnapshot.docs.map(doc => {
      const userData = {
        uid: doc.id,
        ...doc.data()
      } as User;
      console.log('👤 Pending User:', userData.email, 'Status:', userData.status);
      return userData;
    });
    
    console.log('✅ Returning', users.length, 'pending users');
    return users;
  } catch (error: any) {
    console.error('❌ Error fetching pending users:', error);
    console.error('❌ Error details:', error.code, error.message);
    console.error('❌ Error stack:', error.stack);
    throw new Error(`Failed to fetch pending users: ${error.message}`);
  }
};

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    let querySnapshot;
    
    try {
      // Try with orderBy first
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      querySnapshot = await getDocs(q);
    } catch (orderByError: any) {
      // If orderBy fails (no index), just get all users without ordering
      console.warn('orderBy failed, fetching without order:', orderByError.message);
      querySnapshot = await getDocs(usersRef);
    }
    
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date())
      } as User;
    });
    
    // Sort manually if orderBy failed
    users.sort((a, b) => {
      const dateAValue = a.createdAt as any;
      const dateBValue = b.createdAt as any;
      const dateA = dateAValue instanceof Date ? dateAValue : new Date(dateAValue);
      const dateB = dateBValue instanceof Date ? dateBValue : new Date(dateBValue);
      return dateB.getTime() - dateA.getTime();
    });
    
    return users;
  } catch (error: any) {
    console.error('Error fetching users:', error);
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
};

// Get workers
export const getWorkers = async (): Promise<Worker[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'worker'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as Worker));
  } catch (error: any) {
    console.error('Error fetching workers:', error);
    throw new Error(`Failed to fetch workers: ${error.message}`);
  }
};

// Get all bookings
export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    const bookingsRef = collection(db, 'bookings');
    let querySnapshot;
    
    try {
      // Try with orderBy first
      const q = query(bookingsRef, orderBy('createdAt', 'desc'));
      querySnapshot = await getDocs(q);
    } catch (orderByError: any) {
      // If orderBy fails (no index), just get all bookings without ordering
      console.warn('orderBy failed, fetching without order:', orderByError.message);
      querySnapshot = await getDocs(bookingsRef);
    }
    
    const bookings = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
        date: data.date?.toDate ? data.date.toDate() : (data.date ? new Date(data.date) : new Date())
      } as Booking;
    });
    
    // Sort manually if orderBy failed
    bookings.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    return bookings;
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }
};

// Get disputes
export const getDisputes = async (): Promise<Dispute[]> => {
  try {
    const disputesRef = collection(db, 'disputes');
    const q = query(disputesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      resolvedAt: doc.data().resolvedAt?.toDate()
    } as Dispute));
  } catch (error: any) {
    console.error('Error fetching disputes:', error);
    throw new Error(`Failed to fetch disputes: ${error.message}`);
  }
};

// Approve user
export const approveUser = async (userId: string, adminId: string): Promise<void> => {
  try {
    console.log('🔐 Approving user:', userId);
    console.log('👤 Admin ID:', adminId);
    console.log('🔗 Firebase connection:', db.app.name);
    
    const userRef = doc(db, 'users', userId);
    console.log('📝 Updating user document...');
    
    await updateDoc(userRef, {
      status: 'approved',
      cnicVerified: true,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ User approved successfully');

    // Log admin action
    console.log('📝 Logging admin action...');
    await addDoc(collection(db, 'adminActions'), {
      adminId,
      targetUserId: userId,
      action: 'approve_user',
      details: 'User approved and CNIC verified',
      createdAt: serverTimestamp()
    });
    
    console.log('✅ Admin action logged successfully');
  } catch (error: any) {
    console.error('❌ Error approving user:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check if admin user is properly authenticated and has admin role.');
    }
    
    throw new Error(`Failed to approve user: ${error.message}`);
  }
};

// Reject user
export const rejectUser = async (userId: string, adminId: string, reason: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: 'rejected',
      updatedAt: serverTimestamp()
    });

    // Log admin action
    await addDoc(collection(db, 'adminActions'), {
      adminId,
      targetUserId: userId,
      action: 'reject_user',
      details: `User rejected: ${reason}`,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    throw new Error('Failed to reject user');
  }
};

// Suspend user
export const suspendUser = async (userId: string, adminId: string, reason: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: 'suspended',
      updatedAt: serverTimestamp()
    });

    // Log admin action
    await addDoc(collection(db, 'adminActions'), {
      adminId,
      targetUserId: userId,
      action: 'suspend_user',
      details: `User suspended: ${reason}`,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error suspending user:', error);
    throw new Error('Failed to suspend user');
  }
};

// Resolve dispute
export const resolveDispute = async (disputeId: string, adminId: string, resolution: string): Promise<void> => {
  try {
    const disputeRef = doc(db, 'disputes', disputeId);
    await updateDoc(disputeRef, {
      status: 'resolved',
      resolution,
      resolvedAt: serverTimestamp()
    });

    // Log admin action
    await addDoc(collection(db, 'adminActions'), {
      adminId,
      targetUserId: disputeId,
      action: 'resolve_dispute',
      details: `Dispute resolved: ${resolution}`,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error resolving dispute:', error);
    throw new Error('Failed to resolve dispute');
  }
};

// Get dashboard stats
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log('📊 Fetching dashboard stats...');
    
    const [usersSnapshot, bookingsSnapshot, disputesSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'bookings')),
      getDocs(query(collection(db, 'disputes'), where('status', '==', 'open'))).catch(() => {
        // If disputes query fails, return empty snapshot
        console.warn('Failed to fetch disputes, using empty array');
        return { docs: [] } as any;
      })
    ]);

    console.log('📈 Data fetched:', {
      users: usersSnapshot.docs.length,
      bookings: bookingsSnapshot.docs.length,
      disputes: disputesSnapshot.docs.length
    });

    const users = usersSnapshot.docs.map((doc: any) => doc.data());
    const bookings = bookingsSnapshot.docs.map((doc: any) => doc.data());
    const disputes = disputesSnapshot.docs.map((doc: any) => doc.data());

    const totalUsers = users.length;
    const totalWorkers = users.filter(user => user.role === 'worker').length;
    const totalEmployers = users.filter(user => user.role === 'employer').length;
    const pendingApprovals = users.filter(user => user.status === 'pending').length;
    const activeBookings = bookings.filter(booking => 
      booking.status === 'pending' || booking.status === 'accepted'
    ).length;
    const completedBookings = bookings.filter(booking => booking.status === 'completed').length;
    const pendingDisputes = disputes.length;

    const totalRevenue = bookings
      .filter(booking => booking.status === 'completed')
      .reduce((sum, booking) => sum + (booking.payment?.amount || 0), 0);

    // Calculate monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyRevenue = bookings
      .filter(booking => {
        try {
          const bookingDate = booking.createdAt?.toDate 
            ? booking.createdAt.toDate() 
            : new Date(booking.createdAt);
          return bookingDate >= thirtyDaysAgo && booking.status === 'completed';
        } catch (e) {
          console.warn('Error processing booking date for revenue:', e);
          return false;
        }
      })
      .reduce((sum, booking) => sum + (booking.payment?.amount || 0), 0);

    const stats = {
      totalUsers,
      totalWorkers,
      totalEmployers,
      pendingApprovals,
      activeBookings,
      completedBookings,
      pendingDisputes,
      totalRevenue,
      monthlyRevenue
    };

    console.log('✅ Dashboard stats calculated:', stats);
    return stats;
  } catch (error: any) {
    console.error('❌ Error fetching dashboard stats:', error);
    throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
  }
};

// Get admin actions
export const getAdminActions = async (): Promise<AdminAction[]> => {
  try {
    const actionsRef = collection(db, 'adminActions');
    const q = query(actionsRef, orderBy('createdAt', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    } as AdminAction));
  } catch (error) {
    console.error('Error fetching admin actions:', error);
    throw new Error('Failed to fetch admin actions');
  }
};
