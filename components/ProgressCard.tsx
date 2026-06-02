interface Props {
  today: number;
  week: number;
  month: number;
  bestDay: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

interface StatItem {
  label: string;
  getValue: (p: Props) => number;
  highlight?: boolean;
}

const STATS: StatItem[] = [
  { label: 'Today',      getValue: (p) => p.today,   highlight: true },
  { label: 'This Week',  getValue: (p) => p.week },
  { label: 'This Month', getValue: (p) => p.month },
  { label: 'Best Day',   getValue: (p) => p.bestDay },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ProgressCard(props: Props) {
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
      <h3 className="mb-4 text-lg font-bold">📈 Progress Analytics</h3>

      <div className="grid grid-cols-2 gap-4">
        {STATS.map(({ label, getValue, highlight }) => (
          <div key={label}>
            <div className={`text-2xl font-bold ${highlight ? 'text-cyan-400' : 'text-white'}`}>
              {getValue(props)}
            </div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}