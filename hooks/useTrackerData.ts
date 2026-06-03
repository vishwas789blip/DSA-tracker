import { useState, useEffect, useCallback, useRef } from "react";

import { updateStreak } from "@/lib/streak";
import { syncDailyGoal } from "@/lib/dailyGoal";
import { syncTodayCount, getTodaySolvedCount } from "@/lib/progressHistory";
import { saveSolvedProblems, getSolvedProblems } from "@/lib/localBackup";
import { DSA_MONTHS } from "@/lib/dsa-problems";

const ALL_PROBLEM_IDS = DSA_MONTHS.flatMap((m) =>
  m.weeks.flatMap((w) => w.probs.map((p) => p.id))
);

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
  const [solved, setSolved]   = useState<Set<string>>(new Set());
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const solvedRef = useRef<Set<string>>(new Set());

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) setStats(await res.json());
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const localSolved = getSolvedProblems();
        if (localSolved.size > 0) {
          setSolved(localSolved);
          solvedRef.current = localSolved;
        }

        const res = await fetch("/api/problems");
        if (!res.ok) throw new Error("Failed to fetch problems");

        const data         = await res.json();
        const serverSolved = new Set<string>(data.solved ?? []);

        setSolved(serverSolved);
        solvedRef.current = serverSolved;
        saveSolvedProblems(serverSolved);
        await fetchStats();
      } catch (err) {
        console.error("Offline mode active:", err);
        const backup = getSolvedProblems();
        setSolved(backup);
        solvedRef.current = backup;
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchStats]);

  const syncMetrics = useCallback((solvedSet: Set<string>) => {
    syncTodayCount(solvedSet, ALL_PROBLEM_IDS);
    syncDailyGoal(getTodaySolvedCount());
  }, []);

  const toggleProblem = useCallback(async (problemId: string) => {
    const adding = !solvedRef.current.has(problemId);

    // Optimistic update
    const updated = new Set(solvedRef.current);
    if (adding) updated.add(problemId);
    else        updated.delete(problemId);

    solvedRef.current = updated;
    setSolved(updated);
    saveSolvedProblems(updated);
    syncMetrics(updated); // ✅ Fix 3a: sync immediately on optimistic update

    if (adding) updateStreak();

    // Server sync
    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, solved: adding }),
      });

      if (!res.ok) throw new Error("Server failed to persist change");

      const data   = await res.json();
      const latest = new Set<string>(data.solved ?? []);

      solvedRef.current = latest;
      setSolved(latest);
      saveSolvedProblems(latest);
      syncMetrics(latest); // ✅ Fix 3b: sync again after server confirms
      await fetchStats();

    } catch (err) {
      console.error("Sync failed, rolling back:", err);

      const rolledBack = new Set(solvedRef.current);
      if (adding) rolledBack.delete(problemId);
      else        rolledBack.add(problemId);

      solvedRef.current = rolledBack;
      setSolved(rolledBack);
      saveSolvedProblems(rolledBack);
      syncMetrics(rolledBack); // ✅ Fix 3c: sync on rollback too
      await fetchStats();
    }
  }, [fetchStats, syncMetrics]);

  return { solved, stats, loading, toggleProblem };
}