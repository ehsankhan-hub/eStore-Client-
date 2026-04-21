import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { environment } from '../../environments/environment';

let cachedApp: FirebaseApp | undefined;
let cachedAuth: Auth | undefined;
let cachedDb: Firestore | undefined;

/**
 * True when all Web SDK fields are filled with a real Firebase Web app config
 * (from Firebase Console → Project settings → Your apps).
 */
export function isFirebaseConfigured(): boolean {
  const c = environment.firebase;
  if (!c) return false;
  const apiKey = String(c.apiKey || '').trim();
  const authDomain = String(c.authDomain || '').trim();
  const projectId = String(c.projectId || '').trim();
  const storageBucket = String(c.storageBucket || '').trim();
  const messagingSenderId = String(c.messagingSenderId || '').trim();
  const appId = String(c.appId || '').trim();
  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    return false;
  }
  if (!apiKey.startsWith('AIza') || apiKey.length < 30) return false;
  // Reject obvious template / placeholder app ids from docs or old samples
  if (/abc123|your-app|placeholder|example/i.test(appId)) return false;
  return true;
}

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase Web config is missing or invalid. In Firebase Console: Project settings → Your apps → Web app → copy the `firebaseConfig` object into `src/environments/environment.ts` and `environment.prod.ts` (replace the entire `firebase` object).'
    );
  }
  if (cachedApp) return cachedApp;
  const existing = getApps()[0];
  if (existing) {
    cachedApp = existing;
    return cachedApp;
  }
  cachedApp = initializeApp(environment.firebase!);
  return cachedApp;
}

export function getFirebaseAuth(): Auth {
  if (!cachedAuth) {
    cachedAuth = getAuth(getFirebaseApp());
  }
  return cachedAuth;
}

export function getFirestoreDb(): Firestore {
  if (!cachedDb) {
    cachedDb = getFirestore(getFirebaseApp());
  }
  return cachedDb;
}
