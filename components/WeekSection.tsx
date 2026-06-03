'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, EyeOff, Eye } from 'lucide-react';
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

export function WeekSection({ week, weekNumber, solved, onToggleProblem }: WeekSectionProps) {
  const [isExpanded, setIsExpanded]     = useState(false);
  const [hideSolved, setHideSolved]     = useState(false);

  const { solvedCount, total, percentage } = useMemo(() => {
    const total       = week.probs.length;
    const solvedCount = week.probs.filter((p) => solved.has(p.id)).length;
    return {
      solvedCount,
      total,
      percentage: total > 0 ? Math.round((solvedCount / total) * 100) : 0,
    };
  }, [week.probs, solved]);

  const visibleProblems = useMemo(
    () => hideSolved ? week.probs.filter((p) => !solved.has(p.id)) : week.probs,
    [week.probs, solved, hideSolved]
  );

  const isComplete  = solvedCount === total && total > 0;
  const hiddenCount = total - visibleProblems.length;

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
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

          {(week.day || week.topics?.length) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {week.day && (
                <span className="rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[11px] text-violet-300">
                  {week.day}
                </span>
              )}
              {week.topics?.map((topic) => (
                <span key={topic} className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-slate-400">
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
            className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* ── Problem List ── */}
      {isExpanded && (
        <div className="border-t border-white/[0.08]">

          {/* Hide Solved toggle — only show if any problems are solved */}
          {solvedCount > 0 && (
            <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-2">
              <span className="text-xs text-slate-500">
                {hideSolved ? `${hiddenCount} solved hidden` : `${solvedCount} solved visible`}
              </span>
              <button
                onClick={() => setHideSolved((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-400 transition-all hover:border-cyan-500/25 hover:bg-cyan-500/10 hover:text-cyan-300"
              >
                {hideSolved
                  ? <><Eye className="h-3 w-3" /> Show Solved</>
                  : <><EyeOff className="h-3 w-3" /> Hide Solved</>
                }
              </button>
            </div>
          )}

          {visibleProblems.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-600">
              All problems solved 🎉
            </div>
          ) : (
            visibleProblems.map((problem, index) => (
              <div
                key={problem.id}
                className={index < visibleProblems.length - 1 ? 'border-b border-white/5' : ''}
              >
                <ProblemItem
                  problem={problem}
                  isSolved={solved.has(problem.id)}
                  onToggle={() => onToggleProblem(problem.id)}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}