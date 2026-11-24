import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { mealsForDay } from "@/lib/data";
import { SLOT_LABELS } from "@/lib/meals";
import { deleteMealAction } from "../actions";

export const dynamic = "force-dynamic";

export default function Meals() {
  const meals = mealsForDay();
  const total = meals.reduce((s, m) => s + m.kcal, 0);
  return (
    <div>
      <PageHeader title="Today's meals" icon="plate" />
      {meals.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-8 text-center">
          <Icon name="logMeal" size={56} />
          <p className="text-muted">Nothing logged yet today.</p>
          <Link href="/log" className="btn">Log a meal</Link>
        </div>
      ) : (
        <>
          <div className="card divide-y divide-black/5 px-5">
            {meals.map((m) => (
              <div key={m.id} className="flex items-center gap-3 py-4" data-testid="meal-row">
                <Icon name={m.slot} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase text-muted">{SLOT_LABELS[m.slot]}</p>
                  <p className="truncate font-medium">{m.name}{m.grams ? <span className="text-muted"> · {m.grams} g</span> : null}</p>
                  <p className="text-sm text-muted">{m.kcal} kcal · {m.protein} g protein</p>
                </div>
                <Link href={`/meals/${m.id}`} className="text-sm font-semibold text-brand-500">Edit</Link>
                <form action={deleteMealAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <button className="text-sm font-semibold text-red-500" aria-label={`Delete ${m.name}`}>Delete</button>
                </form>
              </div>
            ))}
          </div>
          <p className="mt-4 text-right font-semibold">Total: {total} kcal</p>
          <Link href="/log" className="btn mt-4 w-full">Log another meal</Link>
        </>
      )}
    </div>
  );
}
