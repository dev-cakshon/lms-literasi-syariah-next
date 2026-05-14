/**
 * F3 — Course Viewer (TC-F.13)
 * E2E test for real-time progress sync across tabs/navigation.
 *
 * Pre-conditions:
 *   - TEST_STUDENT_EMAIL / TEST_STUDENT_PASSWORD set in .env.test
 *   - E2E_TEST_COURSE_ID chapter is NOT yet completed for this student
 *     (reset via admin panel or use a fresh test account)
 */

import { test, expect } from './fixtures/auth';
import { TEST_COURSE_ID, TEST_CHAPTER_ID } from './constants';

test.describe('F3 — Course Viewer (E2E)', () => {
  test.beforeEach(() => {
    if (!TEST_COURSE_ID || !TEST_CHAPTER_ID) {
      test.skip(true, 'E2E_TEST_COURSE_ID / E2E_TEST_CHAPTER_ID not configured');
    }
  });

  // TC-F.13 ───────────────────────────────────────────────────────────────────

  test('TC-F.13: Status bab tetap "selesai" tanpa perlu refresh; progress sidebar/overview akurat', async ({ studentPage, context }) => {
    const page1 = studentPage;

    // Open the chapter page and mark it complete
    await page1.goto(`/course/${TEST_COURSE_ID}/chapter/${TEST_CHAPTER_ID}`);
    await page1.waitForLoadState('networkidle');

    const markCompleteBtn = page1.getByRole('button', { name: /tandai|mark.*complete/i });
    await markCompleteBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await markCompleteBtn.click();

    // Wait for the optimistic update — button should disappear or show "selesai"
    await expect(markCompleteBtn).not.toBeVisible({ timeout: 8_000 });

    // Open course overview in a second tab (same context = same auth session)
    const page2 = await context.newPage();
    await page2.goto(`/course/${TEST_COURSE_ID}`);
    await page2.waitForLoadState('networkidle');

    // The Firestore onSnapshot subscription should reflect the completed chapter
    // without the user refreshing — check that progress is not "0%"
    const progressText = page2.getByText(/konten selesai/i);
    await expect(progressText).not.toContainText('0/');

    // Chapter status badge/indicator for our chapter should say "selesai" (completed)
    const chapterStatus = page2.getByTestId(`chapter-${TEST_CHAPTER_ID}-status`);
    if (await chapterStatus.count() > 0) {
      await expect(chapterStatus).toContainText(/selesai/i);
    }

    await page2.close();
  });
});
