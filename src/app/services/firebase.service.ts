import { Injectable } from '@angular/core';
import {
  getFirebaseAuth,
  getFirestoreDb,
  isFirebaseConfigured,
} from '../config/firebase.config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor() {}

  /** Use before opening social login so you can show a clear message instead of a broken popup. */
  isConfigured(): boolean {
    return isFirebaseConfigured();
  }

  // Authentication methods
  async login(email: string, password: string) {
    const auth = getFirebaseAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  async register(email: string, password: string, userData: any) {
    const auth = getFirebaseAuth();
    const db = getFirestoreDb();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: email,
      ...userData,
      createdAt: new Date(),
    });

    return userCredential.user;
  }

  async logout() {
    if (!isFirebaseConfigured()) return;
    await signOut(getFirebaseAuth());
  }

  async loginWithSocialProvider(provider: 'google' | 'github' | 'facebook') {
    if (!isFirebaseConfigured()) {
      throw new Error(
        'Firebase is not configured. Paste your Web app `firebaseConfig` from Firebase Console into `environment.ts` / `environment.prod.ts`.'
      );
    }
    const auth = getFirebaseAuth();
    const authProvider =
      provider === 'google'
        ? new GoogleAuthProvider()
        : provider === 'github'
          ? new GithubAuthProvider()
          : new FacebookAuthProvider();

    try {
      const credential = await signInWithPopup(auth, authProvider);
      return credential.user;
    } catch (error: any) {
      if (
        error?.code === 'auth/popup-blocked' ||
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request'
      ) {
        await signInWithRedirect(auth, authProvider);
        return null;
      }
      throw error;
    }
  }

  async getRedirectSocialLoginResult() {
    if (!isFirebaseConfigured()) return null;
    const credential = await getRedirectResult(getFirebaseAuth());
    return credential?.user ?? null;
  }

  async getUserProfile(uid: string) {
    const db = getFirestoreDb();
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }
    throw new Error('User profile not found');
  }

  getCurrentUser() {
    if (!isFirebaseConfigured()) return null;
    return getFirebaseAuth().currentUser;
  }

  onAuthStateChanged(callback: (user: any) => void) {
    if (!isFirebaseConfigured()) {
      return () => {};
    }
    return getFirebaseAuth().onAuthStateChanged(callback);
  }
}
