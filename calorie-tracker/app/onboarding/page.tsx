import { Icon } from "@/components/Icon";
import { getProfile } from "@/lib/data";
import { ACTIVITY_LABELS, TIER_LABELS, type Activity, type Tier } from "@/lib/targets";
import { saveProfileAction } from "../actions";

export const dynamic = "force-dynamic";

export default function Onboarding() {
  const p = getProfile();
  return (
    <div>
      <div className="mb-8 text-center">
        <Icon name="flameMascot" size={72} className="mx-auto" />
        <h1 className="mt-3 text-3xl font-bold">{p ? "Your profile" : "Let's set your goals"}</h1>
        <p className="mt-1 text-muted">We use this to calculate your daily calories, protein and water.</p>
      </div>
      <form action={saveProfileAction} className="card space-y-5 p-6">
        <Field label="Name"><input name="name" required defaultValue={p?.name} className="input" placeholder="Your name" /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Sex">
            <select name="sex" defaultValue={p?.sex ?? "male"} className="input">
              <option value="male">Male</option><option value="female">Female</option>
            </select>
          </Field>
          <Field label="Age"><input name="age" type="number" min={10} max={100} required defaultValue={p?.age ?? 25} className="input" /></Field>
          <Field label="Height (cm)"><input name="heightCm" type="number" min={100} max={250} required defaultValue={p?.heightCm ?? 170} className="input" /></Field>
          <Field label="Weight (kg)"><input name="weightKg" type="number" min={30} max={300} step="0.1" required defaultValue={p?.weightKg ?? 70} className="input" /></Field>
        </div>
        <Field label="Activity">
          <select name="activity" defaultValue={p?.activity ?? "moderate"} className="input">
            {(Object.keys(ACTIVITY_LABELS) as Activity[]).map((a) => <option key={a} value={a}>{ACTIVITY_LABELS[a]}</option>)}
          </select>
        </Field>
        <fieldset>
          <legend className="label">Goal tier</legend>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(TIER_LABELS) as Tier[]).map((t) => (
              <label key={t} className="cursor-pointer">
                <input type="radio" name="tier" value={t} defaultChecked={(p?.tier ?? "maintain") === t} className="peer sr-only" />
                <span className="block rounded-2xl border border-black/10 px-2 py-3 text-center text-sm peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:font-semibold peer-checked:text-brand-600">
                  {TIER_LABELS[t].split(" — ")[0]}<br /><span className="text-xs text-muted">{TIER_LABELS[t].split(" — ")[1]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <button className="btn w-full">{p ? "Save" : "Start tracking"}</button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="label">{label}</span>{children}</label>;
}
