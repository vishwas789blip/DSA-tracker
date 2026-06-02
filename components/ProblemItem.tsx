'use client';

import { Check, ExternalLink } from 'lucide-react';
import { Problem } from '@/lib/dsa-problems';

interface ProblemItemProps {
  problem: Problem;
  isSolved: boolean;
  onToggle: () => void;
}

export function ProblemItem({
  problem,
  isSolved,
  onToggle,
}: ProblemItemProps) {
  const handleProblemLink = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();

    if (!problem.lc) {
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(
          problem.n
        )}`,
        '_blank',
        'noopener,noreferrer'
      );
      return;
    }

    // External URLs (GFG, CN, etc.)
    if (problem.lc.startsWith('EXT:')) {
      const url = problem.lc.replace('EXT:', '');

      window.open(
        url,
        '_blank',
        'noopener,noreferrer'
      );

      return;
    }

    // LeetCode
    window.open(
      `https://leetcode.com/problems/${problem.lc}/`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const difficultyColors = {
    easy: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    med: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    hard: 'text-red-400 border-red-500/30 bg-red-500/10',
  };

  const getPlatform = () => {
    if (!problem.lc) return 'SEARCH';

    if (problem.lc.startsWith('EXT:')) {
      const url = problem.lc.toLowerCase();

      if (url.includes('geeksforgeeks')) return 'GFG';
      if (url.includes('codingninjas')) return 'CN';
      if (url.includes('interviewbit')) return 'IB';
      if (url.includes('hackerrank')) return 'HR';
      if (url.includes('codeforces')) return 'CF';

      return 'EXT';
    }

    return 'LC';
  };

  const platform = getPlatform();

  const platformStyles: Record<string, string> = {
    LC: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
    GFG: 'bg-green-500/10 text-green-300 border-green-500/20',
    CN: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    IB: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    CF: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    HR: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    EXT: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    SEARCH: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  };

  return (
    <div
      className="
        group
        flex
        items-center
        justify-between
        px-5
        py-3
        border-b
        border-white/5
        hover:bg-white/[0.03]
        transition-all
      "
    >
      {/* Left */}
      <div className="flex items-center gap-4 min-w-0 flex-1">

        <span className="w-8 text-right text-xs text-slate-500">
          {String(problem.id).padStart(2, '0')}
        </span>

        <button
          onClick={onToggle}
          className={`
            h-6
            w-6
            rounded-md
            border
            flex
            items-center
            justify-center
            transition-all

            ${
              isSolved
                ? 'bg-emerald-500 border-emerald-500'
                : 'border-slate-600 hover:border-cyan-400'
            }
          `}
        >
          {isSolved && (
            <Check className="h-3.5 w-3.5 text-white" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div
            className={`
              truncate
              font-medium
              transition-all

              ${
                isSolved
                  ? 'text-slate-500 line-through'
                  : 'text-slate-200'
              }
            `}
          >
            {problem.n}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {problem.s && (
          <span
            className="
              hidden lg:block
              rounded-md
              bg-white/5
              px-3
              py-1
              text-xs
              text-slate-400
            "
          >
            {problem.s}
          </span>
        )}

        {problem.d && (
          <span
            className={`
              rounded-md
              border
              px-3
              py-1
              text-xs
              font-semibold
              uppercase
              ${difficultyColors[problem.d]}
            `}
          >
            {problem.d}
          </span>
        )}

        <span
          className={`
            rounded-md
            border
            px-3
            py-1
            text-xs
            font-semibold
            ${platformStyles[platform]}
          `}
        >
          {platform}
        </span>

        <button
          onClick={handleProblemLink}
          className="
            flex
            items-center
            gap-1
            rounded-md
            border
            border-white/10
            bg-white/5
            px-3
            py-1
            text-xs
            text-slate-300
            hover:bg-cyan-500/20
            hover:text-cyan-300
            hover:border-cyan-500/30
            transition-all
          "
        >
          <ExternalLink className="h-3 w-3" />
          Open
        </button>
      </div>
    </div>
  );
}