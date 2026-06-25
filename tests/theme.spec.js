// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, '../index.html');

test.beforeEach(async ({ page }) => {
  await page.goto(FILE_URL);
});

// ── Helper ──────────────────────────────────────────────────────────────────
/**
 * Get computed style property of a selector.
 * Returns the raw CSS value (e.g. "rgb(10, 22, 40)").
 */
async function getStyle(page, selector, property) {
  return page.evaluate(
    ([sel, prop]) => getComputedStyle(document.querySelector(sel))[prop],
    [selector, property],
  );
}

// ── AC1: Body background is dark vibrant blue (#0a1628) ─────────────────────

test('AC1: body background color is vibrant dark blue (#0a1628)', async ({ page }) => {
  const bg = await getStyle(page, 'body', 'backgroundColor');
  // #0a1628 → rgb(10, 22, 40)
  expect(bg).toBe('rgb(10, 22, 40)');
});

// ── AC2: Calculator panel uses vibrant blue palette ─────────────────────────

test('AC2: calculator panel background is #0d2137', async ({ page }) => {
  const bg = await getStyle(page, '.calculator', 'backgroundColor');
  // #0d2137 → rgb(13, 33, 55)
  expect(bg).toBe('rgb(13, 33, 55)');
});

test('AC2: calculator has blue-tinted box shadow', async ({ page }) => {
  const shadow = await getStyle(page, '.calculator', 'boxShadow');
  // Should contain blue-tinted shadow (not pure black)
  expect(shadow).toContain('rgba');
  expect(shadow.length).toBeGreaterThan(10);
});

// ── AC3: Display area uses vibrant blue theme ───────────────────────────────

test('AC3: display background is #0a3d6e (rich blue)', async ({ page }) => {
  const bg = await getStyle(page, '.display', 'backgroundColor');
  // #0a3d6e → rgb(10, 61, 110)
  expect(bg).toBe('rgb(10, 61, 110)');
});

test('AC3: display current value text is light blue-white (#e3f2fd)', async ({ page }) => {
  const color = await getStyle(page, '.current-value', 'color');
  // #e3f2fd → rgb(227, 242, 253)
  expect(color).toBe('rgb(227, 242, 253)');
});

test('AC3: expression text is soft blue (#90caf9)', async ({ page }) => {
  const color = await getStyle(page, '.expression', 'color');
  // #90caf9 → rgb(144, 202, 249)
  expect(color).toBe('rgb(144, 202, 249)');
});

// ── AC4: Digit buttons use vibrant blue base ────────────────────────────────

test('AC4: digit buttons have blue background (#112d4e)', async ({ page }) => {
  const bg = await getStyle(page, '[data-digit="5"]', 'backgroundColor');
  // #112d4e → rgb(17, 45, 78)
  expect(bg).toBe('rgb(17, 45, 78)');
});

test('AC4: digit buttons have light blue-white text (#e3f2fd)', async ({ page }) => {
  const color = await getStyle(page, '[data-digit="5"]', 'color');
  // #e3f2fd → rgb(227, 242, 253)
  expect(color).toBe('rgb(227, 242, 253)');
});

// ── AC5: Operator buttons use vibrant medium blue ───────────────────────────

test('AC5: operator buttons have vibrant blue background (#1565c0)', async ({ page }) => {
  const bg = await getStyle(page, '[data-op="+"]', 'backgroundColor');
  // #1565c0 → rgb(21, 101, 192)
  expect(bg).toBe('rgb(21, 101, 192)');
});

test('AC5: operator buttons have light blue text (#64b5f6)', async ({ page }) => {
  const color = await getStyle(page, '[data-op="+"]', 'color');
  // #64b5f6 → rgb(100, 181, 246)
  expect(color).toBe('rgb(100, 181, 246)');
});

// ── AC6: Equals button is vibrant electric blue ─────────────────────────────

