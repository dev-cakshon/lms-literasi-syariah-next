'use client';

import {
  type DropResult,
  DragDropContext,
  Draggable,
  Droppable,
} from '@hello-pangea/dnd';
import { useContext, useEffect, useMemo, useState } from 'react';

import { getStudentActivity, submitActivity } from '@/lib/api';

import { ActivityResultScreen } from '@/components/activity/ActivityResultScreen';

import { CourseLayoutContext } from '@/app/(main)/(student)/(course)/course/[courseId]/CourseLayoutContext';

import type {
  StudentActivity,
  StudentDragDropActivity,
  SubmitActivityResponse,
} from '@/types';

type Params = Promise<{ courseId: string; activityId: string }>;

interface DragDropPlayerProps {
  params: Params;
}

const poolId = 'pool';

function cloneBuckets(
  source: Record<string, string[]>
): Record<string, string[]> {
  const next: Record<string, string[]> = {};
  for (const [category, itemIds] of Object.entries(source)) {
    next[category] = [...itemIds];
  }
  return next;
}

export function DragDropPlayer({ params }: DragDropPlayerProps) {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [activity, setActivity] = useState<StudentDragDropActivity | null>(
    null
  );
  const [unassignedItemIds, setUnassignedItemIds] = useState<string[]>([]);
  const [bucketByCategory, setBucketByCategory] = useState<
    Record<string, string[]>
  >({});
  const [result, setResult] = useState<SubmitActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshContentItems } = useContext(CourseLayoutContext);

  useEffect(() => {
    params.then((p) => {
      setCourseId(p.courseId);
      setActivityId(p.activityId);
    });
  }, [params]);

  useEffect(() => {
    if (!courseId || !activityId) return;
    const resolvedCourseId = courseId;
    const resolvedActivityId = activityId;

    async function fetchActivity() {
      setLoading(true);
      setError(null);

      try {
        const data = (await getStudentActivity(
          resolvedCourseId,
          resolvedActivityId
        )) as StudentActivity;

        if (data.type !== 'drag_drop') {
          setError('Aktivitas tidak sesuai dengan halaman ini.');
          setActivity(null);
          return;
        }

        const typedActivity = data as StudentDragDropActivity;
        setActivity(typedActivity);
        setUnassignedItemIds(typedActivity.items.map((item) => item.id));

        const initialBuckets = typedActivity.categories.reduce<
          Record<string, string[]>
        >((acc, category) => {
          acc[category] = [];
          return acc;
        }, {});
        setBucketByCategory(initialBuckets);
      } catch (err) {
        console.error('Failed to load drag-drop activity:', err);
        setError('Gagal memuat aktivitas.');
        setActivity(null);
      } finally {
        setLoading(false);
      }
    }

    void fetchActivity();
  }, [courseId, activityId]);

  const itemLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of activity?.items ?? []) {
      map.set(item.id, item.label);
    }
    return map;
  }, [activity]);

  const answers = useMemo(() => {
    const mapping: Record<string, string> = {};
    for (const [category, itemIds] of Object.entries(bucketByCategory)) {
      for (const itemId of itemIds) {
        mapping[itemId] = category;
      }
    }
    return mapping;
  }, [bucketByCategory]);

  const isAllAnswered = useMemo(() => {
    if (!activity) return false;
    return unassignedItemIds.length === 0;
  }, [activity, unassignedItemIds]);

  const totalItems = activity?.items.length ?? 0;
  const assignedCount = totalItems - unassignedItemIds.length;

  const onDragEnd = (dropResult: DropResult) => {
    const { source, destination } = dropResult;
    if (!destination) return;

    const sourceId = source.droppableId;
    const destinationId = destination.droppableId;
    if (sourceId === destinationId && source.index === destination.index) {
      return;
    }

    const nextPool = [...unassignedItemIds];
    const nextBuckets = cloneBuckets(bucketByCategory);

    const getList = (droppableId: string): string[] => {
      if (droppableId === poolId) return nextPool;
      const category = droppableId.replace('cat:', '');
      return nextBuckets[category] ?? [];
    };

    const sourceList = getList(sourceId);
    const [moved] = sourceList.splice(source.index, 1);
    if (!moved) return;

    const destinationList = getList(destinationId);
    destinationList.splice(destination.index, 0, moved);

    setUnassignedItemIds(nextPool);
    setBucketByCategory(nextBuckets);
  };

  const onSubmit = async () => {
    if (!courseId || !activityId || !activity) return;
    setSubmitting(true);
    setError(null);
    try {
      const submitResult = await submitActivity(courseId, activityId, {
        answers,
      });
      setResult(submitResult);
      refreshContentItems();
    } catch (err) {
      console.error('Failed to submit drag-drop activity:', err);
      setError('Gagal mengirim jawaban.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetRound = () => {
    if (!activity) return;
    setResult(null);
    setUnassignedItemIds(activity.items.map((item) => item.id));
    setBucketByCategory(
      activity.categories.reduce<Record<string, string[]>>((acc, category) => {
        acc[category] = [];
        return acc;
      }, {})
    );
  };

  if (loading) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-muted-foreground'>Memuat aktivitas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-red-500'>{error}</p>
      </div>
    );
  }

  if (!courseId || !activityId || !activity) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-muted-foreground'>Aktivitas tidak ditemukan.</p>
      </div>
    );
  }

  if (result) {
    return (
      <ActivityResultScreen
        result={result}
        courseId={courseId}
        onRetry={resetRound}
      />
    );
  }

  return (
    <div className='mx-auto w-full max-w-5xl p-4 md:p-8 space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold text-slate-900'>
          {activity.title}
        </h1>
        <p className='text-sm text-slate-600 mt-1'>
          Seret setiap item ke kategori yang benar.
        </p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className='space-y-6'>
          <div className='rounded-lg border bg-white p-4 md:p-6'>
            <h2 className='text-sm font-semibold text-slate-700 mb-3'>
              Item Belum Dipetakan
            </h2>
            <Droppable droppableId={poolId} direction='horizontal'>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-16 rounded-lg border-2 border-dashed p-3 flex flex-wrap gap-2 transition-colors ${
                    snapshot.isDraggingOver
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  {unassignedItemIds.map((itemId, index) => (
                    <Draggable key={itemId} draggableId={itemId} index={index}>
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          className={`rounded-md border bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm ${
                            dragSnapshot.isDragging
                              ? 'ring-2 ring-primary-300'
                              : ''
                          }`}
                        >
                          {itemLabelById.get(itemId) ?? itemId}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            {activity.categories.map((category) => {
              const droppableId = `cat:${category}`;
              const items = bucketByCategory[category] ?? [];

              return (
                <div key={category} className='rounded-lg border bg-white p-4'>
                  <h3 className='text-sm font-semibold text-slate-700 mb-3'>
                    {category}
                  </h3>
                  <Droppable droppableId={droppableId}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-24 rounded-lg border-2 border-dashed p-3 space-y-2 transition-colors ${
                          snapshot.isDraggingOver
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        {items.map((itemId, index) => (
                          <Draggable
                            key={itemId}
                            draggableId={itemId}
                            index={index}
                          >
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                className={`rounded-md border bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm ${
                                  dragSnapshot.isDragging
                                    ? 'ring-2 ring-primary-300'
                                    : ''
                                }`}
                              >
                                {itemLabelById.get(itemId) ?? itemId}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      <div className='sticky bottom-3 z-10'>
        <div className='rounded-xl border border-primary-300 bg-primary-600 p-3 shadow-md flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-xs text-primary-50'>
            Terpetakan: {assignedCount}/{totalItems}
            {!isAllAnswered && ' - seret semua item terlebih dahulu'}
          </p>
          <button
            type='button'
            onClick={onSubmit}
            disabled={submitting || !isAllAnswered}
            className='rounded-md bg-white px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white'
          >
            {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
          </button>
        </div>
      </div>
    </div>
  );
}
