import { test, expect } from "@playwright/test";
import { ensureProfile } from "./helpers";

test("dashboard shows all mockup sections", async ({ page }) => {
  await ensureProfile(page);
  await expect(page.getByTestId("today-card")).toBeVisible();
  for (const label of ["Target", "Eaten", "Burned", "Protein"]) await expect(page.getByTestId("today-card").getByText(label, { exact: true })).toBeVisible();
  for (const q of ["Log meal", "Scan bill", "Plan week", "Recipes"]) await expect(page.getByRole("link", { name: q })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Up next" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Full week/ })).toHaveAttribute("href", "/plan");
  await page.screenshot({ path: "test-results/dashboard.png", fullPage: true });
});
