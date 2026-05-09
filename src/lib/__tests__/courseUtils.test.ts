import { getChapterEmoji, getChapterOrdinal, CHAPTER_EMOJIS } from '@/lib/courseUtils';

describe('getChapterEmoji', () => {
  it('returns the emoji at index 0 for ordinal 1', () => {
    expect(getChapterEmoji(1)).toBe('📜');
  });

  it('returns the emoji at index 1 for ordinal 2', () => {
    expect(getChapterEmoji(2)).toBe('⚖️');
  });

  it('cycles back to start when ordinal exceeds array length', () => {
    expect(getChapterEmoji(CHAPTER_EMOJIS.length + 1)).toBe('📜');
  });

  it('handles ordinal 0 gracefully', () => {
    expect(getChapterEmoji(0)).toBe(CHAPTER_EMOJIS[CHAPTER_EMOJIS.length - 1]);
  });
});

describe('getChapterOrdinal', () => {
  const items = [
    { id: 'ch1', itemType: 'chapter' as const },
    { id: 'act1', itemType: 'activity' as const },
    { id: 'ch2', itemType: 'chapter' as const },
    { id: 'act2', itemType: 'activity' as const },
    { id: 'ch3', itemType: 'chapter' as const },
  ];

  it('returns 1 for the first chapter regardless of activity interleaving', () => {
    expect(getChapterOrdinal(items, 'ch1')).toBe(1);
  });

  it('returns 2 for the second chapter even with an activity between them', () => {
    expect(getChapterOrdinal(items, 'ch2')).toBe(2);
  });

  it('returns 3 for the third chapter', () => {
    expect(getChapterOrdinal(items, 'ch3')).toBe(3);
  });

  it('returns 1 when chapterId is not found', () => {
    expect(getChapterOrdinal(items, 'unknown')).toBe(1);
  });
});
