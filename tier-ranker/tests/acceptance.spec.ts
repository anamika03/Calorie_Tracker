import { test, expect, type Page, type Locator } from '@playwright/test';
import { readFileSync, statSync, mkdirSync } from 'node:fs';
import manifest from '../src/data/manifest.json' with { type: 'json' };

const chip = (page: Page, id: string) => page.getByTestId(`chip-${id}`);
const drop = (page: Page, id: string) => page.getByTestId(`drop-${id}`);
const idsIn = (page: Page, container: string) =>
  drop(page, container).locator('[data-concept]').evaluateAll((els) => els.map((e) => e.getAttribute('data-concept')));

async function dragTo(page: Page, source: Locator, target: Locator, pos: 'center' | 'end' = 'center') {
  await source.scrollIntoViewIfNeeded();
  const s = (await source.boundingBox())!;
  await page.mouse.move(s.x + s.width / 2, s.y + s.height / 2);
  await page.mouse.down();
  await page.mouse.move(s.x + s.width / 2 + 10, s.y + s.height / 2 + 10, { steps: 5 });
  const t = (await target.boundingBox())!;
  const tx = pos === 'end' ? t.x + t.width - 20 : t.x + t.width / 2;
  await page.mouse.move(tx, t.y + t.height / 2, { steps: 20 });
  await page.waitForTimeout(100);
  await page.mouse.up();
  await page.waitForTimeout(400); // let the drop animation finish before the next drag
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('1. renders header, ≥5 tiers, all concepts with loaded images', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Rank the system design stack.');
  expect(await page.locator('[data-testid^="tier-"]').count()).toBeGreaterThanOrEqual(5);
  expect(await idsIn(page, 'unranked')).toEqual(manifest.map((m) => m.id));
  for (const m of manifest) await expect(chip(page, m.id)).toContainText(m.name);
  const broken = await page.locator('.chip__icon').evaluateAll((imgs) =>
    (imgs as HTMLImageElement[]).filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src),
  );
  expect(broken).toEqual([]);
});

test('2. drag from tray into tier S', async ({ page }) => {
  const id = manifest[0].id;
  await dragTo(page, chip(page, id), drop(page, 'S'));
  expect(await idsIn(page, 'S')).toEqual([id]);
  expect(await idsIn(page, 'unranked')).not.toContain(id);
});

test('3. drag between tiers, back to tray, and reorder within a tier', async ({ page }) => {
  const [a, b] = [manifest[0].id, manifest[1].id];
  await dragTo(page, chip(page, a), drop(page, 'A'));
  await dragTo(page, chip(page, b), drop(page, 'A'), 'end');
  expect(await idsIn(page, 'A')).toEqual([a, b]);

  await dragTo(page, chip(page, b), chip(page, a)); // reorder: b before a
  expect(await idsIn(page, 'A')).toEqual([b, a]);

  await dragTo(page, chip(page, a), drop(page, 'B'));
  expect(await idsIn(page, 'B')).toEqual([a]);
  expect(await idsIn(page, 'A')).toEqual([b]);

  await dragTo(page, chip(page, a), drop(page, 'unranked'));
  expect(await idsIn(page, 'unranked')).toContain(a);
  expect(await idsIn(page, 'B')).toEqual([]);
});

test('4. tapping a chip shows its description', async ({ page }) => {
  const m = manifest[2];
  await chip(page, m.id).click();
  const dialog = page.getByTestId('concept-detail');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(m.name);
  await expect(dialog).toContainText(m.description);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('5. reset returns everything to the tray', async ({ page }) => {
  await dragTo(page, chip(page, manifest[0].id), drop(page, 'S'));
  await dragTo(page, chip(page, manifest[1].id), drop(page, 'C'));
  await page.getByTestId('reset').click();
  expect(await idsIn(page, 'unranked')).toEqual(manifest.map((m) => m.id));
  expect(await idsIn(page, 'S')).toEqual([]);
});

test('6. Download PNG produces a non-empty png', async ({ page }) => {
  await dragTo(page, chip(page, manifest[0].id), drop(page, 'S'));
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByTestId('download').click()]);
  expect(download.suggestedFilename()).toMatch(/\.png$/);
  const path = await download.path();
  expect(statSync(path).size).toBeGreaterThan(5_000);
  expect(readFileSync(path).subarray(1, 4).toString()).toBe('PNG');
});

test('7. ranking survives reload', async ({ page }) => {
  const id = manifest[3].id;
  await dragTo(page, chip(page, id), drop(page, 'B'));
  await page.reload();
  expect(await idsIn(page, 'B')).toEqual([id]);
});

test('8. mobile viewport has no page-level horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('9. save screenshots for visual comparison', async ({ page }) => {
  mkdirSync('tests/screens', { recursive: true });
  await page.screenshot({ path: 'tests/screens/desktop-empty.png' });
  await dragTo(page, chip(page, manifest[0].id), drop(page, 'S'));
  await dragTo(page, chip(page, manifest[1].id), drop(page, 'A'));
  await dragTo(page, chip(page, manifest[4].id), drop(page, 'B'));
  await page.screenshot({ path: 'tests/screens/desktop-ranked.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'tests/screens/mobile.png' });
});
