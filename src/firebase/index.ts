
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, type Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';

import { firebaseConfig } from './config';

export type FirebaseServices = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
};

let services: FirebaseServices | null = null;

// This flag will be checked to see if we've already connected to the emulators.
let emulatorsConnected = false;

export function initializeFirebase(): FirebaseServices {
  if (services) {
    return services;
  }

  const firebaseApp =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);

  // Use NEXT_PUBLIC_EMULATORS_ENABLED to connect to emulators if it's 'true'
  // and we haven't connected before.
  if (process.env.NEXT_PUBLIC_EMULATORS_ENABLED === 'true' && !emulatorsConnected) {
      console.log("Connecting to Firebase Emulators");
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
      connectStorageEmulator(storage, '127.0.0.1', 9199);
      emulatorsConnected = true; // Set flag to prevent reconnecting
  } else if (!emulatorsConnected) {
    console.log("Connecting to Production Firebase Services");
  }


  services = { firebaseApp, auth, firestore, storage };
  return services;
}

export {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
} from './provider';

export { FirebaseClientProvider } from './client-provider';
export { useUser } from './auth/use-user';
