// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, '../index.html');

test.beforeEach(async ({ page }) => {
  await page.goto(FILE_URL);
});

// ── Acceptance Criteria 1: Valid HTML5 structure ──────────────────────────────
test('AC1: index.html has valid HTML5 doctype and structure', async ({ page }) => {
  // Check page title
  await expect(page).toHaveTitle('Calculator');

  // Verify DOCTYPE via doctype node (outerHTML never includes the doctype)
  const hasDoctype = await page.evaluate(() => document.doctype !== null);
  expect(hasDoctype).toBe(true);
  const doctypeName = await page.evaluate(() => document.doctype?.name ?? '');
  expect(doctypeName.toLowerCase()).toBe('html');
  // lang attribute present
  const lang = await page.getAttribute('html', 'lang');
  expect(lang).toBe('en');
  // charset meta
  const charset = await page.$('meta[charset="UTF-8"]');
  expect(charset).not.toBeNull();
  // viewport meta
  const viewport = await page.$('meta[name="viewport"]');
  expect(viewport).not.toBeNull();
});

// ── Acceptance Criteria 2: Display/output area ────────────────────────────────
test('AC2: calculator has a display area showing current input and results', async ({ page }) => {
  const display = page.locator('#current-value');
  await expect(display).toBeVisible();
  await expect(display).toHaveText('0');

  // Display updates when a digit is clicked
  await page.click('[data-digit="5"]');
  await expect(display).toHaveText('5');

  // Display shows result after calculation
  await page.click('[data-op="+"]');
  await page.click('[data-digit="3"]');
  await page.click('#btn-equals');
  await expect(display).toHaveText('8');
});

// ── Acceptance Criteria 3: All required buttons present ───────────────────────
test('AC3: digits 0-9 are all present', async ({ page }) => {
  for (let d = 0; d <= 9; d++) {
    const btn = page.locator(`[data-digit="${d}"]`);
    await expect(btn).toBeVisible();
  }
});

test('AC3: operation buttons +, -, *, / are present', async ({ page }) => {
  await expect(page.locator('[data-op="+"]')).toBeVisible();
  await expect(page.locator('[data-op="-"]')).toBeVisible();
  await expect(page.locator('[data-op="*"]')).toBeVisible();
  await expect(page.locator('[data-op="/"]')).toBeVisible();
});

test('AC3: equals (=) and clear (C) buttons are present', async ({ page }) => {
  await expect(page.locator('#btn-equals')).toBeVisible();
  await expect(page.locator('#btn-clear')).toBeVisible();
});

// ── Acceptance Criteria 4: Dark theme CSS ─────────────────────────────────────
test('AC4: calculator has dark-themed appearance', async ({ page }) => {
  // Body background should be dark
  const bodyBg = await page.evaluate(() =>
    window.getComputedStyle(document.body).backgroundColor
  );
  // rgb(26, 26, 46) = #1a1a2e
  expect(bodyBg).toBe('rgb(26, 26, 46)');

  // Calculator widget background should be dark
  const calcBg = await page.evaluate(() =>
    window.getComputedStyle(document.querySelector('.calculator')).backgroundColor
  );
  // rgb(22, 33, 62) = #16213e
  expect(calcBg).toBe('rgb(22, 33, 62)');

  // Display text color should be light
  const displayColor = await page.evaluate(() =>
    window.getComputedStyle(document.getElementById('current-value')).color
  );
  // rgb(224, 224, 224) = #e0e0e0
  expect(displayColor).toBe('rgb(224, 224, 224)');
});

test('AC4: buttons are laid out in a grid', async ({ page }) => {
  const gridDisplay = await page.evaluate(() =>
    window.getComputedStyle(document.querySelector('.buttons')).display
  );
  expect(gridDisplay).toBe('grid');
});

// ── Functional smoke tests ─────────────────────────────────────────────────────
test('FUNC: subtraction works', async ({ page }) => {
  await page.click('[data-digit="9"]');
  await page.click('[data-op="-"]');
  await page.click('[data-digit="4"]');
  await page.click('#btn-equals');
  await expect(page.locator('#current-value')).toHaveText('5');
});

test('FUNC: multiplication works', async ({ page }) => {
  await page.click('[data-digit="6"]');
  await page.click('[data-op="*"]');
  await page.click('[data-digit="7"]');
  await page.click('#btn-equals');
  await expect(page.locator('#current-value')).toHaveText('42');
});

test('FUNC: division works', async ({ page }) => {
  await page.click('[data-digit="8"]');
  await page.click('[data-digit="1"]');
  await page.click('[data-op="/"]');
  await page.click('[data-digit="9"]');
  await page.click('#btn-equals');
  await expect(page.locator('#current-value')).toHaveText('9');
});

test('FUNC: clear button resets display to 0', async ({ page }) => {
  await page.click('[data-digit="7"]');
  await page.click('[data-digit="7"]');
  await page.click('#btn-clear');
  await expect(page.locator('#current-value')).toHaveText('0');
});

// ── Screenshot proof ──────────────────────────────────────────────────────────
test('SCREENSHOT: calculator initial state', async ({ page }) => {
  await page.screenshot({
    path: '/workspace/proof/calculator-initial.png',
    fullPage: false,
  });
});

test('SCREENSHOT: calculator after arithmetic', async ({ page }) => {
  // Type 12 + 34 =
  await page.click('[data-digit="1"]');
  await page.click('[data-digit="2"]');
  await page.click('[data-op="+"]');
  await page.click('[data-digit="3"]');
  await page.click('[data-digit="4"]');
  await page.click('#btn-equals');
  await page.screenshot({
    path: '/workspace/proof/calculator-result.png',
    fullPage: false,
  });
  await expect(page.locator('#current-value')).toHaveText('46');
});
