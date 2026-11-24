export type Category = "Protein" | "Dairy" | "Grains" | "Produce" | "Pantry" | "Snacks";

export interface Food {
  name: string;
  kcal: number;      // per 100 g
  protein: number;   // g per 100 g
  category: Category;
}

// Approximate values per 100 g (cooked where relevant).
export const FOODS: Food[] = [
  { name: "Chicken breast", kcal: 165, protein: 31, category: "Protein" },
  { name: "Turkey mince", kcal: 170, protein: 27, category: "Protein" },
  { name: "Lean beef mince", kcal: 215, protein: 26, category: "Protein" },
  { name: "Salmon", kcal: 208, protein: 20, category: "Protein" },
  { name: "Tuna (canned)", kcal: 116, protein: 26, category: "Protein" },
  { name: "Eggs", kcal: 143, protein: 13, category: "Protein" },
  { name: "Egg whites", kcal: 52, protein: 11, category: "Protein" },
  { name: "Tofu", kcal: 144, protein: 17, category: "Protein" },
  { name: "Paneer", kcal: 296, protein: 20, category: "Protein" },
  { name: "Lentils", kcal: 116, protein: 9, category: "Protein" },
  { name: "Chickpeas", kcal: 164, protein: 9, category: "Protein" },
  { name: "Black beans", kcal: 132, protein: 9, category: "Protein" },
  { name: "Whey protein", kcal: 400, protein: 80, category: "Protein" },
  { name: "Greek yogurt", kcal: 97, protein: 9, category: "Dairy" },
  { name: "Cottage cheese", kcal: 98, protein: 11, category: "Dairy" },
  { name: "Milk", kcal: 64, protein: 3.4, category: "Dairy" },
  { name: "Cheddar cheese", kcal: 403, protein: 25, category: "Dairy" },
  { name: "Feta cheese", kcal: 264, protein: 14, category: "Dairy" },
  { name: "Oats", kcal: 389, protein: 17, category: "Grains" },
  { name: "Brown rice", kcal: 123, protein: 2.7, category: "Grains" },
  { name: "White rice", kcal: 130, protein: 2.7, category: "Grains" },
  { name: "Quinoa", kcal: 120, protein: 4.4, category: "Grains" },
  { name: "Whole wheat pasta", kcal: 149, protein: 6, category: "Grains" },
  { name: "Whole wheat bread", kcal: 247, protein: 13, category: "Grains" },
  { name: "Tortilla wrap", kcal: 306, protein: 8, category: "Grains" },
  { name: "Sweet potato", kcal: 86, protein: 1.6, category: "Produce" },
  { name: "Potato", kcal: 77, protein: 2, category: "Produce" },
  { name: "Broccoli", kcal: 34, protein: 2.8, category: "Produce" },
  { name: "Spinach", kcal: 23, protein: 2.9, category: "Produce" },
  { name: "Bell pepper", kcal: 31, protein: 1, category: "Produce" },
  { name: "Tomato", kcal: 18, protein: 0.9, category: "Produce" },
  { name: "Cucumber", kcal: 15, protein: 0.7, category: "Produce" },
  { name: "Onion", kcal: 40, protein: 1.1, category: "Produce" },
  { name: "Avocado", kcal: 160, protein: 2, category: "Produce" },
  { name: "Banana", kcal: 89, protein: 1.1, category: "Produce" },
  { name: "Apple", kcal: 52, protein: 0.3, category: "Produce" },
  { name: "Blueberries", kcal: 57, protein: 0.7, category: "Produce" },
  { name: "Strawberries", kcal: 32, protein: 0.7, category: "Produce" },
  { name: "Mixed salad leaves", kcal: 17, protein: 1.4, category: "Produce" },
  { name: "Olive oil", kcal: 884, protein: 0, category: "Pantry" },
  { name: "Peanut butter", kcal: 588, protein: 25, category: "Pantry" },
  { name: "Almonds", kcal: 579, protein: 21, category: "Snacks" },
  { name: "Walnuts", kcal: 654, protein: 15, category: "Snacks" },
  { name: "Honey", kcal: 304, protein: 0.3, category: "Pantry" },
  { name: "Hummus", kcal: 166, protein: 8, category: "Snacks" },
  { name: "Dark chocolate", kcal: 546, protein: 5, category: "Snacks" },
  { name: "Rice cakes", kcal: 387, protein: 8, category: "Snacks" },
  { name: "Protein bar", kcal: 350, protein: 30, category: "Snacks" },
];

const byName = new Map(FOODS.map((f) => [f.name.toLowerCase(), f]));

export function findFood(name: string): Food | undefined {
  return byName.get(name.toLowerCase());
}

export function searchFoods(q: string, limit = 12): Food[] {
  const s = q.trim().toLowerCase();
  if (!s) return FOODS.slice(0, limit);
  return FOODS.filter((f) => f.name.toLowerCase().includes(s)).slice(0, limit);
}

export function macrosFor(food: Food, grams: number) {
  return {
    kcal: Math.round((food.kcal * grams) / 100),
    protein: Math.round((food.protein * grams) / 10) / 10,
  };
}
