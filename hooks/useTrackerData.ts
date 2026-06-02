import { useState, useEffect, useCallback } from "react";

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
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

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
        if (localSolved.size > 0) setSolved(localSolved);

        const res = await fetch("/api/problems");
        if (!res.ok) throw new Error("Failed to fetch problems");

        const data         = await res.json();
        const serverSolved = new Set<string>(data.solved ?? []);

        setSolved(serverSolved);
        saveSolvedProblems(serverSolved);
        await fetchStats();
      } catch (err) {
        console.error("Offline mode active:", err);
        setSolved(getSolvedProblems());
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchStats]);

  const toggleProblem = useCallback(async (problemId: string) => {
    // ✅ adding ko pehle synchronously read karo current state se
    // dono setSolved calls isko use karengi — stale hone ka koi chance nahi
    let adding = false;

    setSolved((prev) => {
      adding = !prev.has(problemId); // ✅ actual current state se derive hoga
      const updated = new Set(prev);

      if (adding) {
        updated.add(problemId);
      } else {
        updated.delete(problemId);
      }

      saveSolvedProblems(updated);

      // ✅ sirf CHECK pe chalega, uncheck pe nahi
      if (adding) {
        addSolvedProblemToday();
        updateStreak();
        updateDailyGoal();
      }

      return updated;
    });

    // Server sync — ab `adding` sahi value hold karta hai
    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, solved: adding }),
      });

      if (!res.ok) throw new Error("Server failed to persist change");

      const data   = await res.json();
      const latest = new Set<string>(data.solved ?? []);
      setSolved(latest);
      saveSolvedProblems(latest);
      await fetchStats();
    } catch (err) {
      console.error("Sync failed, rolling back:", err);

      setSolved((cur) => {
        const rolledBack = new Set(cur);
        if (adding) rolledBack.delete(problemId);
        else        rolledBack.add(problemId);
        saveSolvedProblems(rolledBack);
        return rolledBack;
      });

      await fetchStats();
    }
  }, [fetchStats]);

  return { solved, stats, loading, toggleProblem };
}