/**
 * Firebase: same Web `firebaseConfig` as dev, from Firebase Console (use prod Hosting domain in Authorized domains).
 */
export const environment = {
  production: true,
  /** Temporary public tunnel to local Docker backend. */
  apiBaseUrl: "https://interdorsal-briley-rejectedly.ngrok-free.dev/api",
  firebase: {
    apiKey: "AIzaSyDBar0nz_-nBz_-4FnFNzGnSxyG-p1XgFU",
    authDomain: "estore-pwa-dde6c.firebaseapp.com",
    projectId: "estore-pwa-dde6c",
    storageBucket: "estore-pwa-dde6c.firebasestorage.app",
    messagingSenderId: "284474396595",
    appId: "1:284474396595:web:09e618c063fb7d91d505c6",
    measurementId: "G-4TE9XE8K9B",
  },
};
