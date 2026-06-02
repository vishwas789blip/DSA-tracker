'use client';

import { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { Problem } from '@/lib/dsa-problems';
import { ProblemItem } from './ProblemItem';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Week {
  name?: string;
  day?: string;
  topics?: string[];
  probs: Problem[];
}

interface WeekSectionProps {
  week: Week;
  weekNumber: number;
  solved: Set<string>;
  onToggleProblem: (problemId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WeekSection({
  week,
  weekNumber,
  solved,
  onToggleProblem,
}: WeekSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { solvedCount, total, percentage } = useMemo(() => {
    const total = week.probs.length;
    const solvedCount = week.probs.filter((p) => solved.has(p.id)).length;
    return {
      solvedCount,
      total,
      percentage: total > 0 ? Math.round((solvedCount / total) * 100) : 0,
    };
  }, [week.probs, solved]);

  const isComplete = solvedCount === total && total > 0;

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
      {/* ── Header ── */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
      >
        {/* Left: title + tags */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-white">
              {week.name || `Week ${weekNumber}`}
            </h3>

            {isComplete && (
              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-emerald-500/30">
                Complete ✓
              </span>
            )}
          </div>

          {/* Tags row */}
          {(week.day || week.topics?.length) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {week.day && (
                <span className="rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[11px] text-violet-300">
                  {week.day}
                </span>
              )}
              {week.topics?.map((topic) => (
                <span
                  key={topic}
                  className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-slate-400"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: progress + chevron */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs tabular-nums text-slate-400">
              <span className={solvedCount > 0 ? 'text-cyan-400' : ''}>{solvedCount}</span>
              <span className="text-slate-600">/{total}</span>
            </span>

            {/* Progress bar */}
            <div className="h-1 w-20 overflow-hidden rounded-full bg-slate-800">
              <div
                className={[
                  'h-full rounded-full transition-[width] duration-500 ease-out',
                  isComplete
                    ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                    : 'bg-gradient-to-r from-violet-500 to-cyan-400',
                ].join(' ')}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <ChevronDown
            aria-hidden="true"
            className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* ── Problem List ── */}
      {isExpanded && (
        <div className="border-t border-white/8">
          {week.probs.map((problem, index) => (
            <div
              key={problem.id}
              className={index < week.probs.length - 1 ? 'border-b border-white/5' : ''}
            >
              <ProblemItem
                problem={problem}
                isSolved={solved.has(problem.id)}
                onToggle={() => onToggleProblem(problem.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}