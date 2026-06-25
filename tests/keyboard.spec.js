// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, '../index.html');

test.beforeEach(async ({ page }) => {
  await page.goto(FILE_URL);
  // Focus the page so keydown events are received
  await page.locator('body').click();
});

// ── AC1: Keyboard number keys 0-9 input digits ────────────────────────────────

test('AC1: pressing key 0 inputs digit 0', async ({ page }) => {
  await page.keyboard.press('1'); // start with non-zero
  await page.keyboard.press('0');
  await expect(page.locator('#current-value')).toHaveText('10');
});

test('AC1: pressing key 1 inputs digit 1', async ({ page }) => {
  await page.keyboard.press('1');
  await expect(page.locator('#current-value')).toHaveText('1');
});

test('AC1: pressing key 2 inputs digit 2', async ({ page }) => {
  await page.keyboard.press('2');
  await expect(page.locator('#current-value')).toHaveText('2');
});

test('AC1: pressing key 3 inputs digit 3', async ({ page }) => {
  await page.keyboard.press('3');
  await expect(page.locator('#current-value')).toHaveText('3');
});

test('AC1: pressing key 4 inputs digit 4', async ({ page }) => {
  await page.keyboard.press('4');
  await expect(page.locator('#current-value')).toHaveText('4');
});

test('AC1: pressing key 5 inputs digit 5', async ({ page }) => {
  await page.keyboard.press('5');
  await expect(page.locator('#current-value')).toHaveText('5');
});

test('AC1: pressing key 6 inputs digit 6', async ({ page }) => {
  await page.keyboard.press('6');
  await expect(page.locator('#current-value')).toHaveText('6');
});

test('AC1: pressing key 7 inputs digit 7', async ({ page }) => {
  await page.keyboard.press('7');
  await expect(page.locator('#current-value')).toHaveText('7');
});

test('AC1: pressing key 8 inputs digit 8', async ({ page }) => {
  await page.keyboard.press('8');
  await expect(page.locator('#current-value')).toHaveText('8');
});

test('AC1: pressing key 9 inputs digit 9', async ({ page }) => {
  await page.keyboard.press('9');
  await expect(page.locator('#current-value')).toHaveText('9');
});

test('AC1: typing multi-digit number via keyboard (123)', async ({ page }) => {
  await page.keyboard.press('1');
  await page.keyboard.press('2');
  await page.keyboard.press('3');
  await expect(page.locator('#current-value')).toHaveText('123');
});

test('AC1: decimal point key inputs decimal', async ({ page }) => {
  await page.keyboard.press('3');
  await page.keyboard.press('.');
  await page.keyboard.press('1');
  await page.keyboard.press('4');
  await expect(page.locator('#current-value')).toHaveText('3.14');
});

// ── AC2: Keyboard operators trigger corresponding operations ──────────────────

test('AC2: plus key triggers addition (3 + 4 = 7)', async ({ page }) => {
  await page.keyboard.press('3');
  await page.keyboard.press('+');
  await page.keyboard.press('4');
  await page.keyboard.press('Enter');
  await expect(page.locator('#current-value')).toHaveText('7');
});

test('AC2: minus key triggers subtraction (9 - 5 = 4)', async ({ page }) => {
  await page.keyboard.press('9');
  await page.keyboard.press('-');
  await page.keyboard.press('5');
  await page.keyboard.press('Enter');
  await expect(page.locator('#current-value')).toHaveText('4');
});

test('AC2: asterisk key triggers multiplication (6 * 7 = 42)', async ({ page }) => {
  await page.keyboard.press('6');
  await page.keyboard.press('*');
  await page.keyboard.press('7');
  await page.keyboard.press('Enter');
  await expect(page.locator('#current-value')).toHaveText('42');
});

test('AC2: slash key triggers division (8 / 2 = 4)', async ({ page }) => {
  await page.keyboard.press('8');
  await page.keyboard.press('/');
  await page.keyboard.press('2');
  await page.keyboard.press('Enter');
  await expect(page.locator('#current-value')).toHaveText('4');
});

