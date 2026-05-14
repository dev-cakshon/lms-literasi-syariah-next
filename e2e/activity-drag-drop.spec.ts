/**
 * F8 — Drag & Drop (TC-F.30)
 * E2E test for completing all pairs and submitting.
 *
 * Pre-conditions:
 *   - TEST_STUDENT_EMAIL / TEST_STUDENT_PASSWORD set in .env.test
 *   - E2E_TEST_COURSE_ID and E2E_DRAG_DROP_ACTIVITY_ID are set in .env.test
 *
 * Approach: @hello-pangea/dnd uses pointer events. Playwright's dragTo()
 * dispatches real pointer events which the library handles correctly.
 *
 * data-testid attributes (added to DragDropPlayer.tsx):
 *   pool-zone                — unassigned item pool
 *   pool-item-{itemId}       — individual draggable in the pool
 *   category-zone-{category} — target drop zone for each category
 */

import { test, expect } from './fixtures/auth';
import { TEST_COURSE_ID, TEST_DRAG_DROP_ACTIVITY_ID } from './constants';

const activityUrl = () =>
  `/course/${TEST_COURSE_ID}/drag-drop/${TEST_DRAG_DROP_ACTIVITY_ID}`;

test.describe('F8 — Drag & Drop (E2E)', () => {
  test.beforeEach(() => {
    if (!TEST_COURSE_ID || !TEST_DRAG_DROP_ACTIVITY_ID) {
      test.skip(true, 'E2E_TEST_COURSE_ID / E2E_DRAG_DROP_ACTIVITY_ID not configured');
    }
  });

  // TC-F.30 ───────────────────────────────────────────────────────────────────

  test('TC-F.30: Student menyelesaikan semua pasangan lalu menekan Submit — layar hasil muncul', async ({ studentPage: page }) => {
    await page.goto(activityUrl());
    await page.waitForLoadState('networkidle');

    // Wait for pool zone to render
    const poolZone = page.getByTestId('pool-zone');
    await poolZone.waitFor({ state: 'visible', timeout: 10_000 });

    // Drag all pool items into any category zone
    // Strategy: find all pool items and the first available category zone,
    // then drag each item one-by-one.
    let remainingItems = await page.locator('[data-testid^="pool-item-"]').all();

    while (remainingItems.length > 0) {
      // Refresh pool items list each iteration since the DOM changes after drops
      const items = await page.locator('[data-testid^="pool-item-"]').all();
      if (items.length === 0) break;

      const item = items[0];

      // Get all category zones
      const categoryZones = await page.locator('[data-testid^="category-zone-"]').all();
      if (categoryZones.length === 0) break;

      // Drag to the first category zone
      const target = categoryZones[0];
      await item.dragTo(target);
      await page.waitForTimeout(300);

      remainingItems = await page.locator('[data-testid^="pool-item-"]').all();
    }

    // All items moved — Submit button should now be enabled/visible
    const submitBtn = page.getByRole('button', { name: /kirim jawaban|submit/i });
    await submitBtn.waitFor({ state: 'visible', timeout: 5_000 });
    await submitBtn.click();

    // Result screen appears with score
    await expect(page.getByText(/hasil aktivitas/i)).toBeVisible({ timeout: 10_000 });

    // Score is shown (e.g., "2/3" or "Skor: 67%")
    await expect(page.getByText(/skor|score/i)).toBeVisible();
  });
});
