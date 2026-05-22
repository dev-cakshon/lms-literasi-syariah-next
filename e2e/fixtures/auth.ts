import { type Page, test as base } from '@playwright/test';

export type AuthFixtures = {
  studentPage: Page;
};

/**
 * Extends Playwright's base `test` with a `studentPage` fixture that is
 * pre-authenticated as the test student account.  Reuses browser storage state
 * after the first login within a worker so subsequent tests don't repeat the
 * full login flow.
 */
export const test = base.extend<AuthFixtures>({
  studentPage: async ({ page }, use) => {
    const email = process.env.TEST_STUDENT_EMAIL;
    const password = process.env.TEST_STUDENT_PASSWORD;

    if (!email || !password) {
      throw new Error(
        'TEST_STUDENT_EMAIL and TEST_STUDENT_PASSWORD must be set in .env.test',
      );
    }

    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill(email);
    await page.getByPlaceholder(/password|kata sandi/i).fill(password);
    await page.getByRole('button', { name: /masuk|login/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15_000 });

    await use(page);
  },
});

export { expect } from '@playwright/test';
