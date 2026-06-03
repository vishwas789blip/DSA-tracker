'use client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  totalProblems: number;
  solvedCount: number;
  percentage: number;
  easySolved: number;
  easyTotal: number;
  mediumSolved: number;
  mediumTotal: number;
  hardSolved: number;
  hardTotal: number;
}

interface StatConfig {
  label: string;
  solved: number;
  total: number;
  accent: string;
  border: string;
  bg: string;
  hoverBorder: string;
  barColor: string;
  glow: string;
}

function buildDifficultyStats(stats: Stats): StatConfig[] {
  return [
    {
      label: 'Easy',
      solved: stats.easySolved,
      total: stats.easyTotal,
      accent: 'text-emerald-400',
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-950/20',
      hoverBorder: 'hover:border-emerald-500/40',
      barColor: 'bg-emerald-400',
      glow: 'rgba(52,211,153,0.15)',
    },
    {
      label: 'Medium',
      solved: stats.mediumSolved,
      total: stats.mediumTotal,
      accent: 'text-amber-400',
      border: 'border-amber-500/20',
      bg: 'bg-amber-950/20',
      hoverBorder: 'hover:border-amber-500/40',
      barColor: 'bg-amber-400',
      glow: 'rgba(251,191,36,0.15)',
    },
    {
      label: 'Hard',
      solved: stats.hardSolved,
      total: stats.hardTotal,
      accent: 'text-rose-400',
      border: 'border-rose-500/20',
      bg: 'bg-rose-950/20',
      hoverBorder: 'hover:border-rose-500/40',
      barColor: 'bg-rose-400',
      glow: 'rgba(251,113,133,0.15)',
    },
  ];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MiniBar({ solved, total, barColor }: { solved: number; total: number; barColor: string }) {
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  return (
    <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${barColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function DifficultyTile({ config }: { config: StatConfig }) {
  const pct = config.total > 0 ? Math.round((config.solved / config.total) * 100) : 0;
  return (
    <div className={[
      'group relative rounded-2xl border p-4 backdrop-blur-xl',
      'transition-all duration-300',
      config.bg, config.border, config.hoverBorder,
    ].join(' ')}>
      <div className="flex items-start justify-between">
        <p className={`text-[11px] font-bold uppercase tracking-widest ${config.accent}`}>
          {config.label}
        </p>
        <span className={`text-[11px] tabular-nums font-semibold ${config.accent} opacity-60`}>
          {pct}%
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-black tabular-nums text-white">{config.solved}</span>
        <span className="text-xs tabular-nums text-slate-600">/ {config.total}</span>
      </div>
      <MiniBar solved={config.solved} total={config.total} barColor={config.barColor} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StatsCard({ stats }: { stats: Stats }) {
  const difficultyStats = buildDifficultyStats(stats);

  return (
    <div className="mb-8 space-y-3">

      {/* ── Summary row ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">

        {/* Total Solved */}
        <div className="col-span-1 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40">
          <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">Solved</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black tabular-nums text-white">{stats.solvedCount}</span>
            <span className="text-xs tabular-nums text-slate-600">/ {stats.totalProblems}</span>
          </div>
          <MiniBar solved={stats.solvedCount} total={stats.totalProblems} barColor="bg-cyan-400" />
        </div>

        {/* Completion % */}
        <div className="col-span-1 rounded-2xl border border-violet-500/20 bg-violet-950/20 p-4 backdrop-blur-xl transition-all duration-300 hover:border-violet-500/40">
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-400">Done</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black tabular-nums text-white">{stats.percentage}</span>
            <span className="text-xs text-slate-600">%</span>
          </div>
          <MiniBar solved={stats.percentage} total={100} barColor="bg-violet-400" />
        </div>

        {/* Difficulty tiles — full width on mobile, inline on lg */}
        <div className="col-span-2 grid grid-cols-3 gap-3 lg:contents">
          {difficultyStats.map((config) => (
            <DifficultyTile key={config.label} config={config} />
          ))}
        </div>

      </div>

      {/* ── Overall progress bar ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Overall Progress
          </span>
          <span className="text-xs tabular-nums font-semibold text-cyan-400">
            {stats.solvedCount} / {stats.totalProblems}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-blue-400 to-cyan-400 transition-[width] duration-700 ease-out"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

    </div>
  );
}