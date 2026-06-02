"use client";

import { useEffect, useRef } from "react";

interface Props {
  goal: number;
  solvedToday: number;
}

export function DailyGoalCard({ goal, solvedToday }: Props) {
  const pct = Math.min((solvedToday / goal) * 100, 100);
  const isComplete = solvedToday >= goal;
  const barRef = useRef<HTMLDivElement>(null);

  // Animate bar width on mount / value change
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    bar.style.width = "0%";
    const raf = requestAnimationFrame(() => {
      bar.style.width = `${pct}%`;
    });
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border p-5
        backdrop-blur-sm transition-all duration-300
        ${isComplete
          ? "border-cyan-400/40 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.15)]"
          : "border-white/10 bg-white/5"
        }
      `}
    >
      {/* Completion glow ring */}
      {isComplete && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl animate-pulse bg-cyan-400/5" />
      )}

      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Daily Goal
          </p>
          <div className="mt-1 flex items-end gap-1">
            <span className="text-4xl font-black text-white leading-none">
              {solvedToday}
            </span>
            <span className="mb-1 text-lg text-slate-500 font-medium">
              / {goal}
            </span>
          </div>
        </div>

        {/* Circular badge */}
        <div
          className={`
            flex h-12 w-12 flex-col items-center justify-center rounded-full
            border text-xs font-bold transition-all duration-500
            ${isComplete
              ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-300"
              : "border-white/10 bg-white/5 text-slate-400"
            }
          `}
        >
          <span className="text-base leading-none">
            {isComplete ? "✓" : "🎯"}
          </span>
          <span className="mt-0.5">{Math.round(pct)}%</span>
        </div>
      </div>

      {/* Progress track */}
      <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          ref={barRef}
          className={`
            h-full rounded-full transition-[width] duration-700 ease-out
            ${isComplete
              ? "bg-gradient-to-r from-cyan-400 to-teal-300"
              : "bg-gradient-to-r from-cyan-600 to-cyan-400"
            }
          `}
          style={{ width: "0%" }}
        />
      </div>

      {/* Bottom label */}
      <p className="mt-2 text-xs text-slate-500">
        {isComplete
          ? "Goal complete — great work today 🔥"
          : `${goal - solvedToday} problem${goal - solvedToday === 1 ? "" : "s"} left today`
        }
      </p>
    </div>
  );
}