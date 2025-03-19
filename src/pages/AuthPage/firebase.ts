import { FirebaseApp, FirebaseOptions, initializeApp } from '@firebase/app';
import  firebbaseAuth from 'firebase/auth';
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
export type IUser = firebbaseAuth. & { accessToken: string };

export const getUserCredsFromGoogle = async () => {
  const firebase = new Firebase();
  firebase.init();
  const auth = getAuth(firebase.firebaseApp as FirebaseApp);
  const googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
  googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

  const res = await signInWithPopup(auth, googleProvider);
  const user = res.user as IUser;
  const idToken = await auth?.currentUser?.getIdToken();
  const credential = GoogleAuthProvider.credentialFromResult(res);
  return {
    user,
    idToken,
    credential,
  };
};
