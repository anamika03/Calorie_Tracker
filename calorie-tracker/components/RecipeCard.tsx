import { Icon } from "./Icon";
import { SLOT_LABELS, type Slot } from "@/lib/meals";
import { recipeLogAction, recipeToPlanAction } from "@/app/actions";

export interface RecipeView {
  name: string; slot: Slot; kcal: number; protein: number; steps: string[];
  ingredients: { food: string; grams: number; inStock: boolean }[];
}

export function RecipeCard({ recipe, badge }: { recipe: RecipeView; badge?: string }) {
  const have = recipe.ingredients.filter((i) => i.inStock).length;
  const payload = JSON.stringify(recipe);
  return (
    <article className="card p-5" data-testid="recipe-card">
      <div className="flex items-start gap-3">
        <Icon name={recipe.slot} size={40} />
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase text-muted">{SLOT_LABELS[recipe.slot]}{badge ? ` · ${badge}` : ""}</p>
          <h3 className="text-lg font-semibold leading-snug">{recipe.name}</h3>
          <p className="text-sm text-muted">{Math.round(recipe.kcal)} kcal · {Math.round(recipe.protein)} g protein · {have}/{recipe.ingredients.length} in stock</p>
        </div>
      </div>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {recipe.ingredients.map((i) => (
          <li key={i.food} className={`rounded-full px-2.5 py-1 text-xs ${i.inStock ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>
            {i.inStock ? "✓" : "+"} {i.food} {i.grams} g
          </li>
        ))}
      </ul>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-ink/80">
        {recipe.steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <form action={recipeToPlanAction}>
          <input type="hidden" name="recipe" value={payload} />
          <button className="btn-ghost w-full">Add to plan</button>
        </form>
        <form action={recipeLogAction}>
          <input type="hidden" name="recipe" value={payload} />
          <button className="btn w-full !py-2.5">Log as eaten</button>
        </form>
      </div>
    </article>
  );
}
