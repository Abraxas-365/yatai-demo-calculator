// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, '../index.html');

test.beforeEach(async ({ page }) => {
  await page.goto(FILE_URL);
});

// ── AC1: JavaScript code is included that handles button clicks ───────────────

test('AC1: JavaScript is present and handles digit button clicks', async ({ page }) => {
  // Clicking digit 7 should update the display
  await page.click('[data-digit="7"]');
  await expect(page.locator('#current-value')).toHaveText('7');
});

test('AC1: JavaScript handles operator button clicks', async ({ page }) => {
  // Clicking an operator after a digit should update the expression area
  await page.click('[data-digit="5"]');
  await page.click('[data-op="+"]');
  const expression = page.locator('#expression');
  await expect(expression).not.toBeEmpty();
});

test('AC1: JavaScript handles clear button click', async ({ page }) => {
  await page.click('[data-digit="9"]');
  await page.click('#btn-clear');
  await expect(page.locator('#current-value')).toHaveText('0');
  await expect(page.locator('#expression')).toBeEmpty();
});

test('AC1: JavaScript handles equals button click', async ({ page }) => {
  await page.click('[data-digit="3"]');
  await page.click('[data-op="+"]');
  await page.click('[data-digit="4"]');
  await page.click('#btn-equals');
  await expect(page.locator('#current-value')).toHaveText('7');
});

// ── AC2: All arithmetic operations work correctly ─────────────────────────────

test('AC2: addition works correctly (5 + 3 = 8)', async ({ page }) => {
  await page.click('[data-digit="5"]');
  await page.click('[data-op="+"]');
  await page.click('[data-digit="3"]');
  await page.click('#btn-equals');
  await expect(page.locator('#current-value')).toHaveText('8');
});

test('AC2: subtraction works correctly (9 - 4 = 5)', async ({ page }) => {
  await page.click('[data-digit="9"]');
  await page.click('[data-op="-"]');
  await page.click('[data-digit="4"]');
  await page.click('#btn-equals');
  await expect(page.locator('#current-value')).toHaveText('5');
});

test('AC2: multiplication works correctly (6 × 7 = 42)', async ({ page }) => {
  await page.click('[data-digit="6"]');
  await page.click('[data-op="*"]');
  await page.click('[data-digit="7"]');
  await page.click('#btn-equals');
  await expect(page.locator('#current-value')).toHaveText('42');
});

test('AC2: division works correctly (81 ÷ 9 = 9)', async ({ page }) => {
  await page.click('[data-digit="8"]');
  await page.click('[data-digit="1"]');
  await page.click('[data-op="/"]');
  await page.click('[data-digit="9"]');
  await page.click('#btn-equals');
  await expect(page.locator('#current-value')).toHaveText('9');
});

test('AC2: multi-digit numbers work correctly (12 + 34 = 46)', async ({ page }) => {
  await page.click('[data-digit="1"]');
  await page.click('[data-digit="2"]');
  await page.click('[data-op="+"]');
  await page.click('[data-digit="3"]');
  await page.click('[data-digit="4"]');
  await page.click('#btn-equals');
  await expect(page.locator('#current-value')).toHaveText('46');
});

test('AC2: chained operations evaluate left-to-right (3 + 4 - 2 = 5)', async ({ page }) => {
  await page.click('[data-digit="3"]');
  await page.click('[data-op="+"]');
  await page.click('[data-digit="4"]');
  await page.click('[data-op="-"]');   // should compute 3+4=7 first
  await page.click('[data-digit="2"]');
  await page.click('#btn-equals');
  await expect(page.locator('#current-value')).toHaveText('5');
});

test('AC2: decimal arithmetic works (1.5 + 2.5 = 4)', async ({ page }) => {
  await page.click('[data-digit="1"]');
  await page.click('[data-digit="."]');
  await page.click('[data-digit="5"]');
  await page.click('[data-op="+"]');
  await page.click('[data-digit="2"]');
  await page.click('[data-digit="."]');
  await page.click('[data-digit="5"]');
  await page.click('#btn-equals');
  await expect(page.locator('#current-value')).toHaveText('4');
});

