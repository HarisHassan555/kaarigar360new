import { useEffect, useState } from 'react';
import { initializeFirebase } from '../services/firebase/init';

export const useFirebaseInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initFirebase = async () => {
      try {
        // Initialize Firebase with web SDK
        await initializeFirebase();
        setIsInitialized(true);
        console.log('✅ Firebase initialized successfully in hook');
      } catch (err: any) {
        console.error('❌ Firebase initialization failed in hook:', err);
        setError(err.message);
        setIsInitialized(false);
      }
    };

    initFirebase();
  }, []);

  return { isInitialized, error };
};