test('AC2: plus key updates expression area', async ({ page }) => {
  await page.keyboard.press('5');
  await page.keyboard.press('+');
  await expect(page.locator('#expression')).not.toBeEmpty();
});

test('AC2: chained keyboard operations (2 + 3 - 1 = 4)', async ({ page }) => {
  await page.keyboard.press('2');
  await page.keyboard.press('+');
  await page.keyboard.press('3');
  await page.keyboard.press('-');
  await page.keyboard.press('1');
  await page.keyboard.press('Enter');
  await expect(page.locator('#current-value')).toHaveText('4');
});

// ── AC3: Enter triggers equals, Escape/Delete clears ─────────────────────────

test('AC3: Enter key triggers equals (7 + 3 = 10)', async ({ page }) => {
  await page.keyboard.press('7');
  await page.keyboard.press('+');
  await page.keyboard.press('3');
  await page.keyboard.press('Enter');
  await expect(page.locator('#current-value')).toHaveText('10');
});

test('AC3: = key also triggers equals (4 + 5 = 9)', async ({ page }) => {
  await page.keyboard.press('4');
  await page.keyboard.press('+');
  await page.keyboard.press('5');
  await page.keyboard.type('=');
  await expect(page.locator('#current-value')).toHaveText('9');
});

test('AC3: Enter key shows full equation in expression area', async ({ page }) => {
  await page.keyboard.press('2');
  await page.keyboard.press('+');
  await page.keyboard.press('3');
  await page.keyboard.press('Enter');
  const expr = await page.locator('#expression').textContent();
  expect(expr).toContain('=');
});

test('AC3: Escape key clears the display', async ({ page }) => {
  await page.keyboard.press('5');
  await page.keyboard.press('5');
  await page.keyboard.press('5');
  await expect(page.locator('#current-value')).toHaveText('555');
  await page.keyboard.press('Escape');
  await expect(page.locator('#current-value')).toHaveText('0');
});

test('AC3: Escape key also clears expression area', async ({ page }) => {
  await page.keyboard.press('5');
  await page.keyboard.press('+');
  await page.keyboard.press('Escape');
  await expect(page.locator('#current-value')).toHaveText('0');
  await expect(page.locator('#expression')).toBeEmpty();
});

test('AC3: Delete key clears the display', async ({ page }) => {
  await page.keyboard.press('9');
  await page.keyboard.press('8');
  await expect(page.locator('#current-value')).toHaveText('98');
  await page.keyboard.press('Delete');
  await expect(page.locator('#current-value')).toHaveText('0');
});

test('AC3: Delete key also clears expression area', async ({ page }) => {
  await page.keyboard.press('3');
  await page.keyboard.press('+');
  await page.keyboard.press('Delete');
  await expect(page.locator('#current-value')).toHaveText('0');
  await expect(page.locator('#expression')).toBeEmpty();
});

// ── AC4: Backspace deletes last entered character ─────────────────────────────

test('AC4: Backspace deletes last character of multi-digit number', async ({ page }) => {
  await page.keyboard.press('1');
  await page.keyboard.press('2');
  await page.keyboard.press('3');
  await expect(page.locator('#current-value')).toHaveText('123');
  await page.keyboard.press('Backspace');
  await expect(page.locator('#current-value')).toHaveText('12');
});

test('AC4: Backspace on single digit resets to 0', async ({ page }) => {
  await page.keyboard.press('7');
  await page.keyboard.press('Backspace');
  await expect(page.locator('#current-value')).toHaveText('0');
});

test('AC4: Backspace deletes decimal digit', async ({ page }) => {
  await page.keyboard.press('3');
  await page.keyboard.press('.');
  await page.keyboard.press('5');
  await expect(page.locator('#current-value')).toHaveText('3.5');
  await page.keyboard.press('Backspace');
  await expect(page.locator('#current-value')).toHaveText('3.');
  await page.keyboard.press('Backspace');
  await expect(page.locator('#current-value')).toHaveText('3');
});

