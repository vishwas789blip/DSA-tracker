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

// ─── Constants ────────────────────────────────────────────────────────────────

interface StatConfig {
  label: string;
  solved: number;
  total: number;
  accent: string;       // text color
  border: string;       // border color
  bg: string;           // background
  hoverBorder: string;
  barColor: string;     // progress bar fill
}

function buildDifficultyStats(stats: Stats): StatConfig[] {
  return [
    {
      label: 'Easy',
      solved: stats.easySolved,
      total: stats.easyTotal,
      accent: 'text-emerald-400',
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-950/10',
      hoverBorder: 'hover:border-emerald-500/40',
      barColor: 'bg-emerald-400',
    },
    {
      label: 'Medium',
      solved: stats.mediumSolved,
      total: stats.mediumTotal,
      accent: 'text-yellow-400',
      border: 'border-yellow-500/20',
      bg: 'bg-yellow-950/10',
      hoverBorder: 'hover:border-yellow-500/40',
      barColor: 'bg-yellow-400',
    },
    {
      label: 'Hard',
      solved: stats.hardSolved,
      total: stats.hardTotal,
      accent: 'text-red-400',
      border: 'border-red-500/20',
      bg: 'bg-red-950/10',
      hoverBorder: 'hover:border-red-500/40',
      barColor: 'bg-red-400',
    },
  ];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface MiniBarProps {
  solved: number;
  total: number;
  barColor: string;
}

function MiniBar({ solved, total, barColor }: MiniBarProps) {
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  return (
    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-out ${barColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

interface DifficultyTileProps {
  config: StatConfig;
}

function DifficultyTile({ config }: DifficultyTileProps) {
  return (
    <div
      className={[
        'rounded-xl border p-4 backdrop-blur-xl transition-colors duration-200',
        config.bg,
        config.border,
        config.hoverBorder,
      ].join(' ')}
    >
      <p className={`text-[11px] font-semibold uppercase tracking-wider ${config.accent}`}>
        {config.label}
      </p>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums text-white">
          {config.solved}
        </span>
        <span className="text-sm tabular-nums text-slate-500">
          / {config.total}
        </span>
      </div>

      <MiniBar solved={config.solved} total={config.total} barColor={config.barColor} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StatsCard({ stats }: { stats: Stats }) {
  const difficultyStats = buildDifficultyStats(stats);

  return (
    <div className="mb-8 space-y-4">

      {/* ── Top row: summary + difficulty tiles ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">

        {/* Solved */}
        <div className="rounded-xl border border-white/8 bg-slate-900/60 p-4 backdrop-blur-xl transition-colors duration-200 hover:border-white/15">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Solved
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums text-white">
              {stats.solvedCount}
            </span>
            <span className="text-sm tabular-nums text-slate-500">
              / {stats.totalProblems}
            </span>
          </div>
          <MiniBar solved={stats.solvedCount} total={stats.totalProblems} barColor="bg-cyan-400" />
        </div>

        {/* Completion */}
        <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-4 backdrop-blur-xl transition-colors duration-200 hover:border-violet-500/40">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-300">
            Completion
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums text-white">
              {stats.percentage}%
            </span>
          </div>
          <MiniBar solved={stats.percentage} total={100} barColor="bg-violet-400" />
        </div>

        {/* Difficulty tiles */}
        {difficultyStats.map((config) => (
          <DifficultyTile key={config.label} config={config} />
        ))}

      </div>

      {/* ── Overall progress bar ── */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-slate-500">Overall Progress</span>
          <span className="text-xs tabular-nums font-medium text-cyan-400">
            {stats.solvedCount} / {stats.totalProblems}
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 transition-[width] duration-700 ease-out"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

    </div>
  );
}