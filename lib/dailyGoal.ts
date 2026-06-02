export interface DailyGoalData {
  goal: number;
  solvedToday: number;
  lastDate: string | null;
}

const KEY = "dsa-daily-goal";

const DEFAULT_GOAL = 5;

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isValidGoalData(obj: unknown): obj is DailyGoalData {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.goal === "number" && isFinite(o.goal) && o.goal > 0 &&
    typeof o.solvedToday === "number" && isFinite(o.solvedToday) &&
    (o.lastDate === null || typeof o.lastDate === "string")
  );
}

function defaultData(): DailyGoalData {
  return { goal: DEFAULT_GOAL, solvedToday: 0, lastDate: null };
}

export function getDailyGoal(): DailyGoalData {
  if (typeof window === "undefined") return defaultData(); // fix: SSR guard

  const saved = localStorage.getItem(KEY);
  if (!saved) return defaultData();

  try {
    const parsed: unknown = JSON.parse(saved); // fix: try/catch + validate
    return isValidGoalData(parsed) ? parsed : defaultData();
  } catch {
    return defaultData();
  }
}

export function setDailyGoal(goal: number): DailyGoalData { // fix: expose goal setter
  if (typeof window === "undefined") return defaultData();
  if (goal <= 0 || !isFinite(goal)) throw new RangeError("goal must be a positive finite number");

  const data = getDailyGoal();
  const updated: DailyGoalData = { ...data, goal };
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function updateDailyGoal(): DailyGoalData {
  if (typeof window === "undefined") return defaultData(); // fix: SSR guard

  const today = toLocalDateString(new Date()); // fix: local date
  const data = getDailyGoal();

  if (data.lastDate !== today) {
    data.solvedToday = 0; // reset on new day
    data.lastDate = today;
  }

  data.solvedToday += 1;
  localStorage.setItem(KEY, JSON.stringify(data));
  return data;
}