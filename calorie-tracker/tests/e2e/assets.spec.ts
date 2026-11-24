import { test, expect } from "@playwright/test";

test("every image on the dashboard loads", async ({ page }) => {
  const failed: string[] = [];
  page.on("response", (r) => { if (r.request().resourceType() === "image" && r.status() >= 400) failed.push(r.url()); });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const imgs = page.locator("img");
  const count = await imgs.count();
  for (let i = 0; i < count; i++) {
    expect(await imgs.nth(i).evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
  expect(failed).toEqual([]);
});
