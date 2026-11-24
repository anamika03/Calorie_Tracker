import { test, expect } from "@playwright/test";
import { ensureProfile } from "./helpers";

for (const route of ["/", "/onboarding", "/log", "/meals", "/burned", "/stock", "/plan", "/recipes"]) {
  test(`no console errors on ${route}`, async ({ page }) => {
    await ensureProfile(page);
    const errors: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto(route);
    expect(res?.status()).toBeLessThan(400);
    await page.waitForLoadState("load");
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });
}
