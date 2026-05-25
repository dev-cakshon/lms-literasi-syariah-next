'use client';

import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getStudentActivity, submitActivity } from '@/lib/api';
import { getNeighborPaths } from '@/lib/courseUtils';
import { cn } from '@/lib/utils';
import {
  type GridCell,
  type WordSearchResult,
  createSeedFromActivityId,
  generateWordSearch,
  normalizeWord,
} from '@/lib/wordSearch';

import { ActivityResultScreen } from '@/components/activity/ActivityResultScreen';
import { CourseActionBar } from '@/components/course/CourseActionBar';

import { CourseLayoutContext } from '@/app/(main)/(student)/(course)/course/[courseId]/CourseLayoutContext';

import type {
  StudentActivity,
  StudentWordSearchActivity,
  SubmitActivityResponse,
} from '@/types';

type Params = Promise<{ courseId: string; activityId: string }>;

function cellKey(cell: GridCell): string {
  return `${cell.row}-${cell.col}`;
}

function buildLineCells(start: GridCell, end: GridCell): GridCell[] {
  const dr = end.row - start.row;
  const dc = end.col - start.col;

  const isHorizontal = dr === 0;
  const isVertical = dc === 0;
  const isDiagonal = Math.abs(dr) === Math.abs(dc);

  if (!isHorizontal && !isVertical && !isDiagonal) {
    return [];
  }

  const length = Math.max(Math.abs(dr), Math.abs(dc));
  const stepRow = Math.sign(dr);
  const stepCol = Math.sign(dc);

  return Array.from({ length: length + 1 }, (_, index) => ({
    row: start.row + stepRow * index,
    col: start.col + stepCol * index,
  }));
}

const highlightPalette = [
  'bg-secondary-container border-2 border-[#95d872] text-on-secondary-container',
  'bg-tertiary-fixed border-2 border-tertiary-fixed-dim text-on-surface',
  'bg-primary-fixed border-2 border-primary-fixed-dim text-on-surface',
];

