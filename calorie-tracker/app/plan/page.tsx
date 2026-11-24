import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import * as data from "@/lib/data";
import { dayKey, fromKey } from "@/lib/date";
import { SLOT_LABELS } from "@/lib/meals";
import { generatePlanAction, logPlannedAction, toggleGroceryAction } from "../actions";

export const dynamic = "force-dynamic";

export default function Plan() {
  const today = dayKey();
  const planned = data.plannedFrom(today);
  const groceries = data.listGroceries();
  const days = [...new Set(planned.map((m) => m.day))];
  const profile = data.getProfile();
  const target = profile ? data.getTargets(profile).kcal : null;
  const categories = [...new Set(groceries.map((g) => g.category))];

  return (
    <div className="space-y-6">
      <PageHeader title="Plan week" icon="planWeek" />

      <form action={generatePlanAction} className="card flex items-center gap-4 p-5">
        <div className="flex-1">
          <p className="font-semibold">{planned.length ? "Your 7-day plan" : "Plan your week"}</p>
          <p className="text-sm text-muted">{target ? `Each day is built around your ${target.toLocaleString("de-DE")} kcal target, using what's in your stock first.` : "Set up your profile first."}</p>
        </div>
        <button className="btn shrink-0">{planned.length ? "Regenerate" : "Generate"}</button>
      </form>

      {planned.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-8 text-center">
          <Icon name="planWeek" size={56} />
          <p className="text-muted">No plan yet. Tap Generate to get meals and a grocery list for the week.</p>
        </div>
      ) : (
        <>
          {days.map((day) => {
            const meals = planned.filter((m) => m.day === day);
            const total = meals.reduce((s, m) => s + m.kcal, 0);
            const label = day === today ? "Today" : fromKey(day).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
            return (
              <section key={day} data-testid="plan-day">
                <div className="mb-2 flex items-baseline justify-between">
                  <h2 className="text-lg font-bold">{label}</h2>
                  <span className="text-sm text-muted">{total.toLocaleString("de-DE")} kcal</span>
                </div>
                <div className="card divide-y divide-black/5 px-4">
                  {meals.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 py-3">
                      <Icon name={m.slot} size={32} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase text-muted">{SLOT_LABELS[m.slot]}</p>
                        <p className="truncate font-medium">{m.name}</p>
                        <p className="truncate text-xs text-muted">{m.ingredients.map((i) => `${i.food} ${i.grams} g`).join(" · ")}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-muted">{m.kcal} kcal</p>
                        <p className="text-xs text-muted">{m.protein} g P</p>
                        {day === today && (m.logged ? <p className="text-xs font-semibold text-green-600">Eaten ✓</p> : (
                          <form action={logPlannedAction}>
                            <input type="hidden" name="id" value={m.id} />
                            <button className="text-xs font-semibold text-brand-500">Log</button>
                          </form>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          <section data-testid="grocery-list">
            <h2 className="mb-2 text-xl font-bold">Grocery list</h2>
            {groceries.length === 0 ? (
              <div className="card p-6 text-center text-muted">You already have everything in stock 🎉</div>
            ) : (
              <div className="card space-y-4 p-5">
                {categories.map((c) => (
                  <div key={c}>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{c}</p>
                    {groceries.filter((g) => g.category === c).map((g) => (
                      <form key={g.id} action={toggleGroceryAction}>
                        <input type="hidden" name="id" value={g.id} />
                        <button className="flex w-full items-center gap-3 py-1.5 text-left">
                          <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${g.checked ? "border-brand-500 bg-brand-500 text-white" : "border-black/20"}`}>{g.checked ? "✓" : ""}</span>
                          <span className={`flex-1 ${g.checked ? "text-muted line-through" : ""}`}>{g.name}</span>
                          <span className="text-sm text-muted">{g.qty} {g.unit}</span>
                        </button>
                      </form>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
