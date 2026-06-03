export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastSolvedDate: string | null;
}

const STREAK_KEY = "dsa-streak";

const EMPTY_STREAK: StreakData = {
  currentStreak: 0,
  bestStreak: 0,
  lastSolvedDate: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function calendarDayDiff(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const dateA = new Date(`${a}T00:00:00`).getTime();
  const dateB = new Date(`${b}T00:00:00`).getTime();
  return Math.round((dateB - dateA) / msPerDay);
}

// ✅ Fix 4: validate shape before using — corrupt/legacy data won't crash
function isValidStreakData(obj: unknown): obj is StreakData {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.currentStreak === "number" && Number.isFinite(o.currentStreak) &&
    typeof o.bestStreak    === "number" && Number.isFinite(o.bestStreak) &&
    (o.lastSolvedDate === null || typeof o.lastSolvedDate === "string")
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getStreakData(): StreakData {
  if (typeof window === "undefined") return { ...EMPTY_STREAK };

  try {
    const saved = localStorage.getItem(STREAK_KEY);
    if (!saved) return { ...EMPTY_STREAK };

    const parsed: unknown = JSON.parse(saved);
    return isValidStreakData(parsed) ? parsed : { ...EMPTY_STREAK };
  } catch {
    return { ...EMPTY_STREAK };
  }
}

export function saveStreakData(data: StreakData): void {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

export function updateStreak(): StreakData {
  const data        = getStreakData();
  const todayString = toLocalDateString(new Date());

  if (!data.lastSolvedDate) {
    const fresh: StreakData = {
      currentStreak: 1,
      bestStreak:    Math.max(1, data.bestStreak),
      lastSolvedDate: todayString,
    };
    saveStreakData(fresh);
    return fresh;
  }

  const diffDays = calendarDayDiff(data.lastSolvedDate, todayString);

  if (diffDays === 0) return data; // already updated today

  const current = diffDays === 1 ? data.currentStreak + 1 : 1;

  const updated: StreakData = {
    currentStreak:  current,
    bestStreak:     Math.max(current, data.bestStreak),
    lastSolvedDate: todayString,
  };

  saveStreakData(updated);
  return updated;
}