'use client';

import React from 'react';
import { Check, ExternalLink } from 'lucide-react';
import { Problem } from '@/lib/dsa-problems';

// ─── Types ───────────────────────────────────────────────────────────────────

type Difficulty = 'easy' | 'med' | 'hard';
type Platform = 'LC' | 'GFG' | 'CN' | 'IB' | 'HR' | 'CF' | 'EXT' | 'SEARCH';

interface ProblemItemProps {
  problem: Problem;
  isSolved: boolean;
  onToggle: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  med:  'text-amber-400  border-amber-500/30  bg-amber-500/10',
  hard: 'text-rose-400   border-rose-500/30   bg-rose-500/10',
};

const PLATFORM_STYLES: Record<Platform, string> = {
  LC:     'bg-yellow-500/10  text-yellow-300  border-yellow-500/20',
  GFG:    'bg-green-500/10   text-green-300   border-green-500/20',
  CN:     'bg-orange-500/10  text-orange-300  border-orange-500/20',
  IB:     'bg-blue-500/10    text-blue-300    border-blue-500/20',
  HR:     'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  CF:     'bg-purple-500/10  text-purple-300  border-purple-500/20',
  EXT:    'bg-cyan-500/10    text-cyan-300    border-cyan-500/20',
  SEARCH: 'bg-slate-500/10   text-slate-300   border-slate-500/20',
};

const PLATFORM_URL_MATCHERS: Array<[string, Platform]> = [
  ['geeksforgeeks', 'GFG'],
  ['codingninjas',  'CN'],
  ['interviewbit',  'IB'],
  ['hackerrank',    'HR'],
  ['codeforces',    'CF'],
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveProblemUrl(problem: Problem): string {
  if (!problem.lc) {
    return `https://www.google.com/search?q=${encodeURIComponent(problem.n)}`;
  }
  if (problem.lc.startsWith('EXT:')) {
    return problem.lc.slice(4);
  }
  return `https://leetcode.com/problems/${problem.lc}/`;
}

function getPlatform(lc: string | undefined): Platform {
  if (!lc) return 'SEARCH';
  if (!lc.startsWith('EXT:')) return 'LC';

  const lower = lc.toLowerCase();
  const match = PLATFORM_URL_MATCHERS.find(([keyword]) => lower.includes(keyword));
  return match ? match[1] : 'EXT';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProblemItem({ problem, isSolved, onToggle }: ProblemItemProps) {
  const platform = getPlatform(problem.lc);
  const difficulty = problem.d as Difficulty | undefined;

  const handleOpenLink = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    window.open(resolveProblemUrl(problem), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="
      group
      flex items-center justify-between
      px-5 py-3
      border-b border-white/5
      hover:bg-white/[0.03]
      transition-colors duration-150
    ">
      {/* ── Left ── */}
      <div className="flex items-center gap-4 min-w-0 flex-1">

        {/* Serial number */}
        <span className="w-8 shrink-0 text-right text-xs tabular-nums text-slate-600">
          {String(problem.id).padStart(2, '0')}
        </span>

        {/* Solved toggle */}
        <button
          onClick={onToggle}
          aria-label={isSolved ? 'Mark as unsolved' : 'Mark as solved'}
          aria-pressed={isSolved}
          className={`
            h-5 w-5 shrink-0
            rounded
            border
            flex items-center justify-center
            transition-all duration-200

            ${isSolved
              ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
              : 'border-slate-600 hover:border-slate-400 hover:bg-white/5'
            }
          `}
        >
          {isSolved && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
        </button>

        {/* Problem name */}
        <span
          className={`
            truncate text-sm font-medium transition-all duration-200
            ${isSolved ? 'text-slate-600 line-through' : 'text-slate-200'}
          `}
        >
          {problem.n}
        </span>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-2 pl-4 shrink-0">

        {/* Topic / sub-category */}
        {problem.s && (
          <span className="
            hidden lg:block
            rounded px-2.5 py-0.5
            bg-white/[0.04] text-xs text-slate-500
          ">
            {problem.s}
          </span>
        )}

        {/* Difficulty badge */}
        {difficulty && difficulty in DIFFICULTY_STYLES && (
          <span className={`
            rounded border px-2.5 py-0.5
            text-xs font-semibold uppercase tracking-wide
            ${DIFFICULTY_STYLES[difficulty]}
          `}>
            {difficulty}
          </span>
        )}

        {/* Platform badge */}
        <span className={`
          rounded border px-2.5 py-0.5
          text-xs font-semibold
          ${PLATFORM_STYLES[platform]}
        `}>
          {platform}
        </span>

        {/* Open link */}
        <button
          onClick={handleOpenLink}
          aria-label={`Open ${problem.n}`}
          className="
            flex items-center gap-1.5
            rounded border border-white/10
            bg-white/5 px-2.5 py-1
            text-xs text-slate-400
            hover:bg-cyan-500/15 hover:text-cyan-300 hover:border-cyan-500/25
            transition-all duration-150
          "
        >
          <ExternalLink className="h-3 w-3" />
          Open
        </button>
      </div>
    </div>
  );
}