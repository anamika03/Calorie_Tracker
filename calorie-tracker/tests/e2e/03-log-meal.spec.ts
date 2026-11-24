import { test, expect } from "@playwright/test";
import { ensureProfile, num } from "./helpers";

test("logging a 500 kcal meal reduces kcal-left by exactly 500; edit and delete update totals", async ({ page }) => {
  await ensureProfile(page);
  const before = num(await page.getByTestId("kcal-left").textContent());
  const eatenBefore = num(await page.getByTestId("eaten").textContent());

  await page.getByRole("link", { name: "Log meal" }).click();
  await page.getByRole("button", { name: "Custom" }).click();
  await page.getByLabel("What did you eat?").fill("Test burrito");
  await page.getByLabel("Calories (kcal)").fill("500");
  await page.getByLabel("Protein (g)").fill("30");
  await page.getByRole("button", { name: /Add to/ }).click();
  await expect(page).toHaveURL(/\/$/);

  expect(num(await page.getByTestId("kcal-left").textContent())).toBe(before - 500);
  expect(num(await page.getByTestId("eaten").textContent())).toBe(eatenBefore + 500);

  // food search: 200 g chicken breast = 330 kcal
  await page.getByRole("link", { name: "Log meal" }).click();
  await page.getByPlaceholder(/Search foods/).fill("chicken");
  await page.getByRole("button", { name: /Chicken breast/ }).click();
  await page.getByRole("button", { name: "200", exact: true }).click();
  await expect(page.getByTestId("preview-kcal")).toHaveText("330");
  await page.getByRole("button", { name: /Add to/ }).click();
  expect(num(await page.getByTestId("kcal-left").textContent())).toBe(before - 830);

  // edit the burrito to 400 kcal
  await page.getByTestId("meal-count").click();
  const row = page.getByTestId("meal-row").filter({ hasText: "Test burrito" });
  await row.getByRole("link", { name: "Edit" }).click();
  await page.getByLabel("Calories (kcal)").fill("400");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByTestId("meal-row").filter({ hasText: "Test burrito" })).toContainText("400 kcal");

  // delete it
  await page.getByRole("button", { name: "Delete Test burrito" }).click();
  await expect(page.getByTestId("meal-row").filter({ hasText: "Test burrito" })).toHaveCount(0);
  await page.goto("/");
  expect(num(await page.getByTestId("kcal-left").textContent())).toBe(before - 330);
});

test("photo logging (mocked Claude) saves the confirmed items", async ({ page }) => {
  await ensureProfile(page);
  const before = num(await page.getByTestId("eaten").textContent());
  await page.goto("/log");
  await page.getByRole("button", { name: "Photo" }).click();
  await page.locator('input[type="file"]').setInputFiles("public/images/lunch.png");
  await page.getByRole("button", { name: "Analyze photo" }).click();
  await expect(page.getByTestId("photo-results")).toBeVisible();
  await page.getByRole("button", { name: /Save 509 kcal/ }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(num(await page.getByTestId("eaten").textContent())).toBe(before + 509);
});
