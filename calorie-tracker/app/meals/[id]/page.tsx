import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { getMeal } from "@/lib/data";
import { SLOTS, SLOT_LABELS } from "@/lib/meals";
import { updateMealAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditMeal({ params }: { params: Promise<{ id: string }> }) {
  const meal = getMeal(Number((await params).id));
  if (!meal) notFound();
  return (
    <div>
      <PageHeader title="Edit meal" icon={meal.slot} back="/meals" />
      <form action={updateMealAction} className="card space-y-4 p-6">
        <input type="hidden" name="id" value={meal.id} />
        <label className="block"><span className="label">Name</span><input name="name" defaultValue={meal.name} className="input" required /></label>
        <label className="block"><span className="label">Meal</span>
          <select name="slot" defaultValue={meal.slot} className="input">
            {SLOTS.map((s) => <option key={s} value={s}>{SLOT_LABELS[s]}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block"><span className="label">Calories (kcal)</span><input name="kcal" type="number" min={0} defaultValue={meal.kcal} className="input" required /></label>
          <label className="block"><span className="label">Protein (g)</span><input name="protein" type="number" min={0} step="0.1" defaultValue={meal.protein} className="input" /></label>
        </div>
        <button className="btn w-full">Save changes</button>
      </form>
    </div>
  );
}
