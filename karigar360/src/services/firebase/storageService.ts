import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseServices } from './init';
import { Platform } from 'react-native';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Convert image URI to base64 string (React Native compatible)
 * @param fileUri - Local file URI from image picker
 * @returns Promise with base64 string
 */
const convertImageToBase64 = async (fileUri: string): Promise<string> => {
  try {
    console.log('🔄 Converting image to base64...');
    console.log('📁 File URI:', fileUri);
    console.log('📱 Platform:', Platform.OS);
    
    if (Platform.OS === 'web') {
      // Web platform - use FileReader
      const response = await fetch(fileUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          console.log('✅ Base64 conversion successful (Web), length:', base64String.length);
          resolve(base64String);
        };
        reader.onerror = (error) => {
          console.error('❌ Base64 conversion failed (Web):', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } else {
      // React Native platform - use fetch with base64 encoding
      const response = await fetch(fileUri);
      const blob = await response.blob();
      
      // Convert blob to base64 using a more reliable method
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          console.log('✅ Base64 conversion successful (React Native), length:', base64String.length);
          resolve(base64String);
        };
        reader.onerror = (error) => {
          console.error('❌ Base64 conversion failed (React Native):', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    }
  } catch (error: any) {
    console.error('❌ Error converting image to base64:', error);
    throw new Error(`Failed to convert image to base64: ${error.message}`);
  }
};

/**
 * Upload an image file to Firebase Storage (simplified approach)
 * @param fileUri - Local file URI from image picker
 * @param userId - User ID for organizing files
 * @param fileName - Name for the file (e.g., 'cnic_front', 'cnic_back')
 * @returns Promise with download URL and storage path
 */
export const uploadImageToStorage = async (
  fileUri: string,
  userId: string,
  fileName: string
): Promise<UploadResult> => {
  try {
    console.log('📤 Starting image upload to Firebase Storage...');
    console.log('📁 File URI:', fileUri);
    console.log('👤 User ID:', userId);
    console.log('📝 File name:', fileName);

    const { storage } = await getFirebaseServices();
    
    // Create storage reference
    const storagePath = `cnic-photos/${userId}/${fileName}`;
    const storageRef = ref(storage, storagePath);
    
    console.log('📂 Storage path:', storagePath);

    // Fetch the image and convert to blob directly
    console.log('🔄 Fetching image and converting to blob...');
    console.log('📁 Fetching from URI:', fileUri);
    
    const response = await fetch(fileUri);
    console.log('📡 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('📦 Blob created, size:', blob.size, 'type:', blob.type);
    
    if (blob.size === 0) {
      throw new Error('Image blob is empty - file may be corrupted or inaccessible');
    }

    // Upload the blob to Firebase Storage
    console.log('⬆️ Uploading blob to Firebase Storage...');
    const uploadResult = await uploadBytes(storageRef, blob);
    console.log('✅ Upload successful:', uploadResult.metadata.name);

    // Get the download URL
    console.log('🔗 Getting download URL...');
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log('✅ Download URL obtained:', downloadURL);

    return {
      url: downloadURL,
      path: storagePath
    };
  } catch (error: any) {
    console.error('❌ Error uploading image to Firebase Storage:', error);
    console.error('❌ Error details:', error.code, error.message);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Upload CNIC photos for a user
 * @param userId - User ID
 * @param cnicFrontPhoto - Front CNIC photo URI
 * @param cnicBackPhoto - Back CNIC photo URI
 * @returns Promise with front and back photo URLs
 */
export const uploadCNICPhotos = async (
  userId: string,
  cnicFrontPhoto: string,
  cnicBackPhoto: string
): Promise<{ front: string; back: string }> => {
  try {
    console.log('📸 Starting CNIC photos upload for user:', userId);
    
    // Upload both photos in parallel
    const [frontResult, backResult] = await Promise.all([
      uploadImageToStorage(cnicFrontPhoto, userId, 'cnic_front.jpg'),
      uploadImageToStorage(cnicBackPhoto, userId, 'cnic_back.jpg')
    ]);

    console.log('✅ CNIC photos uploaded successfully');
    console.log('📷 Front photo URL:', frontResult.url);
    console.log('📷 Back photo URL:', backResult.url);

    return {
      front: frontResult.url,
      back: backResult.url
    };
  } catch (error: any) {
    console.error('❌ Error uploading CNIC photos:', error);
    throw new Error(`Failed to upload CNIC photos: ${error.message}`);
  }
};


