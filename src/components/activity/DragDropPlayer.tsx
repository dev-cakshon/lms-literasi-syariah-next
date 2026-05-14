'use client';

import {
  type DropResult,
  DragDropContext,
  Draggable,
  Droppable,
} from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';

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
  const prevItemCountsRef = useRef<Record<string, number>>({});

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
        prevItemCountsRef.current = {};
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
  const progressPct = totalItems > 0 ? (assignedCount / totalItems) * 100 : 0;

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
    prevItemCountsRef.current = {};
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
    <div className='mx-auto w-full max-w-5xl p-4 md:p-8 pb-24 space-y-6'>
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className='relative overflow-hidden rounded-2xl px-5 py-5'
        style={{ background: 'linear-gradient(160deg, #174339 0%, #1e5548 100%)' }}
      >
        <div
          aria-hidden
          className='absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none'
          style={{ background: 'rgba(144,210,109,0.08)' }}
        />
        <div
          aria-hidden
          className='absolute -bottom-8 -left-4 w-20 h-20 rounded-full pointer-events-none'
          style={{ background: 'rgba(144,210,109,0.08)' }}
        />

        <div className='relative z-10 flex items-start gap-3'>
          <span className='rounded-xl bg-white/10 p-2 text-2xl leading-none select-none'>
            🎯
          </span>
          <div className='flex-1 min-w-0'>
            <p className='text-xs font-bold uppercase tracking-wide text-white/60 mb-0.5'>
              Drag &amp; Drop
            </p>
            <h1 className='font-bold text-white text-xl leading-snug mb-2'>
              {activity.title}
            </h1>
            <div
              className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold'
              style={{
                background: 'rgba(144,210,109,0.2)',
                border: '1px solid rgba(144,210,109,0.35)',
                color: '#d9edbf',
              }}
            >
              ⚡ Hingga {activity.maxPoints} XP
            </div>
          </div>
        </div>
      </motion.div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className='space-y-6'>
          {/* Pool */}
          <div className='rounded-lg border bg-white p-4 md:p-6'>
            <h2 className='text-sm font-semibold text-slate-700 mb-3'>
              Item Belum Dipetakan
            </h2>
            <Droppable droppableId={poolId} direction='horizontal'>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  data-testid='pool-zone'
                  className={`min-h-16 rounded-lg border-2 border-dashed p-3 flex flex-wrap gap-2 transition-colors duration-150 ${
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
                          data-testid={`pool-item-${itemId}`}
                        >
                          <motion.div
                            initial={{ x: -8 }}
                            animate={
                              dragSnapshot.isDragging
                                ? { scale: 1.05, rotate: 2, x: 0 }
                                : { scale: 1, rotate: 0, x: 0 }
                            }
                            style={{
                              boxShadow: dragSnapshot.isDragging
                                ? '0 8px 24px rgba(0,0,0,0.15)'
                                : undefined,
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className='rounded-md border bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm'
                          >
                            {itemLabelById.get(itemId) ?? itemId}
                          </motion.div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Buckets */}
          <div className='grid gap-4 md:grid-cols-2'>
            {activity.categories.map((category) => {
              const droppableId = `cat:${category}`;
              const items = bucketByCategory[category] ?? [];

              const prevCount = prevItemCountsRef.current[category] ?? 0;
              const countIncreased = items.length > prevCount;
              prevItemCountsRef.current[category] = items.length;

              return (
                <motion.div
                  key={category}
                  animate={countIncreased ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className='rounded-lg border bg-white p-4'
                >
                  <h3 className='text-sm font-semibold text-slate-700 mb-3'>
                    {category}
                  </h3>
                  <Droppable droppableId={droppableId}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        data-testid={`category-zone-${category}`}
                        className={`min-h-24 rounded-lg border-2 border-dashed p-3 space-y-2 transition-colors duration-150 ${
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
                              >
                                <motion.div
                                  animate={
                                    dragSnapshot.isDragging
                                      ? { scale: 1.05, rotate: 2 }
                                      : { scale: 1, rotate: 0 }
                                  }
                                  style={{
                                    boxShadow: dragSnapshot.isDragging
                                      ? '0 8px 24px rgba(0,0,0,0.15)'
                                      : undefined,
                                  }}
                                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                  className='rounded-md border bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm'
                                >
                                  {itemLabelById.get(itemId) ?? itemId}
                                </motion.div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </motion.div>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      {/* Sticky bottom bar */}
      <div
        className='sticky bottom-3 z-10 flex items-center justify-between rounded-xl p-3'
        style={{ background: 'linear-gradient(160deg, #174339, #1e5548)' }}
      >
        <div className='flex items-center gap-2'>
          <div className='h-1.5 rounded-full bg-white/20 w-32 overflow-hidden'>
            <motion.div
              className='h-full rounded-full'
              animate={{ width: `${progressPct}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              style={{ background: 'linear-gradient(90deg, #3a9478, #90d26d)' }}
            />
          </div>
          <span className='text-xs text-white/80 font-medium'>
            {assignedCount}/{totalItems} terpetakan
          </span>
        </div>
        {isAllAnswered && (
          <button
            type='button'
            onClick={onSubmit}
            disabled={submitting}
            className='rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#174339] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
          </button>
        )}
      </div>
    </div>
  );
}
