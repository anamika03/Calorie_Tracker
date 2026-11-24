"use client";

import { useState, useTransition } from "react";
import { aiRecipesAction, recipeLogAction, recipeToPlanAction } from "../actions";
import type { AiRecipe } from "@/lib/ai";
import { SLOT_LABELS } from "@/lib/meals";

export function AiRecipes({ aiEnabled }: { aiEnabled: boolean }) {
  const [recipes, setRecipes] = useState<AiRecipe[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!aiEnabled) return <p className="text-center text-sm text-muted">Add <code>ANTHROPIC_API_KEY</code> to get custom recipe ideas from Claude.</p>;

  const load = () => start(async () => {
    setError(null);
    const res = await aiRecipesAction();
    if (res.ok) setRecipes(res.items); else setError(res.error);
  });

  return (
    <section className="space-y-4">
      <button onClick={load} disabled={pending} className="btn-ghost w-full">{pending ? "Asking Claude…" : "✨ Ask Claude for more ideas"}</button>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      {recipes?.map((r) => {
        const payload = JSON.stringify(r);
        return (
          <article key={r.name} className="card p-5" data-testid="ai-recipe-card">
            <p className="text-xs font-semibold uppercase text-muted">{SLOT_LABELS[r.slot]} · Claude</p>
            <h3 className="text-lg font-semibold">{r.name}</h3>
            <p className="text-sm text-muted">{Math.round(r.kcal)} kcal · {Math.round(r.protein)} g protein</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {r.ingredients.map((i) => (
                <li key={i.food} className={`rounded-full px-2.5 py-1 text-xs ${i.inStock ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>
                  {i.inStock ? "✓" : "+"} {i.food} {i.grams} g
                </li>
              ))}
            </ul>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">{r.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <form action={recipeToPlanAction}><input type="hidden" name="recipe" value={payload} /><button className="btn-ghost w-full">Add to plan</button></form>
              <form action={recipeLogAction}><input type="hidden" name="recipe" value={payload} /><button className="btn w-full !py-2.5">Log as eaten</button></form>
            </div>
          </article>
        );
      })}
    </section>
  );
}
