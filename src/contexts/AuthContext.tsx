"use client";

import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    User} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

import { auth } from "@/lib/firebase";

// Add this flag at the top
const BYPASS_AUTH = true; // Set to false to enable real auth

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (BYPASS_AUTH) {
            // Mock user for development
            setUser({
                uid: "user-123",
                email: "dev@example.com",
                displayName: "Developer User",
            } as User);
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        if (BYPASS_AUTH) return;
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email: string, password: string) => {
        if (BYPASS_AUTH) return;
        await createUserWithEmailAndPassword(auth, email, password);
    };

    const signInWithGoogle = async () => {
        if (BYPASS_AUTH) return;
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const logout = async () => {
        if (BYPASS_AUTH) return;
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, logout }}>
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