test('AC4: Backspace on Error does nothing harmful', async ({ page }) => {
  await page.keyboard.press('5');
  await page.keyboard.press('/');
  await page.keyboard.press('0');
  await page.keyboard.press('Enter');
  await expect(page.locator('#current-value')).toHaveText('Error');
  await page.keyboard.press('Backspace');
  // Error string should be reset to '0' (single char left becomes '0')
  await expect(page.locator('#current-value')).toHaveText('0');
});

test('AC4: multiple Backspace presses remove characters one by one', async ({ page }) => {
  await page.keyboard.press('4');
  await page.keyboard.press('2');
  await page.keyboard.press('0');
  await expect(page.locator('#current-value')).toHaveText('420');
  await page.keyboard.press('Backspace');
  await expect(page.locator('#current-value')).toHaveText('42');
  await page.keyboard.press('Backspace');
  await expect(page.locator('#current-value')).toHaveText('4');
  await page.keyboard.press('Backspace');
  await expect(page.locator('#current-value')).toHaveText('0');
});

// ── Integration: full keyboard-only calculation flow ─────────────────────────

test('INTEGRATION: complete calculation using only keyboard (12 * 3 = 36)', async ({ page }) => {
  await page.keyboard.press('1');
  await page.keyboard.press('2');
  await page.keyboard.press('*');
  await page.keyboard.press('3');
  await page.keyboard.press('Enter');
  await expect(page.locator('#current-value')).toHaveText('36');
});

test('INTEGRATION: keyboard division by zero shows Error', async ({ page }) => {
  await page.keyboard.press('9');
  await page.keyboard.press('/');
  await page.keyboard.press('0');
  await page.keyboard.press('Enter');
  await expect(page.locator('#current-value')).toHaveText('Error');
});

test('INTEGRATION: keyboard Escape after error recovers calculator', async ({ page }) => {
  await page.keyboard.press('1');
  await page.keyboard.press('/');
  await page.keyboard.press('0');
  await page.keyboard.press('Enter');
  await expect(page.locator('#current-value')).toHaveText('Error');
  await page.keyboard.press('Escape');
  await expect(page.locator('#current-value')).toHaveText('0');
  // Can continue calculating after recovery
  await page.keyboard.press('5');
  await page.keyboard.press('+');
  await page.keyboard.press('3');
  await page.keyboard.press('Enter');
  await expect(page.locator('#current-value')).toHaveText('8');
});

test('INTEGRATION: new digit after Enter starts fresh (keyboard only)', async ({ page }) => {
  await page.keyboard.press('5');
  await page.keyboard.press('+');
  await page.keyboard.press('3');
  await page.keyboard.press('Enter'); // result: 8
  await page.keyboard.press('2');     // should start fresh, not append to 8
  await expect(page.locator('#current-value')).toHaveText('2');
});

// ── Screenshots ───────────────────────────────────────────────────────────────

test('SCREENSHOT: keyboard - digits typed via keyboard', async ({ page }) => {
  await page.keyboard.press('4');
  await page.keyboard.press('2');
  await page.screenshot({
    path: '/workspace/proof/keyboard-digits.png',
  });
  await expect(page.locator('#current-value')).toHaveText('42');
});

test('SCREENSHOT: keyboard - result after Enter', async ({ page }) => {
  await page.keyboard.press('7');
  await page.keyboard.press('*');
  await page.keyboard.press('6');
  await page.keyboard.press('Enter');
  await page.screenshot({
    path: '/workspace/proof/keyboard-result.png',
  });
  await expect(page.locator('#current-value')).toHaveText('42');
});

test('SCREENSHOT: keyboard - Delete clears display', async ({ page }) => {
  await page.keyboard.press('9');
  await page.keyboard.press('9');
  await page.keyboard.press('Delete');
  await page.screenshot({
    path: '/workspace/proof/keyboard-delete-clear.png',
  });
  await expect(page.locator('#current-value')).toHaveText('0');
});

test('SCREENSHOT: keyboard - Backspace removes last digit', async ({ page }) => {
  await page.keyboard.press('1');
  await page.keyboard.press('2');
  await page.keyboard.press('3');
  await page.keyboard.press('Backspace');
  await page.screenshot({
    path: '/workspace/proof/keyboard-backspace.png',
  });
  await expect(page.locator('#current-value')).toHaveText('12');
});
