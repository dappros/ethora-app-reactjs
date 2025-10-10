import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import {
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  User,
} from 'firebase/auth';
import { useAppStore } from '../../store/useAppStore';

class Firebase {
  firebaseApp: FirebaseApp | null = null;
  firebaseConfig: FirebaseOptions | null = null;
  init() {
    const config = useAppStore.getState().currentApp?.firebaseConfigParsed;

    if (!config) return;

    const firebaseConfig = {
      apiKey: config?.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
      measurementId: config.measurementId,
    };
    this.firebaseConfig = firebaseConfig;
    this.firebaseApp = initializeApp(firebaseConfig);
  }
}
export type IUser = User & { accessToken: string };

// Функция для определения iOS Safari
const isIOSSafari = () => {
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS|OPiOS|mercury/.test(userAgent);
  return isIOS && isSafari;
};

export const getUserCredsFromGoogle = async () => {
  const firebase = new Firebase();
  firebase.init();
  const auth = getAuth(firebase.firebaseApp as FirebaseApp);
  const googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
  googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

  const redirectResult = await getRedirectResult(auth);
  if (redirectResult) {
    const user = redirectResult.user as IUser;
    const idToken = await auth?.currentUser?.getIdToken();
    const credential = GoogleAuthProvider.credentialFromResult(redirectResult);
    return {
      user,
      idToken,
      credential,
    };
  }

  if (isIOSSafari()) {
    await signInWithRedirect(auth, googleProvider);
    throw new Error('Redirect initiated');
  } else {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user as IUser;
    const idToken = await auth?.currentUser?.getIdToken();
    const credential = GoogleAuthProvider.credentialFromResult(res);
    return {
      user,
      idToken,
      credential,
    };
  }
};

export const getUserCredsFromFacebook = async () => {
  const firebase = new Firebase();
  firebase.init();
  const auth = getAuth(firebase.firebaseApp as FirebaseApp);
  const facebookProvider = new FacebookAuthProvider();
  facebookProvider.addScope('email');
  facebookProvider.addScope('public_profile');

  const redirectResult = await getRedirectResult(auth);
  if (redirectResult) {
    const user = redirectResult.user as IUser;
    const idToken = await auth?.currentUser?.getIdToken();
    const credential = FacebookAuthProvider.credentialFromResult(redirectResult);
    return {
      user,
      idToken,
      credential,
    };
  }

  if (isIOSSafari()) {
    await signInWithRedirect(auth, facebookProvider);
    throw new Error('Redirect initiated');
  } else {
    const res = await signInWithPopup(auth, facebookProvider);
    const user = res.user as IUser;
    const idToken = await auth?.currentUser?.getIdToken();
    const credential = FacebookAuthProvider.credentialFromResult(res);
    return {
      user,
      idToken,
      credential,
    };
  }
};
