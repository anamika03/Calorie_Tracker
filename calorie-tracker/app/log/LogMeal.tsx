"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FOODS, macrosFor, type Food } from "@/lib/foods";
import { SLOTS, SLOT_LABELS, type Slot } from "@/lib/meals";
import { analyzeMealAction, logCustomAction, logFoodAction, logPhotoItemsAction } from "../actions";
import type { MealItem } from "@/lib/ai";

type Tab = "search" | "photo" | "custom";

export function LogMeal({ aiEnabled, defaultSlot }: { aiEnabled: boolean; defaultSlot: Slot }) {
  const [tab, setTab] = useState<Tab>("search");
  const [slot, setSlot] = useState<Slot>(defaultSlot);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-white p-1 shadow-sm">
        {(["search", "photo", "custom"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-xl py-2 text-sm font-semibold capitalize ${tab === t ? "bg-brand-500 text-white" : "text-muted"}`}>
            {t === "search" ? "Search food" : t === "photo" ? "Photo" : "Custom"}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {SLOTS.map((s) => (
          <button key={s} onClick={() => setSlot(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${slot === s ? "bg-ink text-white" : "bg-white text-muted shadow-sm"}`}>
            {SLOT_LABELS[s]}
          </button>
        ))}
      </div>

      {tab === "search" && <SearchTab slot={slot} />}
      {tab === "photo" && <PhotoTab slot={slot} aiEnabled={aiEnabled} />}
      {tab === "custom" && <CustomTab slot={slot} />}
    </div>
  );
}

function SearchTab({ slot }: { slot: Slot }) {
  const [q, setQ] = useState("");
  const [food, setFood] = useState<Food | null>(null);
  const [grams, setGrams] = useState(100);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (s ? FOODS.filter((f) => f.name.toLowerCase().includes(s)) : FOODS).slice(0, 12);
  }, [q]);
  const m = food ? macrosFor(food, grams || 0) : null;

  if (food) {
    return (
      <form action={logFoodAction} className="card space-y-4 p-6">
        <input type="hidden" name="food" value={food.name} />
        <input type="hidden" name="slot" value={slot} />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">{food.name}</p>
            <p className="text-sm text-muted">{food.kcal} kcal · {food.protein} g protein per 100 g</p>
          </div>
          <button type="button" onClick={() => setFood(null)} className="text-sm font-semibold text-brand-500">Change</button>
        </div>
        <label className="block">
          <span className="label">Amount (g)</span>
          <input name="grams" type="number" min={1} max={2000} value={grams} onChange={(e) => setGrams(Number(e.target.value))} className="input" required />
        </label>
        <div className="flex gap-2">
          {[50, 100, 150, 200, 250].map((g) => (
            <button key={g} type="button" onClick={() => setGrams(g)} className="flex-1 rounded-xl bg-brand-50 py-1.5 text-sm font-semibold text-brand-600">{g}</button>
          ))}
        </div>
        <div className="rounded-2xl bg-brand-50 p-4 text-center">
          <span className="text-2xl font-bold" data-testid="preview-kcal">{m?.kcal}</span> kcal · <span className="font-semibold">{m?.protein} g</span> protein
        </div>
        <button className="btn w-full">Add to {SLOT_LABELS[slot].toLowerCase()}</button>
      </form>
    );
  }

  return (
    <div className="space-y-3">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search foods (e.g. chicken, oats)…" className="input" autoFocus />
      <div className="card divide-y divide-black/5 px-2">
        {results.length === 0 ? (
          <p className="p-6 text-center text-muted">No match. Try the Custom tab to enter calories yourself.</p>
        ) : results.map((f) => (
          <button key={f.name} onClick={() => setFood(f)} className="flex w-full items-center justify-between px-3 py-3 text-left hover:bg-brand-50">
            <span className="font-medium">{f.name}</span>
            <span className="text-sm text-muted">{f.kcal} kcal / 100 g</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CustomTab({ slot }: { slot: Slot }) {
  return (
    <form action={logCustomAction} className="card space-y-4 p-6">
      <input type="hidden" name="slot" value={slot} />
      <label className="block"><span className="label">What did you eat?</span><input name="name" required className="input" placeholder="e.g. Homemade burrito" /></label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block"><span className="label">Calories (kcal)</span><input name="kcal" type="number" min={0} max={5000} required className="input" /></label>
        <label className="block"><span className="label">Protein (g)</span><input name="protein" type="number" min={0} max={500} step="0.1" defaultValue={0} className="input" /></label>
      </div>
      <button className="btn w-full">Add to {SLOT_LABELS[slot].toLowerCase()}</button>
    </form>
  );
}

function PhotoTab({ slot, aiEnabled }: { slot: Slot; aiEnabled: boolean }) {
  const router = useRouter();
  const [items, setItems] = useState<MealItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!aiEnabled) {
    return (
      <div className="card space-y-2 p-6 text-center">
        <p className="font-semibold">Photo logging needs an Anthropic API key</p>
        <p className="text-sm text-muted">Add <code>ANTHROPIC_API_KEY=…</code> to <code>.env.local</code> and restart the app. Meanwhile, use Search food or Custom.</p>
      </div>
    );
  }

  const analyze = (form: FormData) => start(async () => {
    setError(null);
    const res = await analyzeMealAction(form);
    if (res.ok) setItems(res.items); else setError(res.error);
  });

  const save = () => start(async () => {
    if (!items) return;
    await logPhotoItemsAction(items, slot);
    router.push("/");
  });

  const update = (i: number, patch: Partial<MealItem>) =>
    setItems((cur) => cur!.map((it, j) => (j === i ? { ...it, ...patch } : it)));

  return (
    <div className="space-y-4">
      <form action={analyze} className="card space-y-4 p-6">
        <p className="text-sm text-muted">Snap or upload a photo of your plate. Claude estimates each item, and you can adjust before saving.</p>
        <input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" capture="environment" required className="input" />
        <button className="btn w-full" disabled={pending}>{pending && !items ? "Analyzing…" : "Analyze photo"}</button>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      </form>

      {items && (
        <div className="card space-y-3 p-6" data-testid="photo-results">
          <p className="font-semibold">Estimated items</p>
          {items.length === 0 && <p className="text-sm text-muted">No food detected. Try another photo.</p>}
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_70px_70px_28px] items-center gap-2">
              <input value={it.name} onChange={(e) => update(i, { name: e.target.value })} className="input !px-3 !py-2 text-sm" aria-label="Item name" />
              <input type="number" value={it.kcal} onChange={(e) => update(i, { kcal: Number(e.target.value) })} className="input !px-2 !py-2 text-sm" aria-label="kcal" />
              <input type="number" value={it.protein} onChange={(e) => update(i, { protein: Number(e.target.value) })} className="input !px-2 !py-2 text-sm" aria-label="protein" />
              <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-red-500" aria-label="Remove">✕</button>
            </div>
          ))}
          <p className="text-right text-sm text-muted">kcal · protein g</p>
          {items.length > 0 && (
            <button onClick={save} disabled={pending} className="btn w-full">
              Save {items.reduce((s, x) => s + (x.kcal || 0), 0)} kcal to {SLOT_LABELS[slot].toLowerCase()}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
