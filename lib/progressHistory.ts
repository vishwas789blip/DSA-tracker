export interface DailyProgress {
  date: string;
  solved: number;
}

// Explicit shape is clearer than a plain index signature
export type ProgressHistory = Record<string, number>;

const STORAGE_KEY = "dsa-progress-history";

/** Returns local YYYY-MM-DD without UTC conversion */
function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parses a YYYY-MM-DD key as local midnight to avoid UTC offset issues */
function parseLocalDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

/** Validates that a parsed history object has only numeric values */
function isValidHistory(obj: unknown): obj is ProgressHistory {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return false;
  return Object.values(obj).every((v) => typeof v === "number" && isFinite(v));
}

export function getProgressHistory(): ProgressHistory {
  if (typeof window === "undefined") return {};

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return {};

  try {
    const parsed: unknown = JSON.parse(saved);
    return isValidHistory(parsed) ? parsed : {}; // fix: validate shape
  } catch {
    return {};
  }
}

export function saveProgressHistory(history: ProgressHistory): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function addSolvedProblemToday(): ProgressHistory {
  const today = toLocalDateString(new Date()); // fix: local date
  const history = getProgressHistory();
  history[today] = (history[today] ?? 0) + 1;
  saveProgressHistory(history);
  return history;
}

export function getTodaySolvedCount(): number {
  const today = toLocalDateString(new Date()); // fix: local date
  return getProgressHistory()[today] ?? 0;
}

export function getThisWeekSolved(): number {
  const history = getProgressHistory();
  const now = new Date(); // fix: one shared snapshot
  let total = 0;

  for (let i = 0; i < 7; i++) {
    const date = new Date(now); // fix: clone snapshot, don't re-call new Date()
    date.setDate(now.getDate() - i);
    total += history[toLocalDateString(date)] ?? 0; // fix: local date key
  }

  return total;
}

export function getThisMonthSolved(): number {
  const history = getProgressHistory();
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  let total = 0;

  for (const [date, count] of Object.entries(history)) {
    const d = parseLocalDate(date); // fix: parse as local midnight, not UTC
    if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
      total += count;
    }
  }

  return total;
}

/** Returns best single-day count, or null if no history exists */
export function getBestDay(): number | null { // fix: null signals "no data"
  const values = Object.values(getProgressHistory());
  if (values.length === 0) return null;
  return Math.max(...values);
}