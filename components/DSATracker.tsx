'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

import { DailyGoalCard } from './DailyGoalCard';
import { MonthCard } from './MonthCard';
import { StatsCard } from './StatsCard';
import { SearchBar } from './SearchBar';
import { StreakCard } from './StreakCard';
import WeeklyAnalytics from './WeeklyAnalytics';

import { DSA_MONTHS } from '@/lib/dsa-problems';
import { useTrackerData } from '@/hooks/useTrackerData';
import { getDailyGoal } from '@/lib/dailyGoal';
import { getStreakData, type StreakData } from '@/lib/streak';
import { getWeeklyAnalytics, type WeeklyAnalyticsData } from '@/lib/weeklyAnalytics';
import {
  getTodaySolvedCount,
  getThisWeekSolved,
  getThisMonthSolved,
  getBestDay,
} from '@/lib/progressHistory';

// ── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsState {
  today: number;
  week: number;
  month: number;
  bestDay: number | null;
}

interface GoalState {
  goal: number;
  solvedToday: number;
}

interface Star {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function readLocalMetrics() {
  const goalData = getDailyGoal();
  const streakData = getStreakData();
  return {
    goal: { goal: goalData.goal, solvedToday: goalData.solvedToday } satisfies GoalState,
    streak: {
      currentStreak: streakData.currentStreak,
      bestStreak: streakData.bestStreak,
      lastSolvedDate: streakData.lastSolvedDate,
    } satisfies StreakData,
    analytics: {
      today: getTodaySolvedCount(),
      week: getThisWeekSolved(),
      month: getThisMonthSolved(),
      bestDay: getBestDay(),
    } satisfies AnalyticsState,
    weeklyData: getWeeklyAnalytics() satisfies WeeklyAnalyticsData,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DSATracker() {
  const { solved, stats, loading, toggleProblem } = useTrackerData();

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const [stars, setStars] = useState<Star[]>([]);

  const [, setAnalytics] = useState<AnalyticsState>({
    today: 0, week: 0, month: 0, bestDay: null,
  });
  const [goal, setGoal] = useState<GoalState>({ goal: 5, solvedToday: 0 });
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0, bestStreak: 0, lastSolvedDate: null,
  });
  const [weeklyData, setWeeklyData] = useState<WeeklyAnalyticsData | null>(null);

  const applyMetrics = useCallback((metrics: ReturnType<typeof readLocalMetrics>) => {
    setGoal(metrics.goal);
    setStreak(metrics.streak);
    setAnalytics(metrics.analytics);
    setWeeklyData(metrics.weeklyData);
  }, []);

  // Mount effect: read localStorage and generate stars (both client-only)
  useEffect(() => {
    applyMetrics(readLocalMetrics());

    setStars(
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 5,
      }))
    );
  }, [applyMetrics]);

  const toggleMonth = (monthId: string) => {
    setExpandedMonths((prev) => ({ ...prev, [monthId]: !prev[monthId] }));
  };

  const handleToggleProblem = useCallback(async (problemId: string) => {
    await toggleProblem(problemId);
    applyMetrics(readLocalMetrics());
  }, [toggleProblem, applyMetrics]);

  const filteredMonths = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    return DSA_MONTHS.filter((month) => {
      return (
        !normalizedSearch ||
        month.name.toLowerCase().includes(normalizedSearch) ||
        month.weeks.some((week) =>
          week.probs.some((prob) =>
            prob.n.toLowerCase().includes(normalizedSearch)
          )
        )
      );
    });
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="h-12 w-12 rounded-full border-4 border-cyan-400 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.25),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(6,182,212,0.18),transparent_40%)]" />

      {/* Stars Canvas Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-cyan-400/80"
            style={{ left: `${star.left}%`, top: `${star.top}%`, width: star.size, height: star.size }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 3, delay: star.delay }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10">
        {/* Badge */}
        <div className="mb-10 flex justify-center">
          <div className="rounded-full border border-purple-500/30 bg-purple-500/10 px-6 py-3 text-sm uppercase tracking-[4px] backdrop-blur-xl">
            ⚡ DSA Quest • 840 Problems • 6 Months
          </div>
        </div>

        {/* Hero */}
        <div className="mb-16 text-center">
          <h1 className="bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-400 bg-clip-text text-5xl font-black tracking-tight text-transparent md:text-7xl">
            Crack Every DSA Interview
          </h1>
          <p className="mt-6 text-lg text-slate-400">
            Solve 5 Problems Daily • Track Progress • Get Placement Ready
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="rounded-xl border border-cyan-500/20 bg-white/5 px-6 py-3 backdrop-blur-lg">
              🔥 Consistency Wins
            </div>
            <div className="rounded-xl border border-purple-500/20 bg-white/5 px-6 py-3 backdrop-blur-lg">
              🚀 FAANG Ready
            </div>
          </div>
        </div>

        {/* Overview Stats Header */}
        {stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <StatsCard stats={stats} />
          </motion.div>
        )}

        <div className="mt-6 space-y-6">
          {/* Half-and-Half Split Row for Streak and Daily Goal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StreakCard current={streak.currentStreak} best={streak.bestStreak} />
            <DailyGoalCard goal={goal.goal} solvedToday={goal.solvedToday} />
          </div>

          {/* Weekly Analytics Section */}
          {weeklyData && <WeeklyAnalytics data={weeklyData} />}
        </div>

        {/* Search Input Layout */}
        <div className="my-10">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>

        {/* Month Tracking Grid View */}
        <div className="space-y-8">
          {filteredMonths.map((month, index) => (
            <motion.div
              key={month.id}
              id={`month-${month.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.3) }}
            >
              <MonthCard
                month={month}
                isExpanded={!!expandedMonths[month.id]}
                onToggleExpand={() => toggleMonth(month.id)}
                solved={solved}
                onToggleProblem={handleToggleProblem}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}