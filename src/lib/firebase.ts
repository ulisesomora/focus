import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type Unsubscribe,
  type User,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };

export function observeFirebaseUser(callback: (user: User | null) => void): Unsubscribe {
  if (!auth) {
    callback(null);
    return () => undefined;
  }

  void setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("No se pudo conservar la sesión de Firebase:", error);
  });

  return onAuthStateChanged(auth, (user) => {
    const rejected = Boolean(user?.isAnonymous);

    if (rejected) {
      callback(null);
      void signOut(auth!);
      return;
    }

    callback(user);
  });
}

export async function connectEmailAccount(email: string, password: string): Promise<User | null> {
  if (!auth) return null;

  await setPersistence(auth, browserLocalPersistence);
  const normalizedEmail = email.trim().toLowerCase();
  const result = await signInWithEmailAndPassword(auth, normalizedEmail, password);
  return result.user;
}

export async function disconnectAccount(): Promise<User | null> {
  if (!auth) return null;

  await signOut(auth);
  return null;
}
