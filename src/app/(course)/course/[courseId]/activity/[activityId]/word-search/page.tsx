'use client';

import { Loader2 } from 'lucide-react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getStudentActivity, submitActivity } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  type GridCell,
  type WordSearchResult,
  createSeedFromActivityId,
  generateWordSearch,
  normalizeWord,
} from '@/lib/wordSearch';

import { ActivityResultScreen } from '@/components/activity/ActivityResultScreen';
import { Button } from '@/components/ui/button';

import { CourseLayoutContext } from '@/app/(course)/course/[courseId]/CourseLayoutContext';

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
  'bg-emerald-200 text-emerald-900',
  'bg-amber-200 text-amber-900',
  'bg-cyan-200 text-cyan-900',
  'bg-fuchsia-200 text-fuchsia-900',
  'bg-lime-200 text-lime-900',
  'bg-rose-200 text-rose-900',
];

export default function WordSearchActivityPage({ params }: { params: Params }) {
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

  const submitReady = foundWords.length > 0;

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

  const onSubmit = async () => {
    if (!courseId || !activityId) return;
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
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

  if (!courseId || !activityId || !activity || !puzzle) {
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
        onRetry={() => {
          setResult(null);
          setFoundWords([]);
          setFoundWordCells([]);
          setDragStart(null);
          setDragCurrent(null);
          setIsDragging(false);

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

  return (
    <div className='mx-auto w-full max-w-4xl p-4 md:p-8 space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold text-slate-900'>
          {activity.title}
        </h1>
        <p className='text-sm text-slate-600 mt-1'>
          Seret huruf pada grid secara horizontal, vertikal, atau diagonal untuk
          menemukan kata.
        </p>
      </div>

      <div className='rounded-lg border bg-white p-4 md:p-6 space-y-4'>
        <div
          className='inline-grid gap-1 select-none touch-none'
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
                <button
                  key={key}
                  type='button'
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
                    'h-9 w-9 rounded-md border text-sm font-semibold transition-colors md:h-10 md:w-10',
                    foundColor ?? 'bg-slate-50 text-slate-900 border-slate-200',
                    inCurrentSelection &&
                      'ring-2 ring-primary-400 bg-primary-100 border-primary-300',
                  )}
                >
                  {char}
                </button>
              );
            }),
          )}
        </div>

        <div className='rounded-md border bg-slate-50 p-3'>
          <p className='text-xs font-semibold tracking-wide text-slate-600 uppercase'>
            Daftar Kata
          </p>
          <div className='mt-2 flex flex-wrap gap-2'>
            {activity.wordList.map((word, index) => {
              const normalized = normalizeWord(word);
              const found = foundWords.includes(normalized);
              return (
                <span
                  key={`${normalized || 'empty'}-${index}`}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium border',
                    found
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-white text-slate-700 border-slate-200',
                  )}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className='sticky bottom-3 z-10'>
        <div className='rounded-xl border border-primary-300 bg-primary-600 p-3 shadow-md flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-xs text-primary-50'>
            Ditemukan: {foundWords.length}/{targetSet.size}
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                setFoundWords([]);
                setFoundWordCells([]);
                setDragStart(null);
                setDragCurrent(null);
                setIsDragging(false);
              }}
              className='border-white/60 text-white hover:bg-white/10 hover:text-white'
            >
              Reset Pilihan
            </Button>
            <Button
              variant='tonal'
              onClick={onSubmit}
              disabled={!submitReady}
              className='font-semibold text-primary-700 hover:bg-primary-50 disabled:hover:bg-white'
            >
              {submitting ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
              <span>Kirim Jawaban</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
