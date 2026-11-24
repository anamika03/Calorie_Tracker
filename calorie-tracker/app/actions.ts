"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as data from "@/lib/data";
import { dayKey } from "@/lib/date";
import { findFood, macrosFor } from "@/lib/foods";
import { SLOTS, type Slot } from "@/lib/meals";
import { buildWeek, groceryList } from "@/lib/plan";
import { analyzeMeal, scanReceipt, suggestRecipes, AiUnavailableError, type MealItem, type ReceiptItem, type AiRecipe } from "@/lib/ai";
import type { Activity, Sex, Tier } from "@/lib/targets";

const num = (v: FormDataEntryValue | null, min = 0) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n < min) throw new Error("Invalid number");
  return n;
};
const str = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const slot = (v: FormDataEntryValue | null): Slot => {
  const s = str(v) as Slot;
  return SLOTS.includes(s) ? s : "snack";
};
const refreshAll = () => revalidatePath("/", "layout");

// ----- profile -----
export async function saveProfileAction(form: FormData) {
  const name = str(form.get("name"));
  if (!name) throw new Error("Name is required");
  data.saveProfile({
    name,
    sex: (str(form.get("sex")) as Sex) || "male",
    age: num(form.get("age"), 10),
    heightCm: num(form.get("heightCm"), 100),
    weightKg: num(form.get("weightKg"), 30),
    activity: (str(form.get("activity")) as Activity) || "moderate",
    tier: (str(form.get("tier")) as Tier) || "maintain",
  });
  refreshAll();
  redirect("/");
}

// ----- meals -----
export async function logFoodAction(form: FormData) {
  const food = findFood(str(form.get("food")));
  if (!food) throw new Error("Unknown food");
  const grams = num(form.get("grams"), 1);
  const m = macrosFor(food, grams);
  data.addMeal({ day: dayKey(), slot: slot(form.get("slot")), name: food.name, grams, ...m });
  refreshAll();
  redirect("/");
}

export async function logCustomAction(form: FormData) {
  const name = str(form.get("name"));
  if (!name) throw new Error("Name is required");
  data.addMeal({
    day: dayKey(), slot: slot(form.get("slot")), name, grams: null,
    kcal: Math.round(num(form.get("kcal"))), protein: num(form.get("protein") || "0"),
  });
  refreshAll();
  redirect("/");
}

export async function updateMealAction(form: FormData) {
  const id = num(form.get("id"), 1);
  const existing = data.getMeal(id);
  if (!existing) throw new Error("Meal not found");
  data.updateMeal(id, {
    name: str(form.get("name")) || existing.name,
    slot: slot(form.get("slot")),
    grams: existing.grams,
    kcal: Math.round(num(form.get("kcal"))),
    protein: num(form.get("protein") || "0"),
  });
  refreshAll();
  redirect("/meals");
}

export async function deleteMealAction(form: FormData) {
  data.deleteMeal(num(form.get("id"), 1));
  refreshAll();
}

export async function logPhotoItemsAction(items: MealItem[], s: Slot) {
  for (const i of items) {
    if (!i.name.trim() || !(i.kcal >= 0)) continue;
    data.addMeal({ day: dayKey(), slot: SLOTS.includes(s) ? s : "snack", name: i.name.trim(), grams: i.grams || null, kcal: Math.round(i.kcal), protein: Math.round(i.protein * 10) / 10 });
  }
  refreshAll();
}

// ----- water & burned -----
export async function addWaterAction(form: FormData) {
  data.addWater(num(form.get("ml"), 1));
  refreshAll();
}
export async function undoWaterAction() {
  data.undoWater();
  refreshAll();
}
export async function setBurnedAction(form: FormData) {
  data.setBurned(Math.round(num(form.get("kcal"))));
  refreshAll();
  redirect("/");
}

