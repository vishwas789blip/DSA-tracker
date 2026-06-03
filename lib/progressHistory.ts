export interface DailyProgress {
  date: string;
  solved: number;
}

export type ProgressHistory = Record<string, number>;

const STORAGE_KEY = "dsa-progress-history";

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseLocalDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

function isValidHistory(obj: unknown): obj is ProgressHistory {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return false;
  return Object.values(obj).every((v) => typeof v === "number" && Number.isFinite(v));
}

export function getProgressHistory(): ProgressHistory {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    const parsed: unknown = JSON.parse(saved);
    return isValidHistory(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function saveProgressHistory(history: ProgressHistory): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/**
 * ✅ Fix: Instead of blindly +1/-1 on every toggle,
 * directly SET today's count from the actual solved set.
 * This way check/uncheck always reflects truth — never drifts.
 */
export function syncTodayCount(solvedSet: Set<string>, allProblemIds: string[]): void {
  const today   = toLocalDateString(new Date());
  const history = getProgressHistory();

  // Count how many problems from the full list are in the solved set
  const todayCount = allProblemIds.filter((id) => solvedSet.has(id)).length;

  history[today] = todayCount;
  saveProgressHistory(history);
}

/** @deprecated Use syncTodayCount instead — this blindly increments and causes drift */
export function addSolvedProblemToday(): ProgressHistory {
  const today   = toLocalDateString(new Date());
  const history = getProgressHistory();
  history[today] = (history[today] ?? 0) + 1;
  saveProgressHistory(history);
  return history;
}

export function getTodaySolvedCount(): number {
  const today = toLocalDateString(new Date());
  return getProgressHistory()[today] ?? 0;
}

export function getThisWeekSolved(): number {
  const history = getProgressHistory();
  const now     = new Date();
  let total     = 0;

  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    total += history[toLocalDateString(date)] ?? 0;
  }

  return total;
}

export function getThisMonthSolved(): number {
  const history    = getProgressHistory();
  const now        = new Date();
  const thisMonth  = now.getMonth();
  const thisYear   = now.getFullYear();
  let total        = 0;

  for (const [date, count] of Object.entries(history)) {
    const d = parseLocalDate(date);
    if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
      total += count;
    }
  }

  return total;
}

export function getBestDay(): number | null {
  const values = Object.values(getProgressHistory());
  if (values.length === 0) return null;
  return Math.max(...values);
}