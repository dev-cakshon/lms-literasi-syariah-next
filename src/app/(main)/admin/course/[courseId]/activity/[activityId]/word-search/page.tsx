'use client';

import { useParams } from 'next/navigation';
import { Suspense, useContext, useEffect, useState } from 'react';

import { getActivityAdmin } from '@/lib/api';

import { ActivityEditForm } from '@/components/course/admin/ActivityEditForm';
import { Badge } from '@/components/ui/badge';

import { AdminCourseLayoutContext } from '../../../AdminCourseLayoutContext';

import type { AdminActivity } from '@/types';

function WordSearchActivityContent() {
  const params = useParams<{ courseId: string; activityId: string }>();
  const { refreshContentItems } = useContext(AdminCourseLayoutContext);

  const courseId = params.courseId;
  const activityId = params.activityId;

  const [activity, setActivity] = useState<AdminActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = await getActivityAdmin(courseId, activityId);
        if (mounted) setActivity(data);
      } catch {
        if (mounted) setActivity(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [courseId, activityId]);

  if (loading) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <p className='text-muted-foreground'>Memuat aktivitas...</p>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-red-500'>Aktivitas tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto p-6 space-y-6'>
      <div className='space-y-1'>
        <h1 className='text-2xl font-bold'>{activity.title}</h1>
        <Badge>Word Search</Badge>
      </div>
      <ActivityEditForm
        courseId={courseId}
        activity={activity}
        onActivitySaved={(updated) => {
          setActivity(updated);
          refreshContentItems();
        }}
      />
    </div>
  );
}

export default function AdminWordSearchActivityPage() {
  return (
    <Suspense>
      <WordSearchActivityContent />
    </Suspense>
  );
}
