'use client';

import { FirebaseError } from 'firebase/app';
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { authMe, authRegister, authSync } from '@/lib/api';
import { getAuthInstance } from '@/lib/firebase';

import type { UserProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  idToken: string | null;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapFirebaseSignupErrorToIndonesian(code: string): string {
  switch (code) {
    case 'auth/weak-password':
      return 'Password terlalu lemah. Gunakan minimal 8 karakter.';
    default:
      return 'Pendaftaran gagal. Silakan coba lagi.';
  }
}

function mapSignupErrorToMessage(err: unknown): string {
  const errorMessageLower =
    err instanceof Error ? err.message.toLowerCase() : '';

  if (errorMessageLower.includes('already in use')) {
    return 'Email sudah terdaftar. Silakan gunakan email lain atau masuk (login) ke akun Anda.';
  }

  if (
    errorMessageLower.includes('weak password') ||
    (err instanceof FirebaseError && err.code === 'auth/weak-password')
  ) {
    return 'Password terlalu lemah. Gunakan minimal 8 karakter.';
  }

  if (err instanceof FirebaseError) {
    return mapFirebaseSignupErrorToIndonesian(err.code);
  }

  return 'Pendaftaran gagal. Silakan coba lagi.';
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isSigningUp = useRef(false);

  // Fetch user profile from backend
  const fetchProfile = useCallback(async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken();
      setIdToken(token);
      const profile = await authMe();
      setUserProfile(profile);
    } catch (err) {
      void err;
      setUserProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    const auth = getAuthInstance();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setUserProfile(null);
      setIdToken(null);
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      setIdToken(token);
      const profile = await authMe();
      setUserProfile(profile);
    } catch (err) {
      void err;
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser) {
        if (!isSigningUp.current) {
          await fetchProfile(authUser);
        }
      } else {
        setUserProfile(null);
        setIdToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [fetchProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const auth = getAuthInstance();
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // Sync Firestore role into custom claims before redirect logic reads them.
      await authSync({ email });
      await fetchProfile(cred.user);
    },
    [fetchProfile],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const auth = getAuthInstance();
      isSigningUp.current = true;

      try {
        // Step 1: create account/profile via backend.
        await authRegister({ name, email, password });

        // Step 2: establish client session.
        const cred = await signInWithEmailAndPassword(auth, email, password);

        // Step 3: sync profile + role claims with backend source of truth.
        await authSync({ email, displayName: name });

        // Step 4: force-refresh token to ensure custom role claims are available.
        await cred.user.getIdToken(true);

        // Final step: fetch profile explicitly.
        await fetchProfile(cred.user);
      } catch (err) {
        throw new Error(mapSignupErrorToMessage(err));
      } finally {
        isSigningUp.current = false;
      }
    },
    [fetchProfile],
  );

  const logout = useCallback(async () => {
    const auth = getAuthInstance();
    await firebaseSignOut(auth);
    setUserProfile(null);
    setIdToken(null);
  }, []);

  const isAdmin = userProfile?.role === 'admin';

  const contextValue = useMemo(
    () => ({
      user,
      userProfile,
      loading,
      idToken,
      refreshProfile,
      signIn,
      signUp,
      logout,
      isAdmin,
    }),
    [
      user,
      userProfile,
      loading,
      idToken,
      refreshProfile,
      signIn,
      signUp,
      logout,
      isAdmin,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
