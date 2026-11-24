import { test, expect } from "@playwright/test";
import { ensureProfile } from "./helpers";

test("stock CRUD and receipt scan (mocked Claude)", async ({ page }) => {
  await ensureProfile(page);
  await page.getByRole("link", { name: "Scan bill" }).click();
  await page.getByLabel("Item name").fill("Oats");
  await page.getByLabel("Quantity").fill("1");
  await page.getByLabel("Unit").selectOption("kg");
  await page.getByRole("button", { name: "Add to stock" }).click();
  await expect(page.getByTestId("stock-row").filter({ hasText: "Oats" })).toBeVisible();

  await page.locator('input[name="image"]').setInputFiles("public/images/scan-bill.png");
  await page.getByRole("button", { name: "Scan receipt" }).click();
  await expect(page.getByTestId("receipt-results")).toBeVisible();
  await page.getByRole("button", { name: /Add 4 items to stock/ }).click();
  for (const n of ["Chicken breast", "Greek yogurt", "Blueberries", "Eggs"]) await expect(page.getByTestId("stock-row").filter({ hasText: n })).toBeVisible();

  await page.getByRole("button", { name: "Remove Eggs" }).click();
  await expect(page.getByTestId("stock-row").filter({ hasText: "Eggs" })).toHaveCount(0);
});

test("plan week generates 7 days and a grocery list; Up next shows today's meals", async ({ page }) => {
  await ensureProfile(page);
  await page.goto("/plan");
  await page.getByRole("button", { name: /Generate|Regenerate/ }).click();
  await expect(page.getByTestId("plan-day")).toHaveCount(7);
  await expect(page.getByTestId("grocery-list")).toBeVisible();

  await page.goto("/");
  const logBtns = page.getByRole("button", { name: "Log as eaten" });
  const count = await logBtns.count();
  expect(count).toBeGreaterThan(0);
  const mealsBefore = await page.getByTestId("meal-count").textContent();
  await logBtns.first().click();
  await expect(page.getByRole("button", { name: "Log as eaten" })).toHaveCount(count - 1);
  await expect(page.getByTestId("meal-count")).not.toHaveText(mealsBefore!);
});

test("recipes use stock and can be logged", async ({ page }) => {
  await ensureProfile(page);
  await page.goto("/stock");
  for (const n of ["Honey", "Cottage cheese", "Apple", "Peanut butter", "Almonds"]) {
    await page.getByLabel("Item name").fill(n);
    await page.getByRole("button", { name: "Add to stock" }).click();
    await expect(page.getByTestId("stock-row").filter({ hasText: n })).toBeVisible();
  }
  await page.goto("/recipes");
  expect(await page.getByTestId("recipe-card").count()).toBeGreaterThanOrEqual(3);
  await page.getByRole("button", { name: /Ask Claude/ }).click();
  await expect(page.getByTestId("ai-recipe-card")).toHaveCount(1);
  await page.getByTestId("recipe-card").first().getByRole("button", { name: "Log as eaten" }).click();
  await page.goto("/meals");
  expect(await page.getByTestId("meal-row").count()).toBeGreaterThan(0);
});