export default function WordSearchActivityPage({ params }: { params: Params }) {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [activity, setActivity] = useState<StudentWordSearchActivity | null>(
    null,
  );
  const [puzzle, setPuzzle] = useState<WordSearchResult | null>(null);
  const [dragStart, setDragStart] = useState<GridCell | null>(null);
  const [dragCurrent, setDragCurrent] = useState<GridCell | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundWordCells, setFoundWordCells] = useState<
    Array<{ normalized: string; cells: GridCell[] }>
  >([]);
  const [result, setResult] = useState<SubmitActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { contentItems, refreshContentItems, setChatFabHidden } =
    useContext(CourseLayoutContext);
  const autoSubmitFiredRef = useRef(false);

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

        if (data.type !== 'word_search') {
          setError('Aktivitas tidak sesuai dengan halaman ini.');
          setActivity(null);
          setPuzzle(null);
          return;
        }

        const typedActivity = data as StudentWordSearchActivity;
        const seed = createSeedFromActivityId(resolvedActivityId);
        const generatedPuzzle = generateWordSearch(
          typedActivity.wordList,
          typedActivity.gridSize,
          seed,
        );

        setActivity(typedActivity);
        setPuzzle(generatedPuzzle);
        setFoundWords([]);
        setFoundWordCells([]);
        setDragStart(null);
        setDragCurrent(null);
        setIsDragging(false);
        autoSubmitFiredRef.current = false;
      } catch (err) {
        console.error('Failed to load word-search activity:', err);
        setError('Gagal memuat aktivitas.');
        setActivity(null);
        setPuzzle(null);
      } finally {
        setLoading(false);
      }
    }

    void fetchActivity();
  }, [courseId, activityId]);

  const normalizedToOriginal = useMemo(() => {
    const map = new Map<string, string>();
    for (const word of activity?.wordList ?? []) {
      const normalized = normalizeWord(word);
      if (normalized && !map.has(normalized)) {
        map.set(normalized, word);
      }
    }
    return map;
  }, [activity]);

  const targetSet = useMemo(
    () => new Set(Array.from(normalizedToOriginal.keys())),
    [normalizedToOriginal],
  );

  const selectedCells = useMemo(() => {
    if (!dragStart || !dragCurrent) return [];
    return buildLineCells(dragStart, dragCurrent);
  }, [dragStart, dragCurrent]);

  const foundColorByCell = useMemo(() => {
    const colorMap = new Map<string, string>();
    for (let i = 0; i < foundWordCells.length; i += 1) {
      const item = foundWordCells[i];
      const colorClass = highlightPalette[
        i % highlightPalette.length
      ] as string;
      for (const cell of item.cells) {
        colorMap.set(cellKey(cell), colorClass);
      }
    }
    return colorMap;
  }, [foundWordCells]);

  const onSubmit = useCallback(async () => {
    if (!courseId || !activityId) return;
    setError(null);
    try {
      const foundWordsPayload = foundWords.map(
        (normalized) => normalizedToOriginal.get(normalized) ?? normalized,
      );

      const submitResult = await submitActivity(courseId, activityId, {
        answers: { foundWords: foundWordsPayload },
      });
      setResult(submitResult);
      refreshContentItems();
    } catch (err) {
      console.error('Failed to submit word-search activity:', err);
      setError('Gagal mengirim jawaban.');
    }
  }, [
    courseId,
    activityId,
    foundWords,
    normalizedToOriginal,
    refreshContentItems,
  ]);

  useEffect(() => {
    if (
      foundWords.length > 0 &&
      foundWords.length === targetSet.size &&
      !autoSubmitFiredRef.current
    ) {
      autoSubmitFiredRef.current = true;
      void confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      const timeout = setTimeout(() => void onSubmit(), 1500);
      return () => clearTimeout(timeout);
    }
  }, [foundWords.length, targetSet.size, onSubmit]);

  const finalizeDragSelection = useCallback(() => {
    if (!puzzle || !activity || selectedCells.length === 0) {
      setDragStart(null);
      setDragCurrent(null);
      setIsDragging(false);
      return;
    }

    const candidate = selectedCells
      .map((cell) => puzzle.grid[cell.row]?.[cell.col] ?? '')
      .join('');
    const reversed = candidate.split('').reverse().join('');

    const normalizedCandidate = normalizeWord(candidate);
    const normalizedReversed = normalizeWord(reversed);

    const matched = targetSet.has(normalizedCandidate)
      ? normalizedCandidate
      : targetSet.has(normalizedReversed)
        ? normalizedReversed
        : null;

    if (matched && !foundWords.includes(matched)) {
      setFoundWords((prev) => [...prev, matched]);
      setFoundWordCells((prev) => [
        ...prev,
        { normalized: matched, cells: selectedCells },
      ]);
    }

    setDragStart(null);
    setDragCurrent(null);
    setIsDragging(false);
  }, [activity, foundWords, puzzle, selectedCells, targetSet]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseUp = () => {
      finalizeDragSelection();
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, finalizeDragSelection]);

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

  if (!courseId || !activityId || !activity || !puzzle) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-on-surface-variant'>Aktivitas tidak ditemukan.</p>
      </div>
    );
  }

  if (result) {
    const nextPath = getNeighborPaths(
      contentItems,
      activityId ?? '',
      courseId,
    ).next;
    return (
      <ActivityResultScreen
        result={result}
        courseId={courseId}
        nextPath={nextPath}
        onRetry={() => {
          setResult(null);
          setFoundWords([]);
          setFoundWordCells([]);
          setDragStart(null);
          setDragCurrent(null);
          setIsDragging(false);
          autoSubmitFiredRef.current = false;

          const seed = createSeedFromActivityId(activityId);
          const regenerated = generateWordSearch(
            activity.wordList,
            activity.gridSize,
            seed,
          );
          setPuzzle(regenerated);
        }}
      />
    );
  }

  const allFound = targetSet.size > 0 && foundWords.length === targetSet.size;
  const neighbors = getNeighborPaths(contentItems, activityId ?? '', courseId);
  const prevPath = neighbors.prev;

  return (
    <div className='mx-auto w-full max-w-4xl p-4 md:p-8 pb-8 space-y-6'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className='space-y-2'
      >
        <div className='flex items-start justify-between gap-4'>
          <h1 className='font-display text-on-surface text-2xl md:text-[32px] font-semibold leading-tight'>
            {activity.title}
          </h1>
          <div className='shrink-0 bg-amber-50 text-amber-700 text-xs font-bold tracking-[0.05em] px-3 py-1 rounded-full inline-flex items-center gap-1 border border-amber-300 shadow-[0_2px_0_0_var(--color-amber-300)]'>
            <Zap className='w-3 h-3' />
            Hingga {activity.maxPoints} XP
          </div>
        </div>
        <p className='text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant'>
          {foundWords.length}/{targetSet.size} KATA
        </p>
      </motion.div>

      {/* Word chips / all-found banner */}
      <div>
        {allFound && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className='bg-secondary-container border-2 border-[#95d872] text-on-secondary-container rounded-2xl shadow-[0_4px_0_0_#95d872] px-4 py-3 flex items-center justify-center gap-2 text-sm font-bold mb-3'
          >
            <Sparkles className='w-5 h-5' />
            Semua kata ditemukan!
          </motion.div>
        )}
        {/* Chips stay mounted (display:none when allFound) so e2e data-testid locators remain stable */}
        <div className={cn('flex flex-wrap gap-3', allFound && 'hidden')}>
          {activity.wordList.map((word, index) => {
            const normalized = normalizeWord(word);
            const found = foundWords.includes(normalized);
            return (
              <span
                key={`${normalized || 'empty'}-${index}`}
                data-testid={`word-item-${index}`}
                data-found={found ? 'true' : 'false'}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-bold uppercase tracking-[0.05em]',
                  found
                    ? 'bg-secondary-container border-2 border-[#95d872] text-on-secondary-container shadow-[0_2px_0_0_#95d872]'
                    : 'bg-surface border-2 border-outline-variant text-on-surface shadow-[0_2px_0_0_#bec9c4]',
                )}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      {/* Grid board */}
      <div className='mx-auto w-full max-w-md bg-surface border-2 border-outline-variant rounded-2xl shadow-[0_6px_0_0_#bec9c4] p-3'>
        <div
          className='grid gap-1 w-full select-none touch-none'
          style={{
            gridTemplateColumns: `repeat(${activity.gridSize.cols}, minmax(0, 1fr))`,
          }}
        >
          {puzzle.grid.map((row, rowIndex) =>
            row.map((char, colIndex) => {
              const cell: GridCell = { row: rowIndex, col: colIndex };
              const key = cellKey(cell);
              const inCurrentSelection = selectedCells.some(
                (selectedCell) =>
                  selectedCell.row === rowIndex &&
                  selectedCell.col === colIndex,
              );
              const foundColor = foundColorByCell.get(key);

              return (
                <motion.button
                  key={key}
                  data-testid={`cell-${rowIndex}-${colIndex}`}
                  type='button'
                  animate={foundColor ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                  onMouseDown={() => {
                    setDragStart(cell);
                    setDragCurrent(cell);
                    setIsDragging(true);
                  }}
                  onMouseEnter={() => {
                    if (!isDragging) return;
                    setDragCurrent(cell);
                  }}
                  onMouseUp={() => {
                    if (!isDragging) return;
                    setDragCurrent(cell);
                    finalizeDragSelection();
                  }}
                  className={cn(
                    'aspect-square w-full flex items-center justify-center rounded-[6px] text-sm font-bold uppercase bg-surface-container border border-outline-variant text-on-surface transition-colors',
                    foundColor,
                    inCurrentSelection &&
                      'bg-primary-container text-on-primary-container border-2 border-primary-500 ring-2 ring-primary-500/30',
                  )}
                >
                  {char}
                </motion.button>
              );
            }),
          )}
        </div>
      </div>

      <CourseActionBar
        prev={prevPath ? { onClick: () => router.push(prevPath) } : null}
        next={{
          state: 'disabled',
          tooltipText: 'Temukan semua kata untuk lanjut',
        }}
      />
    </div>
  );
}
