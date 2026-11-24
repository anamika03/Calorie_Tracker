export function KcalRing({ left, target }: { left: number; target: number }) {
  const r = 70, c = 2 * Math.PI * r;
  const eatenFrac = target > 0 ? Math.min(Math.max(1 - left / target, 0), 1) : 0;
  const angle = eatenFrac * 2 * Math.PI - Math.PI / 2;
  const dot = { x: 80 + r * Math.cos(angle), y: 80 + r * Math.sin(angle) };
  const over = left < 0;
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 160 160" className="h-full w-full">
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="12" />
        <circle cx="80" cy="80" r={r} fill="none" stroke="white" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${eatenFrac * c} ${c}`} transform="rotate(-90 80 80)" />
        <circle cx={dot.x} cy={dot.y} r="9" fill="white" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span data-testid="kcal-left" className="text-[34px] font-bold tracking-tight">{Math.abs(left).toLocaleString("de-DE")}</span>
        <span className="text-sm opacity-90">{over ? "kcal over" : "kcal left"}</span>
      </div>
    </div>
  );
}
