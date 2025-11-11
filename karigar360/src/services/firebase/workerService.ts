import { collection, doc, getDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { Rating, Worker } from '../../types';
import { getFirebaseServices } from './init';

// Get all workers
export const getWorkers = async (): Promise<Worker[]> => {
  try {
    const { db } = await getFirebaseServices();
    const workersRef = collection(db, 'users');
    const q = query(workersRef, where('role', '==', 'worker'));
    const querySnapshot = await getDocs(q);

    const allWorkers = querySnapshot.docs.map(doc => doc.data() as Worker);
    
    // Filter to only show available workers (default to available if status not set)
    return allWorkers.filter(worker => 
      worker.availabilityStatus === 'available' || worker.availabilityStatus === undefined
    );
  } catch (error: any) {
    console.error('Error fetching workers:', error);
    if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
      throw new Error('Firebase security rules not configured. Please deploy Firestore rules first.');
    }
    throw new Error(error.message || 'Failed to fetch workers');
  }
};

// Get worker by ID
export const getWorkerById = async (workerId: string): Promise<Worker | null> => {
  try {
    const { db } = await getFirebaseServices();
    const workerDoc = await getDoc(doc(db, 'users', workerId));

    if (!workerDoc.exists()) {
      return null;
    }

    return workerDoc.data() as Worker;
  } catch (error: any) {
    console.error('Error fetching worker:', error);
    if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
      throw new Error('Firebase security rules not configured. Please deploy Firestore rules first.');
    }
    throw new Error(error.message || 'Failed to fetch worker');
  }
};

// Search workers by skills and query
export const searchWorkers = async (skillFilter?: string, searchQuery?: string): Promise<Worker[]> => {
  try {
    const { db } = await getFirebaseServices();
    const workersRef = collection(db, 'users');
    const q = query(workersRef, where('role', '==', 'worker'));
    const querySnapshot = await getDocs(q);

    let workers = querySnapshot.docs.map(doc => doc.data() as Worker);

    // Filter by availability status first
    workers = workers.filter(worker => 
      worker.availabilityStatus === 'available' || worker.availabilityStatus === undefined
    );

    // Filter by skill
    if (skillFilter) {
      workers = workers.filter(worker =>
        worker.profile.skills?.some(skill =>
          skill.toLowerCase().includes(skillFilter.toLowerCase())
        )
      );
    }

    // Filter by search query
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      workers = workers.filter(worker =>
        worker.profile.fullName.toLowerCase().includes(query) ||
        worker.profile.firstName.toLowerCase().includes(query) ||
        worker.profile.lastName.toLowerCase().includes(query) ||
        worker.profile.address.toLowerCase().includes(query) ||
        (worker.profile.description && worker.profile.description.toLowerCase().includes(query)) ||
        worker.profile.skills?.some(skill => skill.toLowerCase().includes(query))
      );
    }

    return workers;
  } catch (error: any) {
    console.error('Error searching workers:', error);
    if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
      throw new Error('Firebase security rules not configured. Please deploy Firestore rules first.');
    }
    throw new Error(error.message || 'Failed to search workers');
  }
};

// Get worker ratings (modified to avoid index requirement)
export const getWorkerRatings = async (workerId: string): Promise<Rating[]> => {
  try {
    const { db } = await getFirebaseServices();
    const ratingsRef = collection(db, 'ratings');

    // First get all ratings for this worker (no orderBy to avoid index requirement)
    const q = query(ratingsRef, where('workerId', '==', workerId));
    const querySnapshot = await getDocs(q);

    // Then sort manually in memory
    const ratings = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: new Date(doc.data().createdAt)
    } as Rating));

    // Sort by createdAt descending (newest first)
    return ratings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error: any) {
    console.error('Error fetching worker ratings:', error);
    if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
      throw new Error('Firebase security rules not configured. Please deploy Firestore rules first.');
    }
    throw new Error(error.message || 'Failed to fetch worker ratings');
  }
};

// Update worker availability status
export const updateWorkerStatus = async (workerId: string, availabilityStatus: 'available' | 'unavailable'): Promise<void> => {
  try {
    const { db } = await getFirebaseServices();
    const workerRef = doc(db, 'users', workerId);

    await updateDoc(workerRef, {
      availabilityStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error updating worker status:', error);
    if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
      throw new Error('Firebase security rules not configured. Please deploy Firestore rules first.');
    }
    throw new Error(error.message || 'Failed to update worker status');
  }
};

