import { addDays } from "./date";
import { findFood, type Category } from "./foods";
import { SLOTS, SLOT_SHARE, TEMPLATES, scaleIngredients, templateMacros, type Ingredient, type Slot } from "./meals";

export interface PlannedMealInput {
  day: string; slot: Slot; name: string; kcal: number; protein: number; ingredients: Ingredient[];
}
export interface StockLike { name: string; qty: number; unit: string }
export interface GroceryLine { name: string; qty: number; unit: string; category: Category }

/** Does a stock item name refer to this food? */
export function matchesStock(food: string, stockName: string): boolean {
  const a = food.toLowerCase(), b = stockName.toLowerCase().trim();
  if (!b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

/** Build a 7-day plan, scaling each meal so every day lands on the kcal target. */
export function buildWeek(targetKcal: number, startDay: string, stock: StockLike[] = []): PlannedMealInput[] {
  const out: PlannedMealInput[] = [];
  for (let d = 0; d < 7; d++) {
    const day = addDays(startDay, d);
    for (const slot of SLOTS) {
      const options = TEMPLATES.filter((t) => t.slot === slot);
      // Prefer meals that use what's already in stock, then rotate for variety.
      const ranked = options
        .map((t, i) => ({ t, i, score: stockRatio(t.ingredients, stock) }))
        .sort((x, y) => y.score - x.score || x.i - y.i);
      const t = ranked[(d + ranked.length) % ranked.length].t;
      const base = templateMacros(t.ingredients);
      const factor = (targetKcal * SLOT_SHARE[slot]) / base.kcal;
      const ingredients = scaleIngredients(t.ingredients, factor);
      const m = templateMacros(ingredients);
      out.push({ day, slot, name: t.name, kcal: m.kcal, protein: m.protein, ingredients });
    }
  }
  return out;
}

export function stockRatio(ingredients: Ingredient[], stock: StockLike[]): number {
  if (!ingredients.length) return 0;
  const have = ingredients.filter((i) => stock.some((s) => matchesStock(i.food, s.name))).length;
  return have / ingredients.length;
}

function toGrams(qty: number, unit: string): number | null {
  const u = unit.toLowerCase();
  if (u === "g" || u === "ml") return qty;
  if (u === "kg" || u === "l") return qty * 1000;
  return null; // pieces/packs: treated as fully in stock
}

/** Planned ingredients minus what's already in stock, grouped by category. */
export function groceryList(meals: PlannedMealInput[], stock: StockLike[]): GroceryLine[] {
  const need = new Map<string, number>();
  for (const m of meals) for (const i of m.ingredients) need.set(i.food, (need.get(i.food) ?? 0) + i.grams);

  const lines: GroceryLine[] = [];
  for (const [food, grams] of need) {
    const s = stock.find((x) => matchesStock(food, x.name));
    let remaining = grams;
    if (s) {
      const have = toGrams(s.qty, s.unit);
      remaining = have === null ? 0 : grams - have;
    }
    if (remaining > 0) {
      const qty = remaining >= 1000 ? Math.round(remaining / 100) / 10 : Math.round(remaining / 10) * 10;
      lines.push({ name: food, qty, unit: remaining >= 1000 ? "kg" : "g", category: findFood(food)?.category ?? "Pantry" });
    }
  }
  const order: Category[] = ["Protein", "Dairy", "Produce", "Grains", "Pantry", "Snacks"];
  return lines.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category) || a.name.localeCompare(b.name));
}
