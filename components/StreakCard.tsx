interface StreakCardProps {
  current: number;
  best: number;
}

export function StreakCard({ current, best }: StreakCardProps) {
  const isPersonalBest = current > 0 && current >= best;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-orange-500/20 bg-orange-500/5 p-5 transition-colors duration-200 hover:border-orange-500/35 hover:bg-orange-500/10">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-orange-500/10 blur-2xl transition-opacity duration-300 group-hover:opacity-150"
      />

      {/* Icon + PB badge */}
      <div className="flex items-center justify-between">
        <span className="text-2xl leading-none" aria-hidden="true">🔥</span>
        {isPersonalBest && (
          <span className="rounded-md bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-300 ring-1 ring-orange-500/25">
            PB
          </span>
        )}
      </div>

      {/* Count */}
      <div className="mt-3 text-3xl font-bold tabular-nums text-white leading-none">
        {current}
        <span className="ml-1 text-sm font-normal text-slate-500">days</span>
      </div>

      <div className="mt-1 text-xs text-slate-400">Current streak</div>

      {/* Divider */}
      <div className="my-3 h-px bg-white/5" />

      {/* Best */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Best</span>
        <span className="tabular-nums font-medium text-orange-300">{best} days</span>
      </div>
    </div>
  );
}