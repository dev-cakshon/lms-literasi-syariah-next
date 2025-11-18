/**
 * Firebase Data Seeding Script
 * 
 * This script helps you migrate your dummy data to Firebase Firestore.
 * Run this once to populate your Firestore database with initial data.
 * 
 * Usage:
 * 1. Create a .env.local file with your Firebase credentials
 * 2. Run: tsx src/lib/seedFirestore.ts
 */

import { collection, doc, setDoc, writeBatch } from "firebase/firestore";

import { allCoursesData,dummyBrowseCourses, dummyCategories } from "./dummyData";
import { db } from "./firebase";
import { COLLECTIONS } from "./firestore";

const seedCategories = async () => {
    console.log("🌱 Seeding categories...");
    const batch = writeBatch(db);

    dummyCategories.forEach((category) => {
        const categoryRef = doc(collection(db, COLLECTIONS.CATEGORIES), category.id);
        batch.set(categoryRef, {
            name: category.name,
            icon: category.icon,
            createdAt: new Date().toISOString(),
        });
    });

    await batch.commit();
    console.log("✅ Categories seeded successfully");
};

const seedCourses = async () => {
    console.log("🌱 Seeding courses...");
    const batch = writeBatch(db);

    dummyBrowseCourses.forEach((course) => {
        const courseRef = doc(collection(db, COLLECTIONS.COURSES), course._id);
        batch.set(courseRef, {
            title: course.title,
            imageUrl: course.imageUrl,
            price: course.price,
            category: course.category,
            categoryId: dummyCategories.find((c) => c.name === course.category)?.id || "fiqih-muamalah",
            description: "",
            isPublished: true,
            createdAt: new Date().toISOString(),
        });
    });

    await batch.commit();
    console.log("✅ Courses seeded successfully");
};

const seedChapters = async () => {
    console.log("🌱 Seeding chapters...");

    for (const [courseId, courseData] of Object.entries(allCoursesData)) {
        console.log(`  📚 Seeding chapters for course ${courseId}...`);
        const batch = writeBatch(db);

        courseData.chapters.forEach((chapter, index) => {
            const chapterRef = doc(collection(db, COLLECTIONS.CHAPTERS), chapter._id);
            batch.set(chapterRef, {
                courseId: courseData.course._id,
                title: chapter.title,
                description: chapter.description || "",
                videoUrl: chapter.videoUrl || "",
                position: index,
                isPublished: true,
                isFree: chapter.isFree || false,
                attachments: chapter.attachments || [],
                createdAt: new Date().toISOString(),
            });
        });

        await batch.commit();
    }

    console.log("✅ All chapters seeded successfully");
};

const seedAll = async () => {
    try {
        console.log("🚀 Starting Firebase seeding...\n");

        await seedCategories();
        await seedCourses();
        await seedChapters();

        console.log("\n🎉 All data seeded successfully!");
        console.log("\n📋 Summary:");
        console.log(`  - ${dummyCategories.length} categories`);
        console.log(`  - ${dummyBrowseCourses.length} courses`);
        console.log(`  - ${Object.values(allCoursesData).reduce((acc, course) => acc + course.chapters.length, 0)} chapters`);

    } catch (error) {
        console.error("❌ Error seeding data:", error);
        process.exit(1);
    }
};

// Run the seeding
seedAll();
