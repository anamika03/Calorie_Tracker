import { test, expect } from "@playwright/test";
import { ensureProfile, num } from "./helpers";

test("new user is sent to onboarding, then sees the dashboard with bulk targets", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/onboarding/);
  await ensureProfile(page);
  await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening|night), Test1/ })).toBeVisible();
  // 80 kg, 180 cm, 30 y male, moderate, bulk → round(1780 × 1.55 + 300) = 3059 kcal, 160 g protein
  expect(num(await page.getByTestId("target").textContent())).toBe(3059);
  await expect(page.getByTestId("protein")).toHaveText("0 / 160 g");
  await expect(page.getByText("Ready when you are! Log your first meal")).toBeVisible();
  await expect(page.getByTestId("meal-count")).toHaveText("0 meals");
});
