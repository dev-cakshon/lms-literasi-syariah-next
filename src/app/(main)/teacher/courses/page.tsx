'use client';

import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getInstructorCourses } from '@/lib/firestore';
import type { Course } from '@/types';

export default function TeacherCoursesPage() {
    const { isInstructor, loading, user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    useEffect(() => {
        if (!loading && !isInstructor) {
            redirect('/dashboard');
        }
    }, [isInstructor, loading]);

    useEffect(() => {
        async function fetchCourses() {
            if (user) {
                try {
                    const instructorCourses = await getInstructorCourses(user.uid);
                    setCourses(instructorCourses as Course[]);
                } catch (error) {
                    console.error('Error fetching courses:', error);
                } finally {
                    setLoadingCourses(false);
                }
            }
        }
        
        if (user && isInstructor) {
            fetchCourses();
        }
    }, [user, isInstructor]);

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Kursus Saya</h1>
                    <p className="text-gray-600 mt-1">
                        Kelola semua kursus yang Anda buat
                    </p>
                </div>
                <Link href="/teacher/courses/create">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Buat Kursus Baru
                    </Button>
                </Link>
            </div>

            {loadingCourses ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Memuat kursus...</p>
                </div>
            ) : courses.length === 0 ? (
                <div className="bg-white rounded-lg border p-12 text-center">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Belum ada kursus
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Mulai dengan membuat kursus pertama Anda
                    </p>
                    <Link href="/teacher/courses/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Buat Kursus Baru
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Link
                            key={course.id}
                            href={`/teacher/courses/${course.id}`}
                            className="group"
                        >
                            <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                                        {course.title}
                                    </h3>
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full ${
                                            course.isPublished
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}
                                    >
                                        {course.isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                {course.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                        {course.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>
                                        {course.price ? `Rp ${course.price.toLocaleString()}` : 'Gratis'}
                                    </span>
                                    <span className="text-xs">
                                        {new Date(course.createdAt).toLocaleDateString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
