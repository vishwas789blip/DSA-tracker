'use client';

interface StreakCardProps {
  current: number;
  best: number;
}

export function StreakCard({ current, best }: StreakCardProps) {
  const isPersonalBest = current > 0 && current >= best;
  const pct = best > 0 ? Math.min((current / best) * 100, 100) : 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-orange-500/20 bg-orange-500/[0.04] p-5 transition-all duration-300 hover:border-orange-500/35 hover:bg-orange-500/[0.08]">

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-orange-500/10 blur-3xl transition-opacity duration-300 group-hover:opacity-150"
      />

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none" aria-hidden="true">🔥</span>
          <p className="text-[11px] font-bold uppercase tracking-widest text-orange-300/70">
            Streak
          </p>
        </div>
        {isPersonalBest && (
          <span className="rounded-md bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-orange-300 ring-1 ring-orange-500/25">
            PB 🏆
          </span>
        )}
      </div>

      {/* Current count */}
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-4xl font-black tabular-nums text-white leading-none">
          {current}
        </span>
        <span className="text-sm font-medium text-slate-500">days</span>
      </div>
      <p className="mt-0.5 text-xs text-slate-500">Current streak</p>

      {/* Progress toward best */}
      {best > 0 && (
        <div className="mt-4">
          <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-[width] duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] text-slate-600">
            {current >= best ? 'Personal best!' : `${best - current} day${best - current === 1 ? '' : 's'} to beat your best`}
          </p>
        </div>
      )}

      {/* Divider */}
      <div className="my-3 h-px bg-white/[0.05]" />

      {/* Best streak */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Best ever</span>
        <span className="tabular-nums text-sm font-bold text-orange-300">{best} days</span>
      </div>
    </div>
  );
}