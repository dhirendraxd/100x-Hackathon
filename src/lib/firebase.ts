import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics, isSupported as analyticsSupported, type Analytics } from 'firebase/analytics';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

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

// Environment helpers
const isBrowser = typeof window !== 'undefined';
const hostname = isBrowser ? window.location.hostname : '';
const isLocalHost = /^(localhost|127\.0\.0\.1)$/.test(hostname);

// Determine if we have a valid config
const hasConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

// Allow either "true"/"1" to enable emulators via env
const emulatorFlag = String(import.meta.env.VITE_USE_FIREBASE_EMULATORS || '').toLowerCase();
// Hardened: only use emulators when explicitly enabled. Do NOT auto-enable when config is missing.
const useEmulators = emulatorFlag === 'true' || emulatorFlag === '1';

// When missing config (e.g., fresh clone), use a demo config so the UI still renders locally
const demoConfig: FirebaseOptions = {
  apiKey: 'demo',
  authDomain: 'localhost',
  projectId: 'demo-project',
  appId: 'demo',
  messagingSenderId: 'demo',
};

// Fail-fast in production if config is missing to avoid 127.0.0.1 auth redirects in prod
if (!hasConfig && !isLocalHost) {
  console.error(
    '🚨 Firebase config missing in production. Set VITE_FIREBASE_* env vars in Vercel and add your domain to Firebase Auth Authorized domains.'
  );
  // Don't throw - let the app render with a fallback so we can show a friendly error
}

const app = initializeApp(hasConfig ? firebaseConfig : demoConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
// Resolve Functions region from env, ensure it's a string
const envRegion = (import.meta as unknown as { env?: Record<string, unknown> }).env?.VITE_FIREBASE_FUNCTIONS_REGION;
const functionsRegion = typeof envRegion === 'string' && envRegion.length > 0 ? envRegion : 'us-central1';
export const functions = getFunctions(app, functionsRegion);
export const storage = getStorage(app);

// Enable Firestore offline persistence (best-effort; ignore if not available)
if (isBrowser) {
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
    const fnPort = Number(import.meta.env.VITE_FUNCTIONS_EMULATOR_PORT || 5001);
    connectFunctionsEmulator(functions, '127.0.0.1', fnPort);
  } catch (e) {
    // Emulator connection failed or already connected; safe to ignore in production build
  }
  try {
    const stPort = Number(import.meta.env.VITE_STORAGE_EMULATOR_PORT || 9199);
    connectStorageEmulator(storage, '127.0.0.1', stPort);
  } catch (e) {
    // Ignore storage emulator errors
  }
}

// Initialize Analytics (only in browser)
let analytics: Analytics | null = null;
if (isBrowser && !useEmulators) {
  analyticsSupported().then((ok) => {
    if (ok) analytics = getAnalytics(app);
  });
}
export { analytics };

// Non-sensitive startup diagnostics
try {
  const proj = hasConfig ? firebaseConfig.projectId : 'demo-project';
  const domain = hasConfig ? firebaseConfig.authDomain : 'localhost';
  console.info('[Firebase]', {
    projectId: proj,
    authDomain: domain,
    usingEmulators: useEmulators,
    isLocalHost,
  });
} catch (e) {
  // ignore diagnostics failures
}

export default app;
