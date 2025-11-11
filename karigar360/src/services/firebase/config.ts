import { getFirebaseServices } from './init';

// Get Firebase services
const { app, auth, db, storage } = getFirebaseServices();

export { auth, db, storage };
export default app;
