export interface WeeklyDay {
  day: string;
  solved: number;
}

export interface DailyProgress {
  date: string;
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

/** Returns a local YYYY-MM-DD string without UTC conversion */
function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getWeeklyAnalytics(): WeeklyAnalyticsData {
  if (typeof window === "undefined") {
    return {
      totalSolved: 0,
      averageSolved: 0,
      bestDay: "-",
      bestSolved: 0,
      days: [],
    };
  }

  const history: DailyProgress[] = JSON.parse(
    localStorage.getItem("dsa-progress-history") || "[]"
  );

  const today = new Date();
  const days: WeeklyDay[] = [];

  let totalSolved = 0;
  let bestSolved = 0;
  let bestDay = "-"; // fix: neutral default, not "Day 1"
  let activeDays = 0; // fix: count only days with data

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const dateString = toLocalDateString(date); // fix: use local date
    const entry = history.find((item) => item.date === dateString);
    const solved = entry?.solved ?? 0;

    const dayLabel = DAY_LABELS[date.getDay()]; // fix: real weekday name

    days.push({ day: dayLabel, solved });

    totalSolved += solved;

    if (entry) activeDays++; // fix: only count days that exist in history

    if (solved > bestSolved) {
      bestSolved = solved;
      bestDay = dayLabel;
    }
  }

  return {
    totalSolved,
    averageSolved:
      activeDays > 0
        ? Number((totalSolved / activeDays).toFixed(1)) // fix: divide by active days
        : 0,
    bestDay,
    bestSolved,
    days,
  };
}