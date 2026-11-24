import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { aiMode } from "@/lib/ai";
import { listStock } from "@/lib/data";
import { addStockAction, deleteStockAction, updateStockAction } from "../actions";
import { ReceiptScanner } from "./ReceiptScanner";

export const dynamic = "force-dynamic";
const UNITS = ["g", "kg", "ml", "l", "pcs"];

export default function Stock() {
  const stock = listStock();
  return (
    <div className="space-y-6">
      <PageHeader title="Stock" icon="scanBill" />

      <ReceiptScanner aiEnabled={aiMode() !== "off"} />

      <form action={addStockAction} className="card grid grid-cols-[1fr_80px_80px] gap-2 p-4">
        <input name="name" placeholder="Add item (e.g. Oats)" required className="input" aria-label="Item name" />
        <input name="qty" type="number" min={0} step="any" defaultValue={1} required className="input !px-3" aria-label="Quantity" />
        <select name="unit" defaultValue="pcs" className="input !px-2" aria-label="Unit">
          {UNITS.map((u) => <option key={u}>{u}</option>)}
        </select>
        <button className="btn col-span-3">Add to stock</button>
      </form>

      <section>
        <h2 className="mb-3 text-xl font-bold">In your kitchen ({stock.length})</h2>
        {stock.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 p-8 text-center">
            <Icon name="scanBill" size={48} />
            <p className="text-muted">Your pantry is empty. Scan a grocery bill or add items above.</p>
          </div>
        ) : (
          <div className="card divide-y divide-black/5 px-4">
            {stock.map((s) => (
              <div key={s.id} className="flex items-center gap-2 py-3" data-testid="stock-row">
                <span className="flex-1 font-medium">{s.name}</span>
                <form action={updateStockAction} className="flex items-center gap-1">
                  <input type="hidden" name="id" value={s.id} />
                  <input name="qty" type="number" min={0} step="any" defaultValue={s.qty} className="w-20 rounded-xl border border-black/10 px-2 py-1 text-right" aria-label={`${s.name} quantity`} />
                  <select name="unit" defaultValue={s.unit} className="rounded-xl border border-black/10 px-1 py-1" aria-label={`${s.name} unit`}>
                    {UNITS.map((u) => <option key={u}>{u}</option>)}
                  </select>
                  <button className="px-1 text-sm font-semibold text-brand-500">Save</button>
                </form>
                <form action={deleteStockAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className="text-red-500" aria-label={`Remove ${s.name}`}>✕</button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
