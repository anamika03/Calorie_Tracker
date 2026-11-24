import { Icon } from "./Icon";
import { addWaterAction, undoWaterAction } from "@/app/actions";

export function WaterCard({ total, goal }: { total: number; goal: number }) {
  const pct = Math.min((total / goal) * 100, 100);
  return (
    <section className="card p-5" data-testid="water-card">
      <div className="flex items-center gap-3">
        <Icon name="water" size={36} />
        <div className="flex-1">
          <p className="font-semibold">Water</p>
          <p className="text-sm text-muted"><span data-testid="water-total">{(total / 1000).toFixed(2)}</span> / {(goal / 1000).toFixed(1)} L</p>
        </div>
        {total > 0 && (
          <form action={undoWaterAction}>
            <button className="text-sm font-medium text-muted underline-offset-2 hover:underline">Undo</button>
          </form>
        )}
      </div>
      <div className="mt-4 h-3 rounded-full bg-sky-100">
        <div className="h-3 rounded-full bg-sky-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[250, 500].map((ml) => (
          <form key={ml} action={addWaterAction}>
            <input type="hidden" name="ml" value={ml} />
            <button className="w-full rounded-2xl bg-sky-50 py-2.5 font-semibold text-sky-600 hover:bg-sky-100">+{ml} ml</button>
          </form>
        ))}
      </div>
    </section>
  );
}
