export const CHAPTER_EMOJIS = [
  '📜'
  // ,  '⚖️', '💰', '🕌', '📖', '🌙', '⭐', '🤲', '💎', '🏛️',
] as const;

export function getChapterEmoji(ordinal: number): string {
  const len = CHAPTER_EMOJIS.length;
  const index = ((ordinal - 1) % len + len) % len;
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
