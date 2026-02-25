"use client";

import {
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { authMe, authRegister, setTokenAccessor } from "@/lib/api";
import { getAuthInstance } from "@/lib/firebase";

import type { UserProfile } from "@/types";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  idToken: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Wire up the token accessor for the API client
  useEffect(() => {
    setTokenAccessor(async () => {
      const auth = getAuthInstance();
      const currentUser = auth.currentUser;
      if (!currentUser) return null;
      return currentUser.getIdToken();
    });
  }, []);

  // Fetch user profile from backend
  const fetchProfile = useCallback(async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken();
      setIdToken(token);
      const profile = await authMe();
      setUserProfile(profile);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser) {
        await fetchProfile(authUser);
      } else {
        setUserProfile(null);
        setIdToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const auth = getAuthInstance();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await fetchProfile(cred.user);
  };

  const signUp = async (name: string, email: string, password: string) => {
    // 1. Register on backend (creates Auth user + Firestore profile)
    await authRegister({ name, email, password });
    // 2. Sign in with Firebase client SDK to get the session
    const auth = getAuthInstance();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await fetchProfile(cred.user);
  };

  const logout = async () => {
    const auth = getAuthInstance();
    await firebaseSignOut(auth);
    setUserProfile(null);
    setIdToken(null);
  };

  const isAdmin = userProfile?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        idToken,
        signIn,
        signUp,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