// ── AC3: Display updates correctly ───────────────────────────────────────────

test('AC3: display shows 0 on initial load', async ({ page }) => {
  await expect(page.locator('#current-value')).toHaveText('0');
});

test('AC3: display updates as digits are pressed', async ({ page }) => {
  await page.click('[data-digit="4"]');
  await expect(page.locator('#current-value')).toHaveText('4');
  await page.click('[data-digit="2"]');
  await expect(page.locator('#current-value')).toHaveText('42');
});

test('AC3: expression area updates when operator is pressed', async ({ page }) => {
  await page.click('[data-digit="8"]');
  await page.click('[data-op="+"]');
  const expr = await page.locator('#expression').textContent();
  expect(expr).toContain('8');
});

test('AC3: display shows result after equals', async ({ page }) => {
  await page.click('[data-digit="7"]');
  await page.click('[data-op="*"]');
  await page.click('[data-digit="6"]');
  await page.click('#btn-equals');
  await expect(page.locator('#current-value')).toHaveText('42');
});

test('AC3: expression shows full equation after equals', async ({ page }) => {
  await page.click('[data-digit="2"]');
  await page.click('[data-op="+"]');
  await page.click('[data-digit="3"]');
  await page.click('#btn-equals');
  const expr = await page.locator('#expression').textContent();
  expect(expr).toContain('=');
});

test('AC3: display resets to 0 after clear', async ({ page }) => {
  await page.click('[data-digit="5"]');
  await page.click('[data-digit="5"]');
  await page.click('[data-digit="5"]');
  await page.click('#btn-clear');
  await expect(page.locator('#current-value')).toHaveText('0');
});

test('AC3: new digit after result starts fresh entry', async ({ page }) => {
  await page.click('[data-digit="3"]');
  await page.click('[data-op="+"]');
  await page.click('[data-digit="2"]');
  await page.click('#btn-equals');      // result: 5
  await page.click('[data-digit="9"]'); // should start fresh, not append to 5
  await expect(page.locator('#current-value')).toHaveText('9');
});

// ── AC4: Division by zero shows error message ────────────────────────────────

test('AC4: dividing by zero shows Error', async ({ page }) => {
  await page.click('[data-digit="5"]');
  await page.click('[data-op="/"]');
  await page.click('[data-digit="0"]');
  await page.click('#btn-equals');
  await expect(page.locator('#current-value')).toHaveText('Error');
});

test('AC4: dividing any number by zero shows Error', async ({ page }) => {
  await page.click('[data-digit="1"]');
  await page.click('[data-digit="0"]');
  await page.click('[data-digit="0"]');
  await page.click('[data-op="/"]');
  await page.click('[data-digit="0"]');
  await page.click('#btn-equals');
  await expect(page.locator('#current-value')).toHaveText('Error');
});

test('AC4: clear after divide-by-zero error resets calculator', async ({ page }) => {
  await page.click('[data-digit="1"]');
  await page.click('[data-op="/"]');
  await page.click('[data-digit="0"]');
  await page.click('#btn-equals');
  await expect(page.locator('#current-value')).toHaveText('Error');
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

test('SCREENSHOT: calculator showing addition result', async ({ page }) => {
  await page.click('[data-digit="1"]');
  await page.click('[data-digit="2"]');
  await page.click('[data-op="+"]');
  await page.click('[data-digit="3"]');
  await page.click('[data-digit="4"]');
  await page.click('#btn-equals');
  await page.screenshot({
    path: '/workspace/proof/calculator-addition.png',
    fullPage: false,
  });
  await expect(page.locator('#current-value')).toHaveText('46');
});

test('SCREENSHOT: calculator showing divide-by-zero error', async ({ page }) => {
  await page.click('[data-digit="9"]');
  await page.click('[data-op="/"]');
  await page.click('[data-digit="0"]');
  await page.click('#btn-equals');
  await page.screenshot({
    path: '/workspace/proof/calculator-divide-by-zero.png',
    fullPage: false,
  });
  await expect(page.locator('#current-value')).toHaveText('Error');
});
