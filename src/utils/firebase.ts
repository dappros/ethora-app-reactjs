import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  User,
} from 'firebase/auth';
import { useAppStore } from '../store/useAppStore';

export type IUser = User & { accessToken?: string };

let firebaseApp: FirebaseApp | null = null;

export const initFirebase = (): FirebaseApp | null => {
  if (firebaseApp) return firebaseApp;
  if (getApps().length > 0) {
    firebaseApp = getApp();
    return firebaseApp;
  }

  const config = useAppStore.getState().currentApp?.firebaseConfigParsed;
  if (!config) {
    console.warn('Firebase config not found in currentApp');
    return null;
  }

  firebaseApp = initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
    measurementId: config.measurementId,
  });

  return firebaseApp;
};

export const getUserCredsFromGoogle = async () => {
  const app = initFirebase();
  if (!app) throw new Error('Firebase not initialized');

  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  provider.addScope('https://www.googleapis.com/auth/userinfo.email');
  provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await signInWithPopup(auth, provider);
    return await extractCreds(auth, result, 'google');
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
        console.warn('Popup blocked — opening redirect in new tab');
        const redirectUrl = `${window.location.origin}?authRedirect=true`;
        window.open(redirectUrl, '_blank');
        await signInWithRedirect(auth, provider);
        return;
    }
    console.error('Google login error:', error);
    throw error;
  }
};

export const getUserCredsFromFacebook = async () => {
  const app = initFirebase();
  if (!app) throw new Error('Firebase not initialized');

  const auth = getAuth(app);
  const provider = new FacebookAuthProvider();
  provider.addScope('email');
  provider.addScope('public_profile');

  try {
    const result = await signInWithPopup(auth, provider);
    return await extractCreds(auth, result, 'facebook');
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      console.warn('Popup blocked — fallback to redirect...');
      await signInWithRedirect(auth, provider);
      return;
    }
    console.error('Facebook login error:', error);
    throw error;
  }
};

const extractCreds = async (auth: any, result: any, providerName: string) => {
  const user = result.user as IUser;
  const idToken = await auth.currentUser?.getIdToken();
  let credential;

  if (providerName === 'google') {
    credential = GoogleAuthProvider.credentialFromResult(result);
  } else if (providerName === 'facebook') {
    credential = FacebookAuthProvider.credentialFromResult(result);
  }

  return { user, idToken, credential };
};
