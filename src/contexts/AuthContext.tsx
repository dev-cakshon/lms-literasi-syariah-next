"use client";

import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    User
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

import { getAuthInstance } from "@/lib/firebase";

import type { UserProfile } from "@/types";

// Add this flag at the top, set to false to enable real auth
// const BYPASS_AUTH = true;
const BYPASS_AUTH = false;

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("🔐 AuthContext: BYPASS_AUTH =", BYPASS_AUTH);

        if (BYPASS_AUTH) {
            // Mock user for development
            const mockUser = {
                uid: "user-123",
                email: "dev@example.com",
                displayName: "Developer User",
            } as User;

            const mockProfile: UserProfile = {
                uid: "user-123",
                email: "dev@example.com",
                displayName: "Developer User",
                role: "student",
                totalPoints: 100,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            console.log("✅ Setting mock user:", mockUser.email);
            setUser(mockUser);
            setUserProfile(mockProfile);
            setLoading(false);
            return;
        }

        console.log("🔒 Real auth enabled, checking Firebase auth state...");
        const auth = getAuthInstance();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log("🔄 Auth state changed:", user ? user.email : "No user");
            setUser(user);
            // TODO: Fetch user profile from Firestore
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        if (BYPASS_AUTH) {
            console.log("⚠️  BYPASS_AUTH enabled, skipping sign in");
            return;
        }
        const auth = getAuthInstance();
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email: string, password: string) => {
        if (BYPASS_AUTH) {
            console.log("⚠️  BYPASS_AUTH enabled, skipping sign up");
            return;
        }
        const auth = getAuthInstance();
        await createUserWithEmailAndPassword(auth, email, password);
    };

    const signInWithGoogle = async () => {
        if (BYPASS_AUTH) {
            console.log("⚠️  BYPASS_AUTH enabled, skipping Google sign in");
            return;
        }
        const auth = getAuthInstance();
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const logout = async () => {
        if (BYPASS_AUTH) {
            console.log("⚠️  BYPASS_AUTH enabled, skipping logout");
            return;
        }
        const auth = getAuthInstance();
        await firebaseSignOut(auth);
    };

    const isAdmin = userProfile?.role === "admin";

    console.log("🔐 AuthContext state:", { user: user?.email, loading, BYPASS_AUTH });

    return (
        <AuthContext.Provider value={{
            user,
            userProfile,
            loading,
            signIn,
            signUp,
            signInWithGoogle,
            logout,
            isAdmin
        }}>
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
