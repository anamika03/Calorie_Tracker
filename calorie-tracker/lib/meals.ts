import { findFood, macrosFor, type Category } from "./foods";

export type Slot = "breakfast" | "lunch" | "dinner" | "snack";
export const SLOTS: Slot[] = ["breakfast", "lunch", "dinner", "snack"];
export const SLOT_LABELS: Record<Slot, string> = {
  breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack",
};
/** Share of daily kcal per slot. */
export const SLOT_SHARE: Record<Slot, number> = { breakfast: 0.25, lunch: 0.3, dinner: 0.33, snack: 0.12 };

export interface Ingredient { food: string; grams: number }
export interface MealTemplate { name: string; slot: Slot; ingredients: Ingredient[]; steps: string[] }
export interface Ing extends Ingredient { category: Category }

export const TEMPLATES: MealTemplate[] = [
  // Breakfast
  { name: "Greek Yogurt & Oats with blueberries", slot: "breakfast",
    ingredients: [{ food: "Greek yogurt", grams: 250 }, { food: "Oats", grams: 60 }, { food: "Blueberries", grams: 80 }, { food: "Honey", grams: 10 }],
    steps: ["Spoon yogurt into a bowl.", "Top with oats and blueberries.", "Drizzle with honey."] },
  { name: "Veggie omelette with toast", slot: "breakfast",
    ingredients: [{ food: "Eggs", grams: 150 }, { food: "Spinach", grams: 50 }, { food: "Bell pepper", grams: 60 }, { food: "Whole wheat bread", grams: 60 }],
    steps: ["Whisk eggs.", "Sauté spinach and pepper, pour eggs over and cook through.", "Serve with toast."] },
  { name: "Protein oats with banana & peanut butter", slot: "breakfast",
    ingredients: [{ food: "Oats", grams: 70 }, { food: "Milk", grams: 250 }, { food: "Whey protein", grams: 30 }, { food: "Banana", grams: 100 }, { food: "Peanut butter", grams: 15 }],
    steps: ["Cook oats in milk.", "Stir in whey off the heat.", "Top with sliced banana and peanut butter."] },
  { name: "Cottage cheese toast with tomato", slot: "breakfast",
    ingredients: [{ food: "Whole wheat bread", grams: 80 }, { food: "Cottage cheese", grams: 200 }, { food: "Tomato", grams: 100 }],
    steps: ["Toast the bread.", "Spread cottage cheese.", "Top with sliced tomato, salt and pepper."] },
  // Lunch
  { name: "Chicken Breast with sweet potato & spinach", slot: "lunch",
    ingredients: [{ food: "Chicken breast", grams: 180 }, { food: "Sweet potato", grams: 250 }, { food: "Spinach", grams: 80 }, { food: "Olive oil", grams: 8 }],
    steps: ["Roast sweet potato cubes 25 min at 200 °C.", "Pan-sear seasoned chicken.", "Wilt spinach in the pan and serve together."] },
  { name: "Tuna quinoa salad", slot: "lunch",
    ingredients: [{ food: "Tuna (canned)", grams: 150 }, { food: "Quinoa", grams: 200 }, { food: "Cucumber", grams: 100 }, { food: "Tomato", grams: 100 }, { food: "Olive oil", grams: 10 }],
    steps: ["Cook and cool quinoa.", "Chop veg.", "Toss with tuna and olive oil."] },
  { name: "Turkey & hummus wrap", slot: "lunch",
    ingredients: [{ food: "Tortilla wrap", grams: 70 }, { food: "Turkey mince", grams: 150 }, { food: "Hummus", grams: 40 }, { food: "Mixed salad leaves", grams: 50 }],
    steps: ["Brown the turkey with spices.", "Spread hummus on the wrap.", "Fill with turkey and leaves, roll up."] },
  { name: "Chickpea & feta bowl", slot: "lunch",
    ingredients: [{ food: "Chickpeas", grams: 200 }, { food: "Feta cheese", grams: 50 }, { food: "Cucumber", grams: 100 }, { food: "Brown rice", grams: 150 }, { food: "Olive oil", grams: 8 }],
    steps: ["Warm rice.", "Top with chickpeas, cucumber and crumbled feta.", "Dress with olive oil and lemon."] },
  // Dinner
  { name: "Lentils with brown rice & bell pepper", slot: "dinner",
    ingredients: [{ food: "Lentils", grams: 250 }, { food: "Brown rice", grams: 200 }, { food: "Bell pepper", grams: 120 }, { food: "Onion", grams: 60 }, { food: "Olive oil", grams: 10 }],
    steps: ["Sauté onion and pepper.", "Add cooked lentils and spices, simmer 10 min.", "Serve over rice."] },
  { name: "Salmon with potatoes & broccoli", slot: "dinner",
    ingredients: [{ food: "Salmon", grams: 180 }, { food: "Potato", grams: 250 }, { food: "Broccoli", grams: 150 }],
    steps: ["Bake salmon 12–15 min at 200 °C.", "Boil potatoes.", "Steam broccoli and serve."] },
  { name: "Beef & broccoli rice bowl", slot: "dinner",
    ingredients: [{ food: "Lean beef mince", grams: 160 }, { food: "White rice", grams: 200 }, { food: "Broccoli", grams: 150 }, { food: "Onion", grams: 50 }],
    steps: ["Brown the beef with onion.", "Add broccoli and a splash of soy sauce.", "Serve over rice."] },
  { name: "Tofu stir-fry with quinoa", slot: "dinner",
    ingredients: [{ food: "Tofu", grams: 200 }, { food: "Quinoa", grams: 200 }, { food: "Bell pepper", grams: 100 }, { food: "Broccoli", grams: 100 }, { food: "Olive oil", grams: 10 }],
    steps: ["Press and cube tofu, fry until golden.", "Stir-fry veg.", "Combine and serve over quinoa."] },
  { name: "Chicken pasta with spinach", slot: "dinner",
    ingredients: [{ food: "Chicken breast", grams: 160 }, { food: "Whole wheat pasta", grams: 220 }, { food: "Spinach", grams: 80 }, { food: "Tomato", grams: 150 }],
    steps: ["Cook pasta.", "Sear chicken strips, add tomato and spinach.", "Toss with pasta."] },
  // Snack
  { name: "Cottage Cheese + blueberries", slot: "snack",
    ingredients: [{ food: "Cottage cheese", grams: 250 }, { food: "Blueberries", grams: 100 }],
    steps: ["Top cottage cheese with blueberries."] },
  { name: "Apple with peanut butter", slot: "snack",
    ingredients: [{ food: "Apple", grams: 180 }, { food: "Peanut butter", grams: 25 }],
    steps: ["Slice the apple and dip in peanut butter."] },
  { name: "Protein shake & banana", slot: "snack",
    ingredients: [{ food: "Whey protein", grams: 30 }, { food: "Milk", grams: 250 }, { food: "Banana", grams: 100 }],
    steps: ["Blend whey, milk and banana."] },
  { name: "Greek yogurt with almonds", slot: "snack",
    ingredients: [{ food: "Greek yogurt", grams: 200 }, { food: "Almonds", grams: 20 }],
    steps: ["Top yogurt with almonds."] },
];

export function templateMacros(ingredients: Ingredient[]) {
  let kcal = 0, protein = 0;
  for (const i of ingredients) {
    const f = findFood(i.food);
    if (!f) continue;
    const m = macrosFor(f, i.grams);
    kcal += m.kcal; protein += m.protein;
  }
  return { kcal: Math.round(kcal), protein: Math.round(protein) };
}

export function scaleIngredients(ingredients: Ingredient[], factor: number): Ingredient[] {
  return ingredients.map((i) => ({ food: i.food, grams: Math.round((i.grams * factor) / 5) * 5 }));
}
