/**
 * Hardcoded production test resource IDs.
 * These resources must exist in production Firebase before running E2E tests.
 * Update these values to match a published course with all three activity types.
 */

export const TEST_COURSE_ID = process.env.E2E_TEST_COURSE_ID ?? '';
export const TEST_CHAPTER_ID = process.env.E2E_TEST_CHAPTER_ID ?? '';
export const TEST_WORD_SEARCH_ACTIVITY_ID = process.env.E2E_WORD_SEARCH_ACTIVITY_ID ?? '';
export const TEST_DRAG_DROP_ACTIVITY_ID = process.env.E2E_DRAG_DROP_ACTIVITY_ID ?? '';
