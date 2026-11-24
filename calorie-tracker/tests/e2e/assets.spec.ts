import { test, expect } from "@playwright/test";
import { ensureProfile } from "./helpers";

test("every image on the dashboard loads", async ({ page }) => {
  await ensureProfile(page);
  const failed: string[] = [];
  page.on("response", (r) => { if (r.request().resourceType() === "image" && r.status() >= 400) failed.push(r.url()); });
  await page.reload();
  await page.waitForLoadState("load");
  const imgs = page.locator("img");
  const count = await imgs.count();
  expect(count).toBeGreaterThan(10);
  for (let i = 0; i < count; i++) {
    await imgs.nth(i).scrollIntoViewIfNeeded();
    await expect.poll(() => imgs.nth(i).evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
  expect(failed).toEqual([]);
});
