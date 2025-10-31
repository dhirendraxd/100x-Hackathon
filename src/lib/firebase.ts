import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics, isSupported as analyticsSupported, type Analytics } from 'firebase/analytics';

// Firebase configuration (with safe fallbacks for local/dev)
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Determine if we have a valid config
const hasConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

// Allow either "true"/"1" to enable emulators via env
const emulatorFlag = String(import.meta.env.VITE_USE_FIREBASE_EMULATORS || '').toLowerCase();
const useEmulators = emulatorFlag === 'true' || emulatorFlag === '1' || !hasConfig;

// When missing config (e.g., fresh clone), use a demo config so the UI still renders locally
const demoConfig: FirebaseOptions = {
  apiKey: 'demo',
  authDomain: 'localhost',
  projectId: 'demo-project',
  appId: 'demo',
  messagingSenderId: 'demo',
};

const app = initializeApp(hasConfig ? firebaseConfig : demoConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Enable Firestore offline persistence (best-effort; ignore if not available)
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch(() => {
    // Multi-tab or private mode may fail; app still works without persistence
  });
}

// Connect to emulators locally when enabled
if (useEmulators) {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  } catch (e) {
    // Emulator connection failed or already connected; safe to ignore in production build
  }
  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8082);
  } catch (e) {
    // Emulator connection failed or already connected; safe to ignore in production build
  }
  try {
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  } catch (e) {
    // Emulator connection failed or already connected; safe to ignore in production build
  }
}

// Initialize Analytics (only in browser)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined' && !useEmulators) {
  analyticsSupported().then((ok) => {
    if (ok) analytics = getAnalytics(app);
  });
}
export { analytics };

export default app;