test('AC6: equals button has electric blue background (#2979ff)', async ({ page }) => {
  const bg = await getStyle(page, '#btn-equals', 'backgroundColor');
  // #2979ff → rgb(41, 121, 255)
  expect(bg).toBe('rgb(41, 121, 255)');
});

test('AC6: equals button has white text', async ({ page }) => {
  const color = await getStyle(page, '#btn-equals', 'color');
  // #ffffff → rgb(255, 255, 255)
  expect(color).toBe('rgb(255, 255, 255)');
});

// ── AC7: Clear button retains red for UX consistency ────────────────────────

test('AC7: clear button has red background (#e53935)', async ({ page }) => {
  const bg = await getStyle(page, '#btn-clear', 'backgroundColor');
  // #e53935 → rgb(229, 57, 53)
  expect(bg).toBe('rgb(229, 57, 53)');
});

test('AC7: clear button has white text', async ({ page }) => {
  const color = await getStyle(page, '#btn-clear', 'color');
  expect(color).toBe('rgb(255, 255, 255)');
});

// ── AC8: Overall theme is cohesive vibrant blue ─────────────────────────────

test('AC8: all blue hues are present — no leftover non-blue theme colors', async ({ page }) => {
  // Verify key elements are all in the blue family
  const bodyBg = await getStyle(page, 'body', 'backgroundColor');
  const calcBg = await getStyle(page, '.calculator', 'backgroundColor');
  const displayBg = await getStyle(page, '.display', 'backgroundColor');
  const digitBg = await getStyle(page, '[data-digit="1"]', 'backgroundColor');
  const opBg = await getStyle(page, '[data-op="-"]', 'backgroundColor');
  const eqBg = await getStyle(page, '#btn-equals', 'backgroundColor');

  // All backgrounds should have blue > red in their RGB (blue-dominant)
  for (const bg of [bodyBg, calcBg, displayBg, digitBg, opBg, eqBg]) {
    const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    expect(match).not.toBeNull();
    const [, r, , b] = match.map(Number);
    expect(b).toBeGreaterThan(r); // blue channel dominates red channel
  }
});

test('AC8: vibrant blue theme has good contrast — display text is readable', async ({ page }) => {
  const displayBg = await getStyle(page, '.display', 'backgroundColor');
  const textColor = await getStyle(page, '.current-value', 'color');

  // Parse RGB values
  const bgMatch = displayBg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  const txtMatch = textColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  expect(bgMatch).not.toBeNull();
  expect(txtMatch).not.toBeNull();

  // Simple luminance check: text should be significantly brighter than background
  const bgLum = (0.299 * +bgMatch[1] + 0.587 * +bgMatch[2] + 0.114 * +bgMatch[3]);
  const txtLum = (0.299 * +txtMatch[1] + 0.587 * +txtMatch[2] + 0.114 * +txtMatch[3]);
  expect(txtLum - bgLum).toBeGreaterThan(100); // adequate contrast
});

// ── Screenshots ─────────────────────────────────────────────────────────────

test('SCREENSHOT: vibrant blue theme — initial state', async ({ page }) => {
  await page.screenshot({
    path: '/workspace/proof/theme-vibrant-blue-initial.png',
    fullPage: false,
  });
});

test('SCREENSHOT: vibrant blue theme — with calculation', async ({ page }) => {
  await page.click('[data-digit="7"]');
  await page.click('[data-op="*"]');
  await page.click('[data-digit="6"]');
  await page.click('#btn-equals');
  await page.screenshot({
    path: '/workspace/proof/theme-vibrant-blue-calculation.png',
    fullPage: false,
  });
  await expect(page.locator('#current-value')).toHaveText('42');
});

test('SCREENSHOT: vibrant blue theme — error state', async ({ page }) => {
  await page.click('[data-digit="5"]');
  await page.click('[data-op="/"]');
  await page.click('[data-digit="0"]');
  await page.click('#btn-equals');
  await page.screenshot({
    path: '/workspace/proof/theme-vibrant-blue-error.png',
    fullPage: false,
  });
  await expect(page.locator('#current-value')).toHaveText('Error');
});
