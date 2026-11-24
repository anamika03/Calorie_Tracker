import { PageHeader } from "@/components/PageHeader";
import { burnedForDay } from "@/lib/data";
import { setBurnedAction } from "../actions";

export const dynamic = "force-dynamic";

export default function Burned() {
  const burned = burnedForDay();
  return (
    <div>
      <PageHeader title="Calories burned" icon="flameMascot" />
      <form action={setBurnedAction} className="card space-y-4 p-6">
        <p className="text-sm text-muted">Enter active calories from your workout or fitness watch. They&apos;re added back to today&apos;s budget.</p>
        <label className="block">
          <span className="label">Burned today (kcal)</span>
          <input name="kcal" type="number" min={0} max={5000} required defaultValue={burned ?? ""} className="input" />
        </label>
        <button className="btn w-full">Save</button>
      </form>
    </div>
  );
}
