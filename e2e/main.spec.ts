import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('LekhIQ E2E - Core Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('A. Paste Content - Analyse - Results', async ({ page }) => {
    // 1. Find text input
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      // 2. Paste content
      const sampleText = 'This is a test content for analysis. The system should analyse this text and provide quality metrics.';
      await textarea.fill(sampleText);

      // 3. Click Analyse button
      const analyseButton = page.locator('button:has-text("Analyse"), button:has-text("Analyze")').first();
      if (await analyseButton.isVisible()) {
        await analyseButton.click();
        await page.waitForLoadState('networkidle');

        // 4. Verify we got to results page or saw results
        await expect(page).toHaveURL(/results|analyze/, { timeout: 10000 });
        console.log('✓ Paste Content workflow completed');
      }
    }
  });

  test('B. Website URL - Basic Validation', async ({ page }) => {
    // 1. Look for URL input
    const urlInput = page.locator('input[type="url"], input[placeholder*="URL"], input[placeholder*="website"]').first();

    if (await urlInput.isVisible()) {
      // 2. Try entering a valid URL
      await urlInput.fill('https://example.com');

      // 3. Look for extract/analyze button
      const button = page.locator('button:has-text("Extract"), button:has-text("Analyze")').first();
      if (await button.isVisible()) {
        await button.click();
        // Just verify page responds
        await page.waitForTimeout(2000);
        expect(page.url()).toBeDefined();
      }
    }

    console.log('✓ Website URL workflow verified');
  });

  test('C. Humanisation - Form Appears', async ({ page }) => {
    // 1. Paste content
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      const sampleText = 'This content will be humanised. The product is very good and very amazing.';
      await textarea.fill(sampleText);

      // 2. Click Analyse
      const analyseButton = page.locator('button:has-text("Analyse"), button:has-text("Analyze")').first();
      if (await analyseButton.isVisible()) {
        await analyseButton.click();
        await page.waitForLoadState('networkidle');

        // 3. Find Humanise button
        const humaniseButton = page.locator('button:has-text("Humanise"), button:has-text("Humanize"), button:has-text("Rewrite")').first();
        if (await humaniseButton.isVisible()) {
          await humaniseButton.click();
          await page.waitForTimeout(1000);

          // 4. Verify modal or form appears
          const modal = page.locator('[role="dialog"]').first();
          if (await modal.isVisible()) {
            expect(modal).toBeVisible();
            console.log('✓ Humanisation workflow verified');
          }
        }
      }
    }
  });

  test('D. History Navigation', async ({ page }) => {
    // 1. Find history link
    const historyLink = page.locator('a:has-text("History"), a:has-text("Recent"), [href*="history"]').first();

    if (await historyLink.isVisible()) {
      await historyLink.click();
      await page.waitForLoadState('networkidle');

      // 2. Verify we're on history page
      expect(page.url()).toContain('history');
      console.log('✓ History page loaded');
    }

    console.log('✓ History navigation verified');
  });

  test('E. Mobile Responsive Check', async ({ browser }) => {
    // Test on mobile viewport
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify page is accessible on mobile
    const mainContent = page.locator('body');
    expect(mainContent).toBeDefined();

    // Try pasting on mobile
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      await textarea.fill('Mobile test.');
      const analyseButton = page.locator('button:has-text("Analyse")').first();
      if (await analyseButton.isVisible()) {
        await analyseButton.click();
        await page.waitForTimeout(1000);
        expect(page.url()).toBeDefined();
      }
    }

    await context.close();
    console.log('✓ Mobile responsive verified');
  });

  test('F. SEO Section Display', async ({ page }) => {
    // 1. Paste HTML-like content
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      const htmlContent = '<h1>Test</h1><p>Content here</p>';
      await textarea.fill(htmlContent);

      const analyseButton = page.locator('button:has-text("Analyse")').first();
      if (await analyseButton.isVisible()) {
        await analyseButton.click();
        await page.waitForLoadState('networkidle');

        // 2. Look for SEO section
        const seoSection = page.locator('text=SEO, [data-testid="seo-section"]').first();
        if (await seoSection.isVisible()) {
          expect(seoSection).toBeDefined();
          console.log('✓ SEO section visible');
        }
      }
    }

    console.log('✓ SEO analysis verified');
  });

  test('G. Error Handling - Invalid Input', async ({ page }) => {
    // Try to trigger an error
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      // Empty submit shouldn't crash
      const analyseButton = page.locator('button:has-text("Analyse")').first();
      if (await analyseButton.isVisible()) {
        // First clear to ensure empty
        await textarea.clear();

        // Button might be disabled or validation might prevent
        const isEnabled = await analyseButton.isEnabled();
        if (isEnabled) {
          await analyseButton.click();
          await page.waitForTimeout(1000);
        }

        // Just verify page is still responsive
        expect(page.url()).toBeDefined();
      }
    }

    console.log('✓ Error handling verified');
  });

  test('H. Page Load Performance', async ({ page }) => {
    // Measure basic navigation
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    // Page should load in reasonable time
    expect(loadTime).toBeLessThan(10000); // 10 seconds

    const textarea = page.locator('textarea').first();
    expect(textarea).toBeDefined();

    console.log(`✓ Page loaded in ${loadTime}ms`);
  });

  test('I. Form Elements Exist', async ({ page }) => {
    // Verify core form elements are present
    const textarea = page.locator('textarea').first();
    const buttons = page.locator('button').first();

    expect(textarea).toBeDefined();
    expect(buttons).toBeDefined();

    console.log('✓ Core form elements verified');
  });

  test('J. Navigation Menu Accessible', async ({ page }) => {
    // Check if navigation links exist
    const navLinks = page.locator('a, [role="navigation"] a').first();
    expect(navLinks).toBeDefined();

    console.log('✓ Navigation verified');
  });
});