// ----- stock -----
export async function addStockAction(form: FormData) {
  const name = str(form.get("name"));
  if (!name) throw new Error("Name is required");
  data.upsertStock(name, num(form.get("qty")), str(form.get("unit")) || "pcs");
  refreshAll();
}
export async function updateStockAction(form: FormData) {
  data.updateStock(num(form.get("id"), 1), num(form.get("qty")), str(form.get("unit")) || "pcs");
  refreshAll();
}
export async function deleteStockAction(form: FormData) {
  data.deleteStock(num(form.get("id"), 1));
  refreshAll();
}
export async function confirmReceiptAction(items: ReceiptItem[]) {
  for (const i of items) if (i.name.trim() && i.qty > 0) data.upsertStock(i.name, i.qty, i.unit);
  refreshAll();
}

// ----- AI (image upload) -----
type ImageType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
const IMAGE_TYPES: ImageType[] = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

async function readImage(form: FormData) {
  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) throw new Error("Please choose an image.");
  if (!IMAGE_TYPES.includes(file.type as ImageType)) throw new Error("Use a JPG, PNG, GIF or WebP image.");
  if (file.size > MAX_BYTES) throw new Error("Image is larger than 5 MB.");
  return { data: Buffer.from(await file.arrayBuffer()).toString("base64"), mediaType: file.type as ImageType };
}

type Result<T> = { ok: true; items: T } | { ok: false; error: string };
const fail = (e: unknown) => ({ ok: false as const, error: e instanceof AiUnavailableError || e instanceof Error ? e.message : "Something went wrong." });

export async function analyzeMealAction(form: FormData): Promise<Result<MealItem[]>> {
  try {
    const img = await readImage(form);
    return { ok: true, items: await analyzeMeal(img.data, img.mediaType) };
  } catch (e) { return fail(e); }
}

export async function scanReceiptAction(form: FormData): Promise<Result<ReceiptItem[]>> {
  try {
    const img = await readImage(form);
    return { ok: true, items: await scanReceipt(img.data, img.mediaType) };
  } catch (e) { return fail(e); }
}

export async function aiRecipesAction(): Promise<Result<AiRecipe[]>> {
  try {
    const p = data.getProfile();
    const t = p ? data.getTargets(p) : { protein: 130 };
    return { ok: true, items: await suggestRecipes(data.listStock(), t.protein) };
  } catch (e) { return fail(e); }
}

// ----- plan -----
export async function generatePlanAction() {
  const p = data.getProfile();
  if (!p) redirect("/onboarding");
  const stock = data.listStock();
  const meals = buildWeek(data.getTargets(p).kcal, dayKey(), stock);
  data.replacePlan(meals, groceryList(meals, stock));
  refreshAll();
}

export async function toggleGroceryAction(form: FormData) {
  data.toggleGrocery(num(form.get("id"), 1));
  refreshAll();
}

export async function logPlannedAction(form: FormData) {
  const m = data.getPlanned(num(form.get("id"), 1));
  if (!m || m.logged) return;
  data.addMeal({ day: dayKey(), slot: m.slot, name: m.name, grams: null, kcal: m.kcal, protein: m.protein });
  data.markPlannedLogged(m.id);
  refreshAll();
}

export async function recipeToPlanAction(form: FormData) {
  const recipe = JSON.parse(str(form.get("recipe"))) as { name: string; slot: Slot; kcal: number; protein: number; ingredients: { food: string; grams: number }[] };
  data.addPlanned({ day: dayKey(), slot: recipe.slot, name: recipe.name, kcal: Math.round(recipe.kcal), protein: Math.round(recipe.protein), ingredients: recipe.ingredients.map(({ food, grams }) => ({ food, grams })) });
  refreshAll();
}

export async function recipeLogAction(form: FormData) {
  const recipe = JSON.parse(str(form.get("recipe"))) as { name: string; slot: Slot; kcal: number; protein: number };
  data.addMeal({ day: dayKey(), slot: recipe.slot, name: recipe.name, grams: null, kcal: Math.round(recipe.kcal), protein: Math.round(recipe.protein) });
  refreshAll();
}
