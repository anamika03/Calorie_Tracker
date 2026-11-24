// Icons: Microsoft Fluent Emoji 3D (MIT) — see public/images/LICENSE-fluent-emoji.txt
// Regenerate with: npm run fetch-assets
export const ICONS = {
  flameMascot: "/images/flame-mascot.png",
  wave: "/images/wave.png",
  target: "/images/target.png",
  plate: "/images/plate.png",
  protein: "/images/protein.png",
  water: "/images/water.png",
  logMeal: "/images/log-meal.png",
  scanBill: "/images/scan-bill.png",
  planWeek: "/images/plan-week.png",
  recipes: "/images/recipes.png",
  breakfast: "/images/breakfast.png",
  lunch: "/images/lunch.png",
  dinner: "/images/dinner.png",
  snack: "/images/snack.png",
  search: "/images/search.png",
} as const;

export type IconName = keyof typeof ICONS;

export const MEAL_SLOT_ICONS = {
  breakfast: ICONS.breakfast,
  lunch: ICONS.lunch,
  dinner: ICONS.dinner,
  snack: ICONS.snack,
} as const;
