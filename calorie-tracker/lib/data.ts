import "server-only";
import { db } from "./db";
import { dayKey } from "./date";
import { targets, type Activity, type Sex, type Tier } from "./targets";
import type { Ingredient, Slot } from "./meals";

export interface Profile {
  name: string; sex: Sex; age: number; heightCm: number; weightKg: number; activity: Activity; tier: Tier;
}
export interface MealLog { id: number; day: string; slot: Slot; name: string; grams: number | null; kcal: number; protein: number }
export interface StockItem { id: number; name: string; qty: number; unit: string }
export interface PlannedMeal { id: number; day: string; slot: Slot; name: string; kcal: number; protein: number; ingredients: Ingredient[]; logged: boolean }
export interface GroceryItem { id: number; name: string; qty: number; unit: string; category: string; checked: boolean }

type Row = Record<string, unknown>;

export function getProfile(): Profile | null {
  const r = db().prepare("SELECT * FROM profile WHERE id = 1").get() as Row | undefined;
  if (!r) return null;
  return {
    name: r.name as string, sex: r.sex as Sex, age: r.age as number, heightCm: r.height_cm as number,
    weightKg: r.weight_kg as number, activity: r.activity as Activity, tier: r.tier as Tier,
  };
}

export function saveProfile(p: Profile) {
  db().prepare(`INSERT INTO profile (id, name, sex, age, height_cm, weight_kg, activity, tier)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, sex=excluded.sex, age=excluded.age,
      height_cm=excluded.height_cm, weight_kg=excluded.weight_kg, activity=excluded.activity, tier=excluded.tier`)
    .run(p.name, p.sex, p.age, p.heightCm, p.weightKg, p.activity, p.tier);
}

export function getTargets(p: Profile) {
  return targets(p);
}

// ----- meals -----
export function mealsForDay(day = dayKey()): MealLog[] {
  return db().prepare("SELECT id, day, slot, name, grams, kcal, protein FROM meal_log WHERE day = ? ORDER BY id").all(day) as unknown as MealLog[];
}
export function addMeal(m: Omit<MealLog, "id">) {
  db().prepare("INSERT INTO meal_log (day, slot, name, grams, kcal, protein) VALUES (?, ?, ?, ?, ?, ?)")
    .run(m.day, m.slot, m.name, m.grams, m.kcal, m.protein);
}
export function updateMeal(id: number, m: Pick<MealLog, "name" | "slot" | "grams" | "kcal" | "protein">) {
  db().prepare("UPDATE meal_log SET name=?, slot=?, grams=?, kcal=?, protein=? WHERE id=?")
    .run(m.name, m.slot, m.grams, m.kcal, m.protein, id);
}
export function deleteMeal(id: number) {
  db().prepare("DELETE FROM meal_log WHERE id = ?").run(id);
}
export function getMeal(id: number): MealLog | undefined {
  return db().prepare("SELECT id, day, slot, name, grams, kcal, protein FROM meal_log WHERE id = ?").get(id) as unknown as MealLog | undefined;
}

// ----- water & burned -----
export function waterForDay(day = dayKey()): number {
  const r = db().prepare("SELECT COALESCE(SUM(ml), 0) AS total FROM water_log WHERE day = ?").get(day) as Row;
  return Number(r.total);
}
export function addWater(ml: number, day = dayKey()) {
  db().prepare("INSERT INTO water_log (day, ml) VALUES (?, ?)").run(day, ml);
}
export function undoWater(day = dayKey()) {
  db().prepare("DELETE FROM water_log WHERE id = (SELECT MAX(id) FROM water_log WHERE day = ?)").run(day);
}
export function burnedForDay(day = dayKey()): number | null {
  const r = db().prepare("SELECT kcal FROM burned_log WHERE day = ?").get(day) as Row | undefined;
  return r ? Number(r.kcal) : null;
}
export function setBurned(kcal: number, day = dayKey()) {
  db().prepare("INSERT INTO burned_log (day, kcal) VALUES (?, ?) ON CONFLICT(day) DO UPDATE SET kcal = excluded.kcal").run(day, kcal);
}

