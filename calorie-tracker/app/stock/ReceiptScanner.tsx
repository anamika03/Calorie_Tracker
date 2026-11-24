"use client";

import { useRef, useState, useTransition } from "react";
import { confirmReceiptAction, scanReceiptAction } from "../actions";
import type { ReceiptItem } from "@/lib/ai";

const UNITS: ReceiptItem["unit"][] = ["g", "kg", "ml", "l", "pcs"];

export function ReceiptScanner({ aiEnabled }: { aiEnabled: boolean }) {
  const [items, setItems] = useState<ReceiptItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  if (!aiEnabled) {
    return (
      <div className="card p-5 text-sm text-muted">
        <p className="font-semibold text-ink">Scan bill</p>
        Receipt scanning needs <code>ANTHROPIC_API_KEY</code> in <code>.env.local</code>. You can still add items by hand below.
      </div>
    );
  }

  const scan = (form: FormData) => start(async () => {
    setError(null);
    const res = await scanReceiptAction(form);
    if (res.ok) setItems(res.items); else setError(res.error);
  });

  const confirm = () => start(async () => {
    if (!items) return;
    await confirmReceiptAction(items);
    setItems(null);
    formRef.current?.reset();
  });

  const update = (i: number, patch: Partial<ReceiptItem>) => setItems((cur) => cur!.map((it, j) => (j === i ? { ...it, ...patch } : it)));

  return (
    <div className="card space-y-4 p-5">
      <form ref={formRef} action={scan} className="space-y-3">
        <p className="font-semibold">Scan bill</p>
        <p className="text-sm text-muted">Upload a photo of your grocery receipt and Claude will add the food items to your stock.</p>
        <input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required className="input" />
        <button className="btn w-full" disabled={pending}>{pending && !items ? "Reading receipt…" : "Scan receipt"}</button>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      </form>

      {items && (
        <div className="space-y-2 border-t border-black/5 pt-4" data-testid="receipt-results">
          <p className="font-semibold">Found {items.length} items. Check them, then add to stock</p>
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_70px_70px_24px] gap-2">
              <input value={it.name} onChange={(e) => update(i, { name: e.target.value })} className="input !px-3 !py-2 text-sm" aria-label="Item" />
              <input type="number" value={it.qty} onChange={(e) => update(i, { qty: Number(e.target.value) })} className="input !px-2 !py-2 text-sm" aria-label="Qty" />
              <select value={it.unit} onChange={(e) => update(i, { unit: e.target.value as ReceiptItem["unit"] })} className="input !px-1 !py-2 text-sm" aria-label="Unit">
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
              <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-red-500" aria-label="Remove">✕</button>
            </div>
          ))}
          <button onClick={confirm} disabled={pending || items.length === 0} className="btn w-full">Add {items.length} items to stock</button>
        </div>
      )}
    </div>
  );
}
