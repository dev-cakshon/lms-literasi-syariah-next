import { type FirebaseApp,getApp, getApps, initializeApp } from 'firebase/app';
import { type Auth,getAuth } from 'firebase/auth';
import { type Firestore,getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp(): FirebaseApp {
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

export function getAuthInstance(): Auth {
  return getAuth(getFirebaseApp());
}

export function getFirestoreInstance(): Firestore {
  return getFirestore(getFirebaseApp());
}
