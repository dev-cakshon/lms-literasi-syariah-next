import type { CourseContentItem } from '@/types';

export const CHAPTER_EMOJIS = [
  '📜',
  // ,  '⚖️', '💰', '🕌', '📖', '🌙', '⭐', '🤲', '💎', '🏛️',
] as const;

export function getChapterEmoji(ordinal: number): string {
  const len = CHAPTER_EMOJIS.length;
  const index = (((ordinal - 1) % len) + len) % len;
  return CHAPTER_EMOJIS[index] ?? '📖';
}

export function getChapterOrdinal(
  contentItems: Array<{ id: string; itemType: string }>,
  chapterId: string,
): number {
  const chapters = contentItems.filter((item) => item.itemType === 'chapter');
  const index = chapters.findIndex((item) => item.id === chapterId);
  return index === -1 ? 1 : index + 1;
}

export function getItemPath(item: CourseContentItem, courseId: string): string {
  if (item.itemType === 'chapter') {
    return `/course/${courseId}/chapter/${item.id}`;
  }
  const suffix =
    item.type === 'drag_drop'
      ? 'drag-drop'
      : item.type === 'word_search'
        ? 'word-search'
        : 'true-or-false';
  return `/course/${courseId}/activity/${item.id}/${suffix}`;
}

export function getNeighborPaths(
  items: CourseContentItem[],
  currentId: string,
  courseId: string,
): { prev: string | null; next: string | null } {
  const index = items.findIndex((item) => item.id === currentId);
  if (index === -1) return { prev: null, next: null };
  const prevItem = index > 0 ? items[index - 1] : undefined;
  const nextItem = index < items.length - 1 ? items[index + 1] : undefined;
  return {
    prev: prevItem ? getItemPath(prevItem, courseId) : null,
    next: nextItem ? getItemPath(nextItem, courseId) : null,
  };
}
