import { doc, updateDoc } from 'firebase/firestore';
import { getFirebaseServices } from './init';

/**
 * Update user document with CNIC photos URLs
 * @param userId - User ID
 * @param cnicPhotos - Object containing front and back photo URLs
 */
export const updateUserCNICPhotos = async (
  userId: string,
  cnicPhotos: { front: string; back: string }
): Promise<void> => {
  try {
    console.log('📝 Updating user document with CNIC photos URLs...');
    console.log('👤 User ID:', userId);
    console.log('📷 CNIC Photos:', cnicPhotos);

    const { db } = await getFirebaseServices();
    
    // Update the user document with CNIC photos URLs
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'profile.cnicPhotos': cnicPhotos,
      updatedAt: new Date().toISOString()
    });

    console.log('✅ User document updated successfully with CNIC photos URLs');
  } catch (error: any) {
    console.error('❌ Error updating user document with CNIC photos:', error);
    throw new Error(`Failed to update user CNIC photos: ${error.message}`);
  }
};


