import type {
  AdminActivity,
  DragDropActivity,
  TrueOrFalseActivity,
  WordSearchActivity,
} from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActivityPatch {
  title?: string;
  maxPoints?: number;
  categories?: string[];
  items?: { id: string; label: string; correctCategory: string }[];
  feedbackMode?: string;
  wordList?: string[];
  gridSize?: { rows: number; cols: number };
  statements?: { id: string; text: string; correct: boolean }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function areEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Validates the word-search grid dimensions.
 * Returns null when valid, or an Indonesian error string.
 */
export function validateWordSearchGrid(form: AdminActivity): string | null {
  if (form.type !== 'word_search') return null;
  if (form.gridSize.rows < 8 || form.gridSize.rows > 15) {
    return 'Grid rows harus di antara 8 dan 15.';
  }
  if (form.gridSize.cols < 8 || form.gridSize.cols > 15) {
    return 'Grid cols harus di antara 8 dan 15.';
  }
  return null;
}

/**
 * Builds a minimal patch object containing only fields that changed.
 * Returns an empty object if nothing changed (no-op save).
 */
export function buildActivityPatch(
  form: AdminActivity,
  activity: AdminActivity,
): ActivityPatch {
  const patch: ActivityPatch = {};

  if (form.title !== activity.title) {
    patch.title = form.title;
  }

  if (form.maxPoints !== activity.maxPoints) {
    patch.maxPoints = form.maxPoints;
  }

  if (form.type === 'drag_drop' && activity.type === 'drag_drop') {
    const f = form as DragDropActivity;
    const a = activity as DragDropActivity;
    if (!areEqual(f.categories, a.categories)) {
      patch.categories = f.categories;
    }
    if (!areEqual(f.items, a.items)) {
      patch.items = f.items;
    }
    if (f.feedbackMode !== a.feedbackMode) {
      patch.feedbackMode = f.feedbackMode;
    }
  }

  if (form.type === 'word_search' && activity.type === 'word_search') {
    const f = form as WordSearchActivity;
    const a = activity as WordSearchActivity;
    if (!areEqual(f.wordList, a.wordList)) {
      patch.wordList = f.wordList;
    }
    if (!areEqual(f.gridSize, a.gridSize)) {
      patch.gridSize = f.gridSize;
    }
  }

  if (form.type === 'true_or_false' && activity.type === 'true_or_false') {
    const f = form as TrueOrFalseActivity;
    const a = activity as TrueOrFalseActivity;
    if (!areEqual(f.statements, a.statements)) {
      patch.statements = f.statements;
    }
    if (f.feedbackMode !== a.feedbackMode) {
      patch.feedbackMode = f.feedbackMode;
    }
  }

  return patch;
}
