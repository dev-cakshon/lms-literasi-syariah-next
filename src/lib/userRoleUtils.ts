/**
 * Utility script to set user roles in Firestore
 * 
 * Usage:
 * 1. Import this in your component or console
 * 2. Call setUserRole(userId, 'instructor') to make someone an instructor
 * 3. Call setUserRole(userId, 'student') to make someone a student
 */

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import { db } from './firebase';
import { COLLECTIONS } from './firestore';

import type { UserProfile } from '@/types';

/**
 * Set or update a user's role
 */
export async function setUserRole(
    userId: string,
    role: 'student' | 'instructor' | 'admin'
): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        // Update existing user
        await updateDoc(userRef, {
            role,
            updatedAt: new Date().toISOString(),
        });
        console.log(`✅ User ${userId} role updated to: ${role}`);
    } else {
        // Create new user profile
        const newProfile: Omit<UserProfile, 'uid'> = {
            email: 'unknown@example.com', // Should be updated
            displayName: 'Unknown User',
            role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await setDoc(userRef, newProfile);
        console.log(`✅ User ${userId} created with role: ${role}`);
    }
}

/**
 * Get a user's current role
 */
export async function getUserRole(userId: string): Promise<string | null> {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        return data.role;
    }

    return null;
}

/**
 * List all instructors
 */
export async function listInstructors(): Promise<UserProfile[]> {
    const { queryCollection } = await import('./firestore');
    const { where } = await import('firebase/firestore');
    
    return queryCollection<UserProfile>(
        COLLECTIONS.USERS,
        where('role', '==', 'instructor')
    );
}

/**
 * Promote user to instructor
 */
export async function makeInstructor(userId: string): Promise<void> {
    await setUserRole(userId, 'instructor');
}

/**
 * Demote user to student
 */
export async function makeStudent(userId: string): Promise<void> {
    await setUserRole(userId, 'student');
}

// For use in browser console during development
if (typeof window !== 'undefined') {
    (window as any).setUserRole = setUserRole;
    (window as any).getUserRole = getUserRole;
    (window as any).makeInstructor = makeInstructor;
    (window as any).makeStudent = makeStudent;
    
    console.log('🔧 User role utilities loaded!');
    console.log('Available commands:');
    console.log('  - setUserRole(userId, "instructor" | "student" | "admin")');
    console.log('  - getUserRole(userId)');
    console.log('  - makeInstructor(userId)');
    console.log('  - makeStudent(userId)');
}
