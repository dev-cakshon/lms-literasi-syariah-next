'use client';

import {
  type DropResult,
  DragDropContext,
  Draggable,
  Droppable,
} from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { ArrowRight, GripVertical, Zap } from 'lucide-react';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { getStudentActivity, submitActivity } from '@/lib/api';
import { getNeighborPaths } from '@/lib/courseUtils';

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
  source: Record<string, string[]>,
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
    null,
  );
  const [unassignedItemIds, setUnassignedItemIds] = useState<string[]>([]);
  const [bucketByCategory, setBucketByCategory] = useState<
    Record<string, string[]>
  >({});
  const [result, setResult] = useState<SubmitActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshContentItems, contentItems, setChatFabHidden } =
    useContext(CourseLayoutContext);
  const prevItemCountsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    setChatFabHidden(true);
    return () => setChatFabHidden(false);
  }, [setChatFabHidden]);

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
          resolvedActivityId,
        )) as StudentActivity;

        if (data.type !== 'drag_drop') {
          setError('Aktivitas tidak sesuai dengan halaman ini.');
          setActivity(null);
          return;
        }

        const typedActivity = data as StudentDragDropActivity;
        const normalizedItems = typedActivity.items.map((item, index) => ({
          ...item,
          id: item.id || `__item_${index}`,
        }));
        const normalizedActivity = { ...typedActivity, items: normalizedItems };
        setActivity(normalizedActivity);
        setUnassignedItemIds(normalizedItems.map((item) => item.id));

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
      }, {}),
    );
    prevItemCountsRef.current = {};
  };

  if (loading) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-on-surface-variant'>Memuat aktivitas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-error'>{error}</p>
      </div>
    );
  }

  if (!courseId || !activityId || !activity) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-on-surface-variant'>Aktivitas tidak ditemukan.</p>
      </div>
    );
  }

  if (result) {
    const nextPath = getNeighborPaths(contentItems, activityId, courseId).next;
    return (
      <ActivityResultScreen
        result={result}
        courseId={courseId}
        nextPath={nextPath}
        onRetry={resetRound}
      />
    );
  }

  return (
    <div className='mx-auto w-full max-w-4xl p-4 md:p-8 pb-8 space-y-6'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className='space-y-3'
      >
        <div className='flex items-center justify-between gap-4'>
          <p className='text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant'>
            AKTIVITAS · DRAG &amp; DROP · <span>{activity.title}</span>
          </p>
          <div className='shrink-0 bg-amber-50 text-amber-700 text-xs font-bold tracking-[0.05em] px-3 py-1 rounded-full inline-flex items-center gap-1 border border-amber-300'>
            <Zap className='w-3 h-3' />
            Hingga {activity.maxPoints} XP
          </div>
        </div>
        <h1 className='font-display text-on-surface text-2xl md:text-[32px] font-semibold leading-tight'>
          🎯 Tarik setiap kartu ke kategori yang tepat.
        </h1>
      </motion.div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className='space-y-6'>
          {/* Buckets — hero area */}
          <div className='grid gap-6 md:grid-cols-2'>
            {activity.categories.map((category) => {
              const droppableId = `cat:${category}`;
              const items = bucketByCategory[category] ?? [];

              const prevCount = prevItemCountsRef.current[category] ?? 0;
              const countIncreased = items.length > prevCount;
              prevItemCountsRef.current[category] = items.length;

              return (
                <Droppable key={category} droppableId={droppableId}>
                  {(provided, snapshot) => {
                    const isDragOver = snapshot.isDraggingOver;
                    return (
                      <motion.div
                        animate={
                          countIncreased
                            ? { scale: [1, 1.03, 1] }
                            : { scale: 1 }
                        }
                        transition={{ duration: 0.3 }}
                        className={`bg-surface-container-lowest rounded-2xl p-6 border-2 transition-transform ${
                          isDragOver
                            ? 'border-primary-500 -translate-y-1'
                            : 'border-surface-variant'
                        }`}
                        style={{ boxShadow: '0 4px 20px rgba(5,95,77,0.05)' }}
                      >
                        <h3 className='font-display text-xl font-semibold text-primary-700 text-center mb-4'>
                          {category}
                        </h3>
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          data-testid={`category-zone-${category}`}
                          className={`min-h-[200px] rounded-xl border-2 p-4 flex flex-col gap-3 transition-colors duration-150 ${
                            isDragOver
                              ? 'border-primary-500 bg-primary-fixed/30'
                              : isAllAnswered
                                ? 'border-primary-fixed bg-primary-container/5'
                                : 'border-dashed border-outline-variant bg-surface-container-low'
                          }`}
                        >
                          {items.length === 0 && !isDragOver && (
                            <div className='flex-1 flex items-center justify-center'>
                              <p className='text-sm text-on-surface-variant'>
                                Lepaskan kartu di sini
                              </p>
                            </div>
                          )}
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
                                        : '0 1px 4px rgba(5,95,77,0.08)',
                                    }}
                                    transition={{
                                      type: 'spring',
                                      stiffness: 300,
                                      damping: 20,
                                    }}
                                    className='bg-surface-container-lowest border border-surface-variant rounded-lg px-4 py-3 flex items-center justify-center text-sm font-medium text-on-surface'
                                  >
                                    {itemLabelById.get(itemId) ?? itemId}
                                  </motion.div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </motion.div>
                    );
                  }}
                </Droppable>
              );
            })}
          </div>

          {/* Pool tray — card under the buckets */}
          <div
            className='bg-surface-container-lowest rounded-2xl border-2 border-surface-variant p-6'
            style={{ boxShadow: '0 4px 20px rgba(5,95,77,0.05)' }}
          >
            <div className='flex items-center gap-4 mb-4'>
              <span className='shrink-0 text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant'>
                PILIH KARTU ({unassignedItemIds.length}/{totalItems})
              </span>
              <div className='flex-1 bg-surface-variant h-2 rounded-full overflow-hidden'>
                <motion.div
                  className='h-full rounded-full bg-secondary-container'
                  animate={{ width: `${progressPct}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
              {isAllAnswered && (
                <button
                  type='button'
                  onClick={onSubmit}
                  disabled={submitting}
                  className='shrink-0 bg-action-green text-white text-xs font-bold tracking-[0.05em] rounded-xl px-8 py-4 inline-flex items-center gap-2 squishy-shadow [--tw-shadow-color:#1d5200] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-transform disabled:opacity-70 disabled:cursor-not-allowed'
                >
                  {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
                  <ArrowRight className='w-4 h-4' />
                </button>
              )}
            </div>
            {isAllAnswered && (
              <p className='text-sm text-primary-700 mb-4'>
                ✨ Semua kartu sudah dipilih!
              </p>
            )}
            <Droppable droppableId={poolId} direction='horizontal'>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  data-testid='pool-zone'
                  className='flex flex-wrap gap-4 min-h-[48px]'
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
                            animate={
                              dragSnapshot.isDragging
                                ? { scale: 1.05, rotate: 2 }
                                : { scale: 1, rotate: 0 }
                            }
                            style={{
                              boxShadow: dragSnapshot.isDragging
                                ? '0 8px 24px rgba(0,0,0,0.15)'
                                : '0 1px 4px rgba(5,95,77,0.08)',
                            }}
                            transition={{
                              type: 'spring',
                              stiffness: 300,
                              damping: 20,
                            }}
                            className='bg-surface-container-lowest border-2 border-surface-variant rounded-full px-4 py-2 flex items-center gap-2 cursor-grab text-sm font-medium text-on-surface'
                          >
                            <GripVertical className='w-4 h-4 text-on-surface-variant' />
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
        </div>
      </DragDropContext>
    </div>
  );
}
