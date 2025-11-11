import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { Booking, Rating } from '../../types';
import { getFirebaseServices } from './init';

// Create a new booking
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> => {
  try {
    const { db } = await getFirebaseServices();
    const bookingsRef = collection(db, 'bookings');

    const newBooking = {
      ...bookingData,
      createdAt: new Date(),
    };

    const docRef = await addDoc(bookingsRef, {
      ...newBooking,
      createdAt: newBooking.createdAt.toISOString(),
      date: newBooking.date.toISOString(),
    });

    return {
      ...newBooking,
      id: docRef.id,
    };
  } catch (error: any) {
    console.error('Error creating booking:', error);
    if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
      throw new Error('Firebase security rules not configured. Please deploy Firestore rules first.');
    }
    throw new Error(error.message || 'Failed to create booking');
  }
};

// Get bookings for a user (employer or worker) - modified to avoid index requirements
export const getBookings = async (employerId?: string, workerId?: string): Promise<Booking[]> => {
  try {
    const { db } = await getFirebaseServices();
    const bookingsRef = collection(db, 'bookings');

    let q;
    if (employerId) {
      // Query without orderBy to avoid index requirement, then sort manually
      q = query(bookingsRef, where('employerId', '==', employerId));
    } else if (workerId) {
      // Query without orderBy to avoid index requirement, then sort manually
      q = query(bookingsRef, where('workerId', '==', workerId));
    } else {
      // For general query, use orderBy since there's no where clause
      q = query(bookingsRef, orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);

    let bookings = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: new Date(doc.data().createdAt),
      date: new Date(doc.data().date),
    } as Booking));

    // Sort manually for filtered queries (employerId or workerId)
    if (employerId || workerId) {
      bookings = bookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return bookings;
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
      throw new Error('Firebase security rules not configured. Please deploy Firestore rules first.');
    }
    throw new Error(error.message || 'Failed to fetch bookings');
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId: string, status: Booking['status']): Promise<Booking> => {
  try {
    const { db } = await getFirebaseServices();
    const bookingRef = doc(db, 'bookings', bookingId);

    await updateDoc(bookingRef, {
      status,
      updatedAt: new Date().toISOString(),
    });

    const updatedDoc = await getDoc(bookingRef);
    return {
      ...updatedDoc.data(),
      id: updatedDoc.id,
      createdAt: new Date(updatedDoc.data()!.createdAt),
      date: new Date(updatedDoc.data()!.date),
    } as Booking;
  } catch (error: any) {
    console.error('Error updating booking status:', error);
    if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
      throw new Error('Firebase security rules not configured. Please deploy Firestore rules first.');
    }
    throw new Error(error.message || 'Failed to update booking status');
  }
};

// Process payment for a booking
export const processPayment = async (bookingId: string, paymentMethod: string): Promise<boolean> => {
  try {
    const { db } = await getFirebaseServices();
    const bookingRef = doc(db, 'bookings', bookingId);

    // Simulate payment processing (in real app, integrate with payment gateway)
    const success = Math.random() > 0.1; // 90% success rate

    if (success) {
      await updateDoc(bookingRef, {
        'payment.status': 'completed',
        'payment.method': paymentMethod,
        updatedAt: new Date().toISOString(),
      });
    }

    return success;
  } catch (error: any) {
    console.error('Error processing payment:', error);
    if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
      throw new Error('Firebase security rules not configured. Please deploy Firestore rules first.');
    }
    throw new Error(error.message || 'Failed to process payment');
  }
};

// Submit a rating for a worker
export const submitRating = async (ratingData: Omit<Rating, 'createdAt'>): Promise<Rating> => {
  try {
    const { db } = await getFirebaseServices();
    const ratingsRef = collection(db, 'ratings');

    const newRating = {
      ...ratingData,
      createdAt: new Date(),
    };

    const docRef = await addDoc(ratingsRef, {
      ...newRating,
      createdAt: newRating.createdAt.toISOString(),
    });

    // Update worker's average rating
    await updateWorkerRating(ratingData.workerId);

    return {
      ...newRating,
      createdAt: newRating.createdAt,
    };
  } catch (error: any) {
    console.error('Error submitting rating:', error);
    if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
      throw new Error('Firebase security rules not configured. Please deploy Firestore rules first.');
    }
    throw new Error(error.message || 'Failed to submit rating');
  }
};

// Helper function to update worker's average rating
const updateWorkerRating = async (workerId: string): Promise<void> => {
  try {
    const { db } = await getFirebaseServices();
    const ratingsRef = collection(db, 'ratings');
    const q = query(ratingsRef, where('workerId', '==', workerId));
    const querySnapshot = await getDocs(q);

    const ratings = querySnapshot.docs.map(doc => doc.data().rating);
    const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

    const workerRef = doc(db, 'users', workerId);
    await updateDoc(workerRef, {
      'profile.rating': averageRating,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to update worker rating:', error);
    // Don't throw error for rating updates - it's not critical
  }
};

