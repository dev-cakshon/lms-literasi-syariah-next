export interface GridCell {
  row: number;
  col: number;
}

export interface WordPlacement {
  word: string;
  normalized: string;
  cells: GridCell[];
}

export interface WordSearchResult {
  grid: string[][];
  placements: WordPlacement[];
}

interface BuildWord {
  word: string;
  normalized: string;
  orderIndex: number;
}

interface GridSize {
  rows: number;
  cols: number;
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const directions: Array<{ dr: number; dc: number }> = [
  { dr: 0, dc: 1 },
  { dr: 0, dc: -1 },
  { dr: 1, dc: 0 },
  { dr: -1, dc: 0 },
  { dr: 1, dc: 1 },
  { dr: -1, dc: -1 },
  { dr: 1, dc: -1 },
  { dr: -1, dc: 1 },
];

export function normalizeWord(word: string): string {
  return word.toUpperCase().replace(/[^A-Z]/g, '');
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToSeed(source: string): number {
  let hash = 2166136261;
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function shuffled<T>(items: T[], rng: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function inBounds(cell: GridCell, size: GridSize): boolean {
  return (
    cell.row >= 0 &&
    cell.row < size.rows &&
    cell.col >= 0 &&
    cell.col < size.cols
  );
}

function buildCells(
  start: GridCell,
  direction: { dr: number; dc: number },
  length: number
): GridCell[] {
  return Array.from({ length }, (_, index) => ({
    row: start.row + direction.dr * index,
    col: start.col + direction.dc * index,
  }));
}

function canPlaceWord(
  grid: (string | null)[][],
  word: string,
  cells: GridCell[]
) {
  for (let i = 0; i < cells.length; i += 1) {
    const cell = cells[i];
    const existing = grid[cell.row][cell.col];
    if (existing && existing !== word[i]) {
      return false;
    }
  }
  return true;
}

function placeWord(grid: (string | null)[][], word: string, cells: GridCell[]) {
  for (let i = 0; i < cells.length; i += 1) {
    const cell = cells[i];
    grid[cell.row][cell.col] = word[i];
  }
}

function randomLetter(rng: () => number): string {
  return alphabet[Math.floor(rng() * alphabet.length)] ?? 'A';
}

export function createSeedFromActivityId(activityId: string): number {
  return hashStringToSeed(activityId);
}

export function generateWordSearch(
  wordList: string[],
  gridSize: GridSize,
  seed: number
): WordSearchResult {
  const words: BuildWord[] = wordList
    .map((word, orderIndex) => ({
      word,
      normalized: normalizeWord(word),
      orderIndex,
    }))
    .filter((item) => item.normalized.length > 0);

  if (words.length === 0) {
    throw new Error('Word Search membutuhkan setidaknya satu kata valid.');
  }

  const longestWordLength = Math.max(
    ...words.map((item) => item.normalized.length)
  );
  if (longestWordLength > Math.max(gridSize.rows, gridSize.cols)) {
    throw new Error('Grid terlalu kecil untuk menempatkan kata terpanjang.');
  }

  const maxAttempts = 120;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const attemptSeed = (seed + Math.imul(attempt + 1, 1013904223)) >>> 0;
    const rng = mulberry32(attemptSeed);

    const grid: (string | null)[][] = Array.from(
      { length: gridSize.rows },
      () => Array.from({ length: gridSize.cols }, () => null)
    );

    const placements: WordPlacement[] = [];

    const placementOrder = [...words].sort((a, b) => {
      if (b.normalized.length !== a.normalized.length) {
        return b.normalized.length - a.normalized.length;
      }
      return a.orderIndex - b.orderIndex;
    });

    let placedCount = 0;

    for (const entry of placementOrder) {
      const allStarts = shuffled(
        Array.from({ length: gridSize.rows * gridSize.cols }, (_, index) => ({
          row: Math.floor(index / gridSize.cols),
          col: index % gridSize.cols,
        })),
        rng
      );

      const dirOrder = shuffled(directions, rng);

      let placed = false;

      for (const start of allStarts) {
        for (const direction of dirOrder) {
          const cells = buildCells(start, direction, entry.normalized.length);
          const endCell = cells[cells.length - 1];
          if (!endCell || !inBounds(endCell, gridSize)) {
            continue;
          }

          if (!canPlaceWord(grid, entry.normalized, cells)) {
            continue;
          }

          placeWord(grid, entry.normalized, cells);
          placements.push({
            word: entry.word,
            normalized: entry.normalized,
            cells,
          });
          placed = true;
          placedCount += 1;
          break;
        }

        if (placed) {
          break;
        }
      }

      if (!placed) {
        break;
      }
    }

    if (placedCount !== placementOrder.length) {
      continue;
    }

    const completedGrid = grid.map((row) =>
      row.map((char) => char ?? randomLetter(rng))
    );

    return {
      grid: completedGrid,
      placements,
    };
  }

  throw new Error(
    'Gagal membuat grid Word Search. Coba ubah ukuran grid atau daftar kata.'
  );
}
