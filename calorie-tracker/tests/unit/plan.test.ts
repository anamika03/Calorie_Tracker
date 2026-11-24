import { describe, it, expect } from "vitest";
import { buildWeek, groceryList, matchesStock } from "@/lib/plan";
import { suggestFromStock, MIN_STOCK_RATIO } from "@/lib/recipes";
import { SLOTS } from "@/lib/meals";
import { addDays, dayKey } from "@/lib/date";

describe("buildWeek", () => {
  for (const target of [1800, 2400, 3200]) {
    it(`7 days × 4 slots, each day within ±10% of ${target} kcal`, () => {
      const week = buildWeek(target, "2026-11-24");
      expect(week).toHaveLength(28);
      for (let d = 0; d < 7; d++) {
        const day = addDays("2026-11-24", d);
        const meals = week.filter((m) => m.day === day);
        expect(meals.map((m) => m.slot)).toEqual(SLOTS);
        const total = meals.reduce((s, m) => s + m.kcal, 0);
        expect(Math.abs(total - target) / target).toBeLessThanOrEqual(0.1);
      }
    });
  }
  it("varies meals across days", () => {
    const week = buildWeek(2400, "2026-11-24");
    const lunches = new Set(week.filter((m) => m.slot === "lunch").map((m) => m.name));
    expect(lunches.size).toBeGreaterThan(1);
  });
});

describe("groceryList", () => {
  const meals = [
    { day: "d", slot: "lunch" as const, name: "x", kcal: 0, protein: 0, ingredients: [{ food: "Chicken breast", grams: 600 }, { food: "Spinach", grams: 100 }] },
    { day: "d", slot: "dinner" as const, name: "y", kcal: 0, protein: 0, ingredients: [{ food: "Chicken breast", grams: 600 }, { food: "Eggs", grams: 150 }] },
  ];
  it("aggregates ingredients", () => {
    const g = groceryList(meals, []);
    expect(g.find((l) => l.name === "Chicken breast")).toMatchObject({ qty: 1.2, unit: "kg" });
  });
  it("subtracts stock in grams/kg and drops piece-counted items", () => {
    const g = groceryList(meals, [{ name: "chicken breast", qty: 1, unit: "kg" }, { name: "Eggs", qty: 12, unit: "pcs" }, { name: "Spinach", qty: 200, unit: "g" }]);
    expect(g.map((l) => l.name)).toEqual(["Chicken breast"]);
    expect(g[0]).toMatchObject({ qty: 200, unit: "g" });
  });
  it("groups by category", () => {
    const g = groceryList(meals, []);
    expect(g.map((l) => l.category)).toEqual(["Protein", "Protein", "Produce"]);
  });
});

describe("recipes from stock", () => {
  it("only suggests recipes with ≥70% ingredients in stock", () => {
    const stock = ["Greek yogurt", "Oats", "Blueberries", "Honey", "Cottage cheese", "Apple", "Peanut butter", "Almonds"].map((name) => ({ name, qty: 1, unit: "pcs" }));
    const r = suggestFromStock(stock);
    expect(r.length).toBeGreaterThanOrEqual(3);
    for (const x of r) expect(x.stockRatio).toBeGreaterThanOrEqual(MIN_STOCK_RATIO);
  });
  it("returns nothing for an empty pantry", () => expect(suggestFromStock([])).toEqual([]));
  it("matches stock names loosely", () => {
    expect(matchesStock("Chicken breast", "chicken")).toBe(true);
    expect(matchesStock("Chicken breast", "beef")).toBe(false);
  });
});

describe("dayKey", () => {
  it("uses the local calendar day", () => {
    expect(dayKey(new Date(2026, 10, 24, 23, 59))).toBe("2026-11-24");
    expect(dayKey(new Date(2026, 10, 25, 0, 1))).toBe("2026-11-25");
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
  });
});
