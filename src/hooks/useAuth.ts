import { useState, useEffect } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { user: result.user, error: null };
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : 'Sign in failed' };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return { user: result.user, error: null };
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : 'Sign up failed' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      console.log('[Google Sign-in] Attempting popup...');
      // Try popup first
      const result = await signInWithPopup(auth, provider);
      console.log('[Google Sign-in] Popup succeeded:', result.user.email);
      return { user: result.user, error: null };
    } catch (e) {
      const err = e as FirebaseError | Error & { code?: string };
      const code = (err && 'code' in err && err.code) ? err.code : '';
      console.log('[Google Sign-in] Error code:', code, 'Message:', err instanceof Error ? err.message : String(err));

      // User cancelled the popup
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return { user: null, error: null }; // Silent failure, user cancelled intentionally
      }

      // Common cases: popup blocked or environment doesn't support popups
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        console.log('[Google Sign-in] Popup blocked, trying redirect...');
        try {
          await signInWithRedirect(auth, new GoogleAuthProvider());
          // After redirect back, Firebase will sign the user in and onAuthStateChanged fires
          return { user: null, error: null };
        } catch (re) {
          const reMsg = re instanceof Error ? re.message : 'Google redirect sign-in failed';
          console.error('[Google Sign-in] Redirect failed:', reMsg);
          return { user: null, error: reMsg };
        }
      }

      // Unauthorized domain or provider disabled
      if (code === 'auth/unauthorized-domain') {
        return { user: null, error: 'Unauthorized domain. Open the app on http://localhost:8080 or add your dev domain in Firebase Auth > Settings > Authorized domains.' };
      }
      if (code === 'auth/operation-not-allowed') {
        return { user: null, error: 'Google provider is disabled. Enable Google sign-in in Firebase Console > Authentication > Sign-in method.' };
      }

      // Generic error
      return { user: null, error: err instanceof Error ? err.message : 'Google sign in failed' };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Sign out failed' };
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };
};
