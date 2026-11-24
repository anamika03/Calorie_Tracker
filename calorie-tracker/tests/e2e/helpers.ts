import { expect, type Page } from "@playwright/test";

export async function ensureProfile(page: Page, name = "Test1") {
  await page.goto("/");
  if (page.url().includes("/onboarding")) {
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Age").fill("30");
    await page.getByLabel("Height (cm)").fill("180");
    await page.getByLabel("Weight (kg)").fill("80");
    await page.getByRole("radio", { name: /Bulk/ }).check({ force: true });
    await page.getByRole("button", { name: /start tracking|save/i }).click();
    await expect(page).toHaveURL(/\/$/);
  }
}

export const num = (s: string | null) => Number((s ?? "").replace(/[^\d-]/g, ""));
