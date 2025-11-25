import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBKspYZIvwL4JP1sHZ1APZ1rkxw6Qhp06Q",
    authDomain: "literasi-ekonomi-syariah.firebaseapp.com",
    projectId: "literasi-ekonomi-syariah",
    storageBucket: "literasi-ekonomi-syariah.firebasestorage.app",
    messagingSenderId: "928672993029",
    appId: "1:928672993029:web:365d32b1452c0f7006f16c",
    measurementId: "G-6Q0J27XPX3"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const storage = getStorage(app);

// Auth is lazily initialized - only call getAuthInstance() when you need it
let _auth: ReturnType<typeof getAuth> | null = null;
export const getAuthInstance = () => {
    if (!_auth) {
        _auth = getAuth(app);
    }
    return _auth;
};

// For React components that need auth, use getAuthInstance()
// Example: const auth = getAuthInstance();
export { getAuthInstance as auth };

export default app;
