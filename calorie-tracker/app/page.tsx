import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/Icon";
import { KcalRing } from "@/components/KcalRing";
import { WaterCard } from "@/components/WaterCard";
import * as data from "@/lib/data";
import { greeting, headerDate } from "@/lib/date";
import type { IconName } from "@/lib/assets";
import { SLOT_LABELS } from "@/lib/meals";
import { logPlannedAction } from "./actions";

export const dynamic = "force-dynamic";

const fmt = (n: number) => Math.round(n).toLocaleString("de-DE");

const QUICK: { href: string; label: string; icon: IconName; bg: string }[] = [
  { href: "/log", label: "Log meal", icon: "logMeal", bg: "bg-[#dff3e4]" },
  { href: "/stock", label: "Scan bill", icon: "scanBill", bg: "bg-[#e3ecfb]" },
  { href: "/plan", label: "Plan week", icon: "planWeek", bg: "bg-[#fde9d9]" },
  { href: "/recipes", label: "Recipes", icon: "recipes", bg: "bg-[#fde3e6]" },
];

export default function Home() {
  const profile = data.getProfile();
  if (!profile) redirect("/onboarding");

  const t = data.getTargets(profile);
  const meals = data.mealsForDay();
  const eaten = meals.reduce((s, m) => s + m.kcal, 0);
  const protein = meals.reduce((s, m) => s + m.protein, 0);
  const burned = data.burnedForDay();
  const left = t.kcal - eaten + (burned ?? 0);
  const water = data.waterForDay();
  const upNext = data.plannedForDay().filter((m) => !m.logged);
  const proteinPct = Math.min((protein / t.protein) * 100, 100);
  const now = new Date();

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-muted">{headerDate(now)}</p>
          <h1 className="mt-1 text-[26px] font-bold leading-tight">
            {greeting(now)},{" "}
            <span className="whitespace-nowrap">
              {profile.name} <Icon name="wave" size={28} className="inline-block -mt-1 align-middle" />
            </span>
          </h1>
        </div>
        <Link href="/onboarding" aria-label="Edit profile"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xl font-semibold text-white shadow-md">
          {profile.name[0]?.toUpperCase()}
        </Link>
      </header>

      {/* Banner */}
      <div className="flex items-center gap-3 rounded-3xl bg-brand-100/70 px-5 py-4">
        <Icon name="flameMascot" size={40} />
        <p className="flex-1 font-medium">
          {meals.length === 0
            ? "Ready when you are! Log your first meal"
            : left >= 0
              ? `Nice work! ${fmt(left)} kcal to go today`
              : `You're ${fmt(-left)} kcal over target today`}
        </p>
        {meals.length === 0 && <Icon name="search" size={24} />}
      </div>

      {/* Today */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">Today</h2>
        <div data-testid="today-card" className="today-card rounded-[32px] p-6 text-white shadow-[0_20px_40px_rgba(239,111,90,0.25)]">
          <div className="flex items-center gap-4">
            <KcalRing left={left} target={t.kcal} />
            <dl className="space-y-3">
              <Stat icon="target" label="Target" value={`${fmt(t.kcal)} kcal`} testid="target" />
              <Stat icon="plate" label="Eaten" value={`${fmt(eaten)} kcal`} testid="eaten" />
              <Stat icon="flameMascot" label="Burned" value={burned === null ? "—" : `${fmt(burned)} kcal`} testid="burned" />
            </dl>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between font-semibold">
              <span className="flex items-center gap-2"><Icon name="protein" size={22} /> Protein</span>
              <span data-testid="protein">{Math.round(protein)} / {t.protein} g</span>
            </div>
            <div className="relative h-3 rounded-full bg-white/30">
              <div className="h-3 rounded-full bg-white" style={{ width: `${proteinPct}%` }} />
              <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow"
                style={{ left: `calc(${proteinPct}% - 8px)` }} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link href="/meals" className="flex items-center justify-between rounded-full bg-white/25 px-4 py-3 text-sm font-semibold">
              <span data-testid="meal-count">{meals.length} {meals.length === 1 ? "meal" : "meals"}</span><span>›</span>
            </Link>
            <Link href="/burned" className="flex items-center justify-between rounded-full bg-white/25 px-4 py-3 text-sm font-semibold">
              <span>{burned === null ? "Add burned" : "Edit burned"}</span><span>›</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Water */}
      <WaterCard total={water} goal={t.waterMl} />

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">Quick actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {QUICK.map((q) => (
            <Link key={q.href} href={q.href} className="flex flex-col items-center gap-2">
              <span className={`flex h-[76px] w-[76px] items-center justify-center rounded-3xl ${q.bg}`}>
                <Icon name={q.icon} size={46} />
              </span>
              <span className="text-sm font-semibold">{q.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Up next */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Up next</h2>
          <Link href="/plan" className="font-semibold text-brand-500">Full week ›</Link>
        </div>
        <div className="card divide-y divide-black/5 px-5">
          {upNext.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Icon name="planWeek" size={48} />
              <p className="text-muted">No meals planned for the rest of today.</p>
              <Link href="/plan" className="btn-ghost">Plan my week</Link>
            </div>
          ) : (
            upNext.map((m) => (
              <div key={m.id} className="flex items-center gap-4 py-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f4f1ee]">
                  <Icon name={m.slot} size={34} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-semibold uppercase tracking-wide ${m.slot === "snack" ? "text-brand-500" : "text-muted"}`}>{SLOT_LABELS[m.slot]}</p>
                  <p className="truncate font-medium">{m.name}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm text-muted">{fmt(m.kcal)} kcal</span>
                  <form action={logPlannedAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <button className="text-xs font-semibold text-brand-500">Log as eaten</button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value, testid }: { icon: IconName; label: string; value: string; testid: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon name={icon} size={28} />
      <div>
        <dt className="text-sm opacity-85">{label}</dt>
        <dd data-testid={testid} className="whitespace-nowrap text-lg font-bold">{value}</dd>
      </div>
    </div>
  );
}

