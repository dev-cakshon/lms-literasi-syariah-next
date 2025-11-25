/**
 * Firebase Firestore Connection Test
 * 
 * This script verifies your Firebase connection and checks basic Firestore operations.
 * Run: npx tsx src/lib/testFirestore.ts
 */

/* eslint-disable no-console */

import { collection, getDocs, limit, query } from "firebase/firestore";

// Import db and firestore functions
import { db } from "./firebase";
import { COLLECTIONS, getAllCategories, getAllCourses } from "./firestore";

import type { Course } from "@/types";

const testConnection = async () => {
    console.log("🧪 Testing Firebase Firestore connection...\n");

    try {
        // Test 1: Basic connection
        console.log("1️⃣ Testing basic Firestore connection...");
        console.log("\n📁 Collection Details:");
        console.log("COLLECTIONS.COURSES =", COLLECTIONS.COURSES);
        console.log("Type:", typeof COLLECTIONS.COURSES);

        const testQuery = query(collection(db, COLLECTIONS.COURSES), limit(1));
        const snapshot = await getDocs(testQuery);

        console.log("\n🔌 Connection Status:");
        console.log("Documents found:", snapshot.size);
        console.log("Firestore state:", snapshot.metadata.fromCache ? "OFFLINE ❌" : "ONLINE ✅");
        console.log("Collection path:", COLLECTIONS.COURSES);
        console.log("✅ Successfully connected to Firestore\n");

        // Test 2: Get categories
        console.log("2️⃣ Fetching categories...");
        const categories = await getAllCategories();
        console.log(`✅ Found ${categories.length} categories:`);
        categories.forEach((cat: { id: string; name?: string }) => 
            console.log(`   - ${cat.name || "Unnamed"} (ID: ${cat.id})`)
        );
        console.log();

        // Test 3: Get courses
        console.log("3️⃣ Fetching courses...");
        const courses = await getAllCourses();
        console.log(`✅ Found ${courses.length} courses:`);
        courses.forEach((course: Partial<Course>) => {
            console.log(`   - ${course.title} (${course.totalChapters || 0} chapters)`);
        });
        console.log();

        // Test 4: Firestore rules reminder
        console.log("4️⃣ Firestore Security Rules Reminder...");
        console.log("⚠️  Make sure your Firestore rules allow read/write access");
        console.log("   Example rules for development:");
        console.log("   rules_version = '2';");
        console.log("   service cloud.firestore {");
        console.log("     match /databases/{database}/documents {");
        console.log("       match /{document=**} {");
        console.log("         allow read, write: if true; // For testing only!");
        console.log("       }");
        console.log("     }");
        console.log("   }");
        console.log();

        console.log("🎉 All tests passed! Your Firestore connection is working.\n");
        console.log("📝 Next steps:");
        console.log("   1. Add data manually in Firebase Console");
        console.log("   2. Update BYPASS_AUTH to false in src/contexts/AuthContext.tsx");
        console.log("   3. Test login with Firebase Authentication");
        console.log("   4. Run: npm run dev");

    } catch (error: any) {
        console.error("❌ Error testing Firestore:", error.code || error.message);
        console.log("\n🔍 Troubleshooting:");
        console.log("   - Check firebase.ts has correct hardcoded credentials");
        console.log("   - Verify Firestore is enabled in Firebase Console");
        console.log("   - Check Firestore security rules allow access");
        console.log("   - Ensure Firebase project exists and is active");
        console.log("\n📄 Error details:", error);
        process.exit(1);
    }
};

testConnection();
