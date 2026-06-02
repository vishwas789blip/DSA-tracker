'use client';

import { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { Month } from '@/lib/dsa-problems';
import { WeekSection } from './WeekSection';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthCardProps {
  month: Month;
  isExpanded: boolean;
  onToggleExpand: () => void;
  solved: Set<string>;
  onToggleProblem: (problemId: string) => void;
}

interface MonthMeta {
  icon: string;
  gradient: string;
  tag: string;
  days: string;
}

interface ProgressStats {
  totalProblems: number;
  solvedProblems: number;
  percentage: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_META: Record<string, MonthMeta> = {
  m1: { icon: '📚', gradient: 'from-violet-500 to-indigo-500',  tag: 'Foundations', days: 'Day 1–28'    },
  m2: { icon: '🌲', gradient: 'from-cyan-400 to-blue-500',      tag: 'Core DS',     days: 'Day 29–56'   },
  m3: { icon: '🔁', gradient: 'from-pink-500 to-rose-500',      tag: 'Patterns',    days: 'Day 57–84'   },
  m4: { icon: '🕸️', gradient: 'from-orange-400 to-red-500',     tag: 'Advanced',    days: 'Day 85–112'  },
  m5: { icon: '💡', gradient: 'from-amber-400 to-orange-500',   tag: 'Advanced',    days: 'Day 113–140' },
  m6: { icon: '🏆', gradient: 'from-fuchsia-500 to-purple-600', tag: 'Expert',      days: 'Day 141–168' },
};

const FALLBACK_META = MONTH_META.m1;

const RING_RADIUS      = 38;
const RING_STROKE      = 7;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeMonthStats(weeks: Month['weeks'], solved: Set<string>): ProgressStats {
  let totalProblems = 0;
  let solvedProblems = 0;

  for (const week of weeks) {
    totalProblems  += week.probs.length;
    solvedProblems += week.probs.filter((p) => solved.has(p.id)).length;
  }

  return {
    totalProblems,
    solvedProblems,
    percentage: totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ProgressRingProps {
  monthId: string;
  percentage: number;
  solved: number;
  total: number;
}

function ProgressRing({ monthId, percentage, solved, total }: ProgressRingProps) {
  const dashOffset = RING_CIRCUMFERENCE - (percentage / 100) * RING_CIRCUMFERENCE;
  const gradientId = `ring-grad-${monthId}`;
  const glowId     = `ring-glow-${monthId}`;

  return (
    <div className="relative h-14 w-14 shrink-0" aria-label={`${percentage}% complete`}>
      <svg className="-rotate-90 h-14 w-14" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle cx="50" cy="50" r={RING_RADIUS} stroke="#1e293b" strokeWidth={RING_STROKE} fill="none" />

        {/* Progress arc */}
        <circle
          cx="50" cy="50" r={RING_RADIUS}
          stroke={`url(#${gradientId})`}
          strokeWidth={RING_STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          filter={percentage > 0 ? `url(#${glowId})` : undefined}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-px">
        <span className="text-[11px] font-bold leading-none text-cyan-300">{percentage}%</span>
        <span className="text-[9px] leading-none text-slate-500">{solved}/{total}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface WeekTabsProps {
  weeks: Month['weeks'];
  active: number;
  onChange: (index: number) => void;
  solved: Set<string>;
}

function WeekTabs({ weeks, active, onChange, solved }: WeekTabsProps) {
  return (
    <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist">
      {weeks.map((week, i) => {
        const weekSolved = week.probs.filter((p) => solved.has(p.id)).length;
        const isActive   = active === i;

        return (
          <button
            key={week.id ?? i}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(i)}
            className={[
              'relative flex shrink-0 flex-col items-center justify-center',
              'rounded-xl px-4 py-2.5 text-sm font-semibold',
              'transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white ring-1 ring-cyan-500/40'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
            ].join(' ')}
          >
            <span>Week {i + 1}</span>
            <span className={`mt-0.5 text-[10px] font-normal ${isActive ? 'text-cyan-400' : 'text-slate-600'}`}>
              {weekSolved}/{week.probs.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MonthCard({
  month,
  isExpanded,
  onToggleExpand,
  solved,
  onToggleProblem,
}: MonthCardProps) {
  const [activeWeek, setActiveWeek] = useState(0);

  const meta  = MONTH_META[month.id.toLowerCase()] ?? FALLBACK_META;
  const stats = useMemo(() => computeMonthStats(month.weeks, solved), [month.weeks, solved]);

  return (
    <div className={[
      'overflow-hidden rounded-2xl border border-white/[0.08]',
      'bg-[#0a0f1a]/70 backdrop-blur-xl',
      'transition-all duration-300',
      'hover:border-white/15 hover:shadow-[0_0_32px_rgba(6,182,212,0.08)]',
      isExpanded && 'border-white/[0.12]',
    ].filter(Boolean).join(' ')}>

      {/* ── Header ── */}
      <button
        onClick={onToggleExpand}
        aria-expanded={isExpanded}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        {/* Month icon */}
        <div
          aria-hidden="true"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient} shadow-md`}
        >
          <span className="text-lg leading-none">{meta.icon}</span>
        </div>

        {/* Title + metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-white">{month.name}</h2>
            <span className={`rounded-md bg-gradient-to-r ${meta.gradient} px-2 py-0.5 text-[11px] font-semibold text-white/90`}>
              {meta.tag}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {month.weeks.length} Weeks · {stats.totalProblems} Problems · {meta.days}
          </p>
        </div>

        {/* Progress ring */}
        <ProgressRing
          monthId={month.id}
          percentage={stats.percentage}
          solved={stats.solvedProblems}
          total={stats.totalProblems}
        />

        {/* Chevron */}
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* ── Expanded Body ── */}
      {isExpanded && (
        <div className="border-t border-white/[0.08] px-5 pb-5 pt-4">
          <WeekTabs
            weeks={month.weeks}
            active={activeWeek}
            onChange={setActiveWeek}
            solved={solved}
          />
          <WeekSection
            week={month.weeks[activeWeek]}
            weekNumber={activeWeek + 1}
            solved={solved}
            onToggleProblem={onToggleProblem}
          />
        </div>
      )}
    </div>
  );
}