// ----- stock -----
export function listStock(): StockItem[] {
  return db().prepare("SELECT id, name, qty, unit FROM stock_item ORDER BY name COLLATE NOCASE").all() as unknown as StockItem[];
}
export function upsertStock(name: string, qty: number, unit: string) {
  db().prepare(`INSERT INTO stock_item (name, qty, unit) VALUES (?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET qty = CASE WHEN stock_item.unit = excluded.unit THEN stock_item.qty + excluded.qty ELSE excluded.qty END,
      unit = excluded.unit`).run(name.trim(), qty, unit);
}
export function updateStock(id: number, qty: number, unit: string) {
  db().prepare("UPDATE stock_item SET qty = ?, unit = ? WHERE id = ?").run(qty, unit, id);
}
export function deleteStock(id: number) {
  db().prepare("DELETE FROM stock_item WHERE id = ?").run(id);
}

// ----- plan & groceries -----
function toPlanned(r: Row): PlannedMeal {
  return {
    id: r.id as number, day: r.day as string, slot: r.slot as Slot, name: r.name as string,
    kcal: r.kcal as number, protein: r.protein as number,
    ingredients: JSON.parse(r.ingredients as string), logged: Boolean(r.logged),
  };
}
const SLOT_ORDER = "CASE slot WHEN 'breakfast' THEN 0 WHEN 'lunch' THEN 1 WHEN 'dinner' THEN 2 ELSE 3 END";
export function plannedForDay(day = dayKey()): PlannedMeal[] {
  return (db().prepare(`SELECT * FROM planned_meal WHERE day = ? ORDER BY ${SLOT_ORDER}`).all(day) as Row[]).map(toPlanned);
}
export function plannedFrom(day = dayKey()): PlannedMeal[] {
  return (db().prepare(`SELECT * FROM planned_meal WHERE day >= ? ORDER BY day, ${SLOT_ORDER}`).all(day) as Row[]).map(toPlanned);
}
export function getPlanned(id: number): PlannedMeal | undefined {
  const r = db().prepare("SELECT * FROM planned_meal WHERE id = ?").get(id) as Row | undefined;
  return r ? toPlanned(r) : undefined;
}
export function replacePlan(meals: Omit<PlannedMeal, "id" | "logged">[], groceries: Omit<GroceryItem, "id" | "checked">[]) {
  const d = db();
  d.exec("BEGIN");
  try {
    d.exec("DELETE FROM planned_meal; DELETE FROM grocery_item;");
    const pm = d.prepare("INSERT INTO planned_meal (day, slot, name, kcal, protein, ingredients) VALUES (?, ?, ?, ?, ?, ?)");
    for (const m of meals) pm.run(m.day, m.slot, m.name, m.kcal, m.protein, JSON.stringify(m.ingredients));
    const gi = d.prepare("INSERT INTO grocery_item (name, qty, unit, category) VALUES (?, ?, ?, ?)");
    for (const g of groceries) gi.run(g.name, g.qty, g.unit, g.category);
    d.exec("COMMIT");
  } catch (e) {
    d.exec("ROLLBACK");
    throw e;
  }
}
export function addPlanned(m: Omit<PlannedMeal, "id" | "logged">) {
  db().prepare("INSERT INTO planned_meal (day, slot, name, kcal, protein, ingredients) VALUES (?, ?, ?, ?, ?, ?)")
    .run(m.day, m.slot, m.name, m.kcal, m.protein, JSON.stringify(m.ingredients));
}
export function markPlannedLogged(id: number) {
  db().prepare("UPDATE planned_meal SET logged = 1 WHERE id = ?").run(id);
}
export function listGroceries(): GroceryItem[] {
  return (db().prepare("SELECT * FROM grocery_item ORDER BY checked, id").all() as Row[]).map((r) => ({
    id: r.id as number, name: r.name as string, qty: r.qty as number, unit: r.unit as string,
    category: r.category as string, checked: Boolean(r.checked),
  }));
}
export function toggleGrocery(id: number) {
  db().prepare("UPDATE grocery_item SET checked = 1 - checked WHERE id = ?").run(id);
}
