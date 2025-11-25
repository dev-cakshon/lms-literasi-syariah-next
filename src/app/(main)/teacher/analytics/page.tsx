'use client';

import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function TeacherAnalyticsPage() {
    const { isInstructor, loading } = useAuth();

    useEffect(() => {
        if (!loading && !isInstructor) {
            redirect('/dashboard');
        }
    }, [isInstructor, loading]);

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Analitik</h1>
            <p className="text-gray-600 mb-4">
                Lihat performa kursus dan statistik pembelajaran
            </p>
            
            <div className="bg-white rounded-lg border p-6">
                <p className="text-center text-gray-500">
                    Halaman dalam pengembangan. Fitur analitik akan segera hadir.
                </p>
            </div>
        </div>
    );
}
