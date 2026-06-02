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
  accentColor: string;
  tag: string;
  days: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_META: Record<string, MonthMeta> = {
  m1: {
    icon: '📚',
    gradient: 'from-violet-500 to-indigo-500',
    accentColor: 'rgba(139,92,246,0.5)',
    tag: 'Foundations',
    days: 'Day 1–28',
  },
  m2: {
    icon: '🌲',
    gradient: 'from-cyan-400 to-blue-500',
    accentColor: 'rgba(6,182,212,0.5)',
    tag: 'Core DS',
    days: 'Day 29–56',
  },
  m3: {
    icon: '🔁',
    gradient: 'from-pink-500 to-rose-500',
    accentColor: 'rgba(236,72,153,0.5)',
    tag: 'Patterns',
    days: 'Day 57–84',
  },
  m4: {
    icon: '🕸️',
    gradient: 'from-orange-400 to-red-500',
    accentColor: 'rgba(249,115,22,0.5)',
    tag: 'Advanced',
    days: 'Day 85–112',
  },
  m5: {
    icon: '💡',
    gradient: 'from-amber-400 to-orange-500',
    accentColor: 'rgba(245,158,11,0.5)',
    tag: 'Advanced',
    days: 'Day 113–140',
  },
  m6: {
    icon: '🏆',
    gradient: 'from-fuchsia-500 to-purple-600',
    accentColor: 'rgba(217,70,239,0.5)',
    tag: 'Expert',
    days: 'Day 141–168',
  },
};

const FALLBACK_META = MONTH_META.m1;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ProgressRingProps {
  monthId: string;
  percentage: number;
  solved: number;
  total: number;
}

function ProgressRing({ monthId, percentage, solved, total }: ProgressRingProps) {
  const RADIUS = 38;
  const STROKE = 7;
  const circumference = 2 * Math.PI * RADIUS;
  const dashOffset = circumference - (percentage / 100) * circumference;
  const gradientId = `ring-grad-${monthId}`;

  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg className="-rotate-90 h-14 w-14" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <filter id={`glow-${monthId}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx="50" cy="50" r={RADIUS}
          stroke="#1e293b" strokeWidth={STROKE} fill="none"
        />

        {/* Progress */}
        <circle
          cx="50" cy="50" r={RADIUS}
          stroke={`url(#${gradientId})`}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          filter={percentage > 0 ? `url(#glow-${monthId})` : undefined}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>

      {/* Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-px">
        <span className="text-[11px] font-bold leading-none text-cyan-300">
          {percentage}%
        </span>
        <span className="text-[9px] leading-none text-slate-500">
          {solved}/{total}
        </span>
      </div>
    </div>
  );
}

interface WeekTabsProps {
  count: number;
  active: number;
  onChange: (index: number) => void;
  solved: Set<string>;
  weeks: Month['weeks'];
}

function WeekTabs({ count, active, onChange, solved, weeks }: WeekTabsProps) {
  return (
    <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {Array.from({ length: count }, (_, i) => {
        const weekProblems = weeks[i]?.probs ?? [];
        const weekSolved = weekProblems.filter((p) => solved.has(p.id)).length;
        const weekTotal = weekProblems.length;
        const isActive = active === i;

        return (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={[
              'relative flex shrink-0 flex-col items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white ring-1 ring-cyan-500/40'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
            ].join(' ')}
          >
            <span>Week {i + 1}</span>
            <span
              className={[
                'mt-0.5 text-[10px] font-normal',
                isActive ? 'text-cyan-400' : 'text-slate-600',
              ].join(' ')}
            >
              {weekSolved}/{weekTotal}
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

  const meta = MONTH_META[month.id.toLowerCase()] ?? FALLBACK_META;

  const { totalProblems, solvedProblems, percentage } = useMemo(() => {
    const total = month.weeks.reduce((acc, w) => acc + w.probs.length, 0);
    const done = month.weeks.reduce(
      (acc, w) => acc + w.probs.filter((p) => solved.has(p.id)).length,
      0,
    );
    return {
      totalProblems: total,
      solvedProblems: done,
      percentage: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }, [month.weeks, solved]);

  return (
    <div
      className={[
        'overflow-hidden rounded-2xl border border-white/8 bg-[#0a0f1a]/70 backdrop-blur-xl',
        'transition-all duration-300',
        'hover:border-white/15 hover:shadow-[0_0_32px_rgba(6,182,212,0.08)]',
        isExpanded && 'border-white/12',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* ── Card Header ── */}
      <button
        onClick={onToggleExpand}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
        aria-expanded={isExpanded}
      >
        {/* Icon */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient} shadow-md`}
          aria-hidden="true"
        >
          <span className="text-lg leading-none">{meta.icon}</span>
        </div>

        {/* Title + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-white">{month.name}</h2>
            <span
              className={`rounded-md bg-gradient-to-r ${meta.gradient} px-2 py-0.5 text-[11px] font-semibold text-white/90`}
            >
              {meta.tag}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            4 Weeks · {totalProblems} Problems · {meta.days}
          </p>
        </div>

        {/* Progress ring */}
        <ProgressRing
          monthId={month.id}
          percentage={percentage}
          solved={solvedProblems}
          total={totalProblems}
        />

        {/* Chevron */}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* ── Expanded Body ── */}
      {isExpanded && (
        <div className="border-t border-white/8 px-5 pb-5 pt-4">
          <WeekTabs
            count={month.weeks.length}
            active={activeWeek}
            onChange={setActiveWeek}
            solved={solved}
            weeks={month.weeks}
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