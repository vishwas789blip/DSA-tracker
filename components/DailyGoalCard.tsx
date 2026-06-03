"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { setDailyGoal } from "@/lib/dailyGoal";

interface Props {
  goal: number;
  solvedToday: number;
  onGoalChange?: (newGoal: number) => void;
}

export function DailyGoalCard({ goal, solvedToday, onGoalChange }: Props) {
  const pct        = Math.min((solvedToday / goal) * 100, 100);
  const isComplete = solvedToday >= goal;
  const barRef     = useRef<HTMLDivElement>(null);

  const [editing, setEditing]   = useState(false);
  const [input, setInput]       = useState(String(goal));
  const [error, setError]       = useState('');
  const inputRef                = useRef<HTMLInputElement>(null);

  // Animate bar width on mount / value change
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    bar.style.width = "0%";
    const raf = requestAnimationFrame(() => { bar.style.width = `${pct}%`; });
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  // Focus input when editing starts
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleEdit = () => {
    setInput(String(goal));
    setError('');
    setEditing(true);
  };

  const handleSave = () => {
    const parsed = parseInt(input, 10);
    if (isNaN(parsed) || parsed <= 0 || parsed > 50) {
      setError('Enter a number between 1 and 50');
      return;
    }
    try {
      setDailyGoal(parsed);
      onGoalChange?.(parsed);
      setEditing(false);
      setError('');
    } catch {
      setError('Failed to save');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  return (
    <div className={`
      relative overflow-hidden rounded-2xl border p-5
      backdrop-blur-sm transition-all duration-300
      ${isComplete
        ? "border-cyan-400/40 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.15)]"
        : "border-white/10 bg-white/5"
      }
    `}>
      {isComplete && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl animate-pulse bg-cyan-400/5" />
      )}

      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Daily Goal
            </p>

            {/* Edit button */}
            {!editing && (
              <button
                onClick={handleEdit}
                aria-label="Edit daily goal"
                className="rounded p-0.5 text-slate-600 transition-colors hover:text-slate-300"
              >
                <Pencil className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Count display or edit input */}
          <div className="mt-1 flex items-end gap-1">
            <span className="text-4xl font-black text-white leading-none">
              {solvedToday}
            </span>
            <span className="mb-1 text-lg text-slate-500 font-medium">/</span>

            {editing ? (
              <div className="mb-1 flex items-center gap-1.5">
                <input
                  ref={inputRef}
                  type="number"
                  min={1}
                  max={50}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); setError(''); }}
                  onKeyDown={handleKeyDown}
                  className="w-14 rounded-md border border-cyan-500/40 bg-white/10 px-2 py-0.5 text-lg font-bold text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                />
                <button onClick={handleSave} aria-label="Save" className="rounded-md bg-cyan-500/20 p-1 text-cyan-400 hover:bg-cyan-500/30 transition-colors">
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button onClick={handleCancel} aria-label="Cancel" className="rounded-md bg-white/5 p-1 text-slate-400 hover:bg-white/10 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <span className="mb-1 text-lg text-slate-500 font-medium">{goal}</span>
            )}
          </div>

          {error && <p className="mt-1 text-[11px] text-rose-400">{error}</p>}
        </div>

        {/* Circular badge */}
        <div className={`
          flex h-12 w-12 flex-col items-center justify-center rounded-full
          border text-xs font-bold transition-all duration-500
          ${isComplete
            ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-300"
            : "border-white/10 bg-white/5 text-slate-400"
          }
        `}>
          <span className="text-base leading-none">{isComplete ? "✓" : "🎯"}</span>
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