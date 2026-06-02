export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastSolvedDate: string | null;
}

const STREAK_KEY = "dsa-streak";

/** Returns local YYYY-MM-DD without UTC conversion */
function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Computes the difference in calendar days between two local date strings.
 * Parses as local midnight to avoid any UTC offset issues.
 */
function calendarDayDiff(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  // Appending T00:00:00 makes Date parse as local midnight, not UTC
  const dateA = new Date(`${a}T00:00:00`).getTime();
  const dateB = new Date(`${b}T00:00:00`).getTime();
  return Math.round((dateB - dateA) / msPerDay); // round guards DST edge cases
}

export function getStreakData(): StreakData {
  if (typeof window === "undefined") {
    return { currentStreak: 0, bestStreak: 0, lastSolvedDate: null };
  }

  const saved = localStorage.getItem(STREAK_KEY);
  if (!saved) {
    return { currentStreak: 0, bestStreak: 0, lastSolvedDate: null };
  }

  try {
    return JSON.parse(saved); // fix: guard against malformed data
  } catch {
    return { currentStreak: 0, bestStreak: 0, lastSolvedDate: null };
  }
}

export function saveStreakData(data: StreakData): void {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

export function updateStreak(): StreakData {
  const data = getStreakData();
  const todayString = toLocalDateString(new Date()); // fix: local date

  if (!data.lastSolvedDate) {
    const fresh: StreakData = {
      currentStreak: 1,
      bestStreak: Math.max(1, data.bestStreak),
      lastSolvedDate: todayString,
    };
    saveStreakData(fresh);
    return fresh;
  }

  // fix: compare calendar dates, not timestamps
  const diffDays = calendarDayDiff(data.lastSolvedDate, todayString);

  if (diffDays === 0) {
    return data; // already updated today
  }

  const current = diffDays === 1
    ? data.currentStreak + 1  // consecutive day
    : 1;                      // streak broken

  const updated: StreakData = {
    currentStreak: current,
    bestStreak: Math.max(current, data.bestStreak),
    lastSolvedDate: todayString,
  };

  saveStreakData(updated);
  return updated;
}