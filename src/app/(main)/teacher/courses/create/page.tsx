'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createCourse } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateCoursePage() {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user, isInstructor } = useAuth();
    const router = useRouter();

    if (!isInstructor) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-600">Access denied. Instructors only.</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setLoading(true);
        setError('');
        
        try {
            const newCourse = await createCourse(user.uid, title);
            console.log('Course created:', newCourse);
            
            // Redirect to course edit page
            router.push(`/teacher/courses/${newCourse.id}`);
        } catch (err) {
            console.error('Error creating course:', err);
            setError('Failed to create course. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-2xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Buat Kursus Baru</CardTitle>
                    <CardDescription>
                        Mulai dengan memberikan judul kursus Anda. Anda dapat menambahkan detail lainnya nanti.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium mb-2">
                                Judul Kursus *
                            </label>
                            <Input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="contoh: Dasar-Dasar Fiqih Muamalah"
                                required
                                minLength={3}
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                disabled={loading || title.length < 3}
                            >
                                {loading ? 'Membuat...' : 'Buat Kursus'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={loading}
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">💡 Tips:</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Pilih judul yang jelas dan deskriptif</li>
                    <li>Anda dapat mengubah detail kursus setelah dibuat</li>
                    <li>Kursus akan tersimpan sebagai draft sampai Anda mempublikasikannya</li>
                </ul>
            </div>
        </div>
    );
}
