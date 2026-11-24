import { test, expect } from "@playwright/test";
import { ensureProfile } from "./helpers";

test("water buttons add to the total and undo removes the last entry", async ({ page }) => {
  await ensureProfile(page);
  const card = page.getByTestId("water-card");
  await expect(card.getByTestId("water-total")).toHaveText("0.00");
  await card.getByRole("button", { name: "+250 ml" }).click();
  await expect(card.getByTestId("water-total")).toHaveText("0.25");
  await card.getByRole("button", { name: "+500 ml" }).click();
  await expect(card.getByTestId("water-total")).toHaveText("0.75");
  await card.getByRole("button", { name: "Undo" }).click();
  await expect(card.getByTestId("water-total")).toHaveText("0.25");
});
