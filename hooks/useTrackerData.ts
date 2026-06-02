import { useState, useEffect, useCallback, useRef } from "react";

import { updateStreak } from "@/lib/streak";
import { updateDailyGoal } from "@/lib/dailyGoal";
import { addSolvedProblemToday } from "@/lib/progressHistory";
import { saveSolvedProblems, getSolvedProblems } from "@/lib/localBackup";

interface MonthStat {
  id: string;
  name: string;
  total: number;
  solved: number;
  percentage: number;
}

interface Stats {
  totalProblems: number;
  solvedCount: number;
  percentage: number;
  monthStats: MonthStat[];
}

export function useTrackerData() {
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // fix: track wasAdded outside the updater to avoid reading race
  const wasAddedRef = useRef(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/stats");
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // fix: getSolvedProblems() returns Set<string> — use .size, not .length
        const localSolved = getSolvedProblems();
        if (localSolved.size > 0) {
          setSolved(localSolved); // fix: already a Set, no re-wrapping needed
        }

        const response = await fetch("/api/problems");
        if (!response.ok) throw new Error("Failed to fetch problems");

        const data = await response.json();
        const serverSolved = new Set<string>(data.solved || []);

        setSolved(serverSolved);
        saveSolvedProblems(serverSolved); // fix: pass Set directly, not [...serverSolved]

        await fetchStats();
      } catch (error) {
        console.error("Offline mode active:", error);
        const backup = getSolvedProblems();
        setSolved(backup); // fix: already a Set
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchStats]);

  const toggleProblem = useCallback(async (problemId: string) => {

    // Phase 1: Compute next state synchronously before touching React
    // fix: derive wasAdded before the updater so side-effects run exactly once
    setSolved((prev) => {
      const updated = new Set(prev);
      const adding = !updated.has(problemId);

      wasAddedRef.current = adding; // fix: stable ref, not a closure variable

      if (adding) {
        updated.add(problemId);
      } else {
        updated.delete(problemId);
      }

      saveSolvedProblems(updated); // fix: pass Set directly
      return updated;
    });

    // fix: read the ref after the updater has been queued
    const wasAdded = wasAddedRef.current;

    // fix: side-effects moved outside the updater — won't double-fire in Strict Mode
    if (wasAdded) {
      addSolvedProblemToday();
      updateStreak();
      updateDailyGoal();
    }

    // Phase 2: Server persistence
    try {
      const response = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, solved: wasAdded }),
      });

      if (!response.ok) throw new Error("Server failed to persist change");

      const data = await response.json();
      const latestSolved = new Set<string>(data.solved ?? []);

      setSolved(latestSolved);
      saveSolvedProblems(latestSolved); // fix: pass Set directly
      await fetchStats();

    } catch (error) {
      console.error("Sync failed, rolling back:", error);

      // Atomic rollback: invert only the target item, not the whole snapshot
      setSolved((currentSet) => {
        const rolledBack = new Set(currentSet);
        if (wasAdded) {
          rolledBack.delete(problemId);
        } else {
          rolledBack.add(problemId);
        }
        saveSolvedProblems(rolledBack); // fix: pass Set directly
        return rolledBack;
      });

      await fetchStats();
    }
  }, [fetchStats]);

  return { solved, stats, loading, toggleProblem };
}