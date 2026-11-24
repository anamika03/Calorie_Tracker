import { TEMPLATES, templateMacros, type MealTemplate } from "./meals";
import { matchesStock, stockRatio, type StockLike } from "./plan";

export interface Recipe {
  name: string;
  slot: MealTemplate["slot"];
  ingredients: { food: string; grams: number; inStock: boolean }[];
  steps: string[];
  kcal: number;
  protein: number;
  stockRatio: number;
  source: "library" | "claude";
}

export const MIN_STOCK_RATIO = 0.7;

/** Recipes from the built-in library that use ≥70% ingredients already in stock. */
export function suggestFromStock(stock: StockLike[]): Recipe[] {
  return TEMPLATES.map((t) => {
    const m = templateMacros(t.ingredients);
    return {
      name: t.name,
      slot: t.slot,
      steps: t.steps,
      ingredients: t.ingredients.map((i) => ({ ...i, inStock: stock.some((s) => matchesStock(i.food, s.name)) })),
      kcal: m.kcal,
      protein: m.protein,
      stockRatio: stockRatio(t.ingredients, stock),
      source: "library" as const,
    };
  })
    .filter((r) => r.stockRatio >= MIN_STOCK_RATIO)
    .sort((a, b) => b.stockRatio - a.stockRatio || b.protein - a.protein);
}
