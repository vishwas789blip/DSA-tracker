import { getProgressHistory } from "./progressHistory";

export interface WeeklyDay {
  day: string;
  solved: number;
}

export interface WeeklyAnalyticsData {
  totalSolved: number;
  averageSolved: number;
  bestDay: string;
  bestSolved: number;
  days: WeeklyDay[];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EMPTY_RESULT: WeeklyAnalyticsData = {
  totalSolved: 0,
  averageSolved: 0,
  bestDay: "-",
  bestSolved: 0,
  days: [],
};

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getWeeklyAnalytics(): WeeklyAnalyticsData {
  if (typeof window === "undefined") return EMPTY_RESULT;

  // fix: use getProgressHistory() (Record<string,number>) instead of
  // reading localStorage directly and calling .find() on a non-array.
  const history = getProgressHistory();

  const today = new Date();
  const days: WeeklyDay[] = [];

  let totalSolved = 0;
  let bestSolved  = 0;
  let bestDay     = "-";
  let activeDays  = 0;

  for (let i = 6; i >= 0; i--) {
    const date   = new Date(today);
    date.setDate(today.getDate() - i);

    const key    = toLocalDateString(date);
    const solved = history[key] ?? 0;   // fix: direct object lookup, no .find()
    const label  = DAY_LABELS[date.getDay()];

    days.push({ day: label, solved });
    totalSolved += solved;

    if (solved > 0) activeDays++;

    if (solved > bestSolved) {
      bestSolved = solved;
      bestDay    = label;
    }
  }

  return {
    totalSolved,
    averageSolved: activeDays > 0
      ? Number((totalSolved / activeDays).toFixed(1))
      : 0,
    bestDay,
    bestSolved,
    days,
  };
}