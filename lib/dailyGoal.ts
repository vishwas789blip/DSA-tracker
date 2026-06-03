export interface DailyGoalData {
  goal: number;
  solvedToday: number;
  lastDate: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const KEY          = "dsa-daily-goal";
const DEFAULT_GOAL = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    typeof o.goal === "number" && Number.isFinite(o.goal) && o.goal > 0 &&
    typeof o.solvedToday === "number" && Number.isFinite(o.solvedToday) &&
    (o.lastDate === null || typeof o.lastDate === "string")
  );
}

function defaultData(): DailyGoalData {
  return { goal: DEFAULT_GOAL, solvedToday: 0, lastDate: null };
}

function persist(data: DailyGoalData): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getDailyGoal(): DailyGoalData {
  if (typeof window === "undefined") return defaultData();

  try {
    const saved = localStorage.getItem(KEY);
    if (!saved) return defaultData();

    const parsed: unknown = JSON.parse(saved);
    return isValidGoalData(parsed) ? parsed : defaultData();
  } catch {
    return defaultData();
  }
}

export function setDailyGoal(goal: number): DailyGoalData {
  if (typeof window === "undefined") return defaultData();
  if (!Number.isFinite(goal) || goal <= 0) {
    throw new RangeError(`goal must be a positive finite number, got: ${goal}`);
  }

  const updated: DailyGoalData = { ...getDailyGoal(), goal };
  persist(updated);
  return updated;
}

/**
 * ✅ Fix: blindly +1 karne ki jagah, directly count SET karo
 * solved set se — check/uncheck dono sahi reflect honge
 */
export function syncDailyGoal(solvedTodayCount: number): DailyGoalData {
  if (typeof window === "undefined") return defaultData();

  const today = toLocalDateString(new Date());
  const data  = getDailyGoal();

  const updated: DailyGoalData = {
    goal:        data.goal,
    solvedToday: solvedTodayCount, // ✅ directly set, no +1
    lastDate:    today,
  };

  persist(updated);
  return updated;
}

/** @deprecated — blindly +1 karta hai, drift hota hai. syncDailyGoal use karo */
export function updateDailyGoal(): DailyGoalData {
  if (typeof window === "undefined") return defaultData();

  const today = toLocalDateString(new Date());
  const data  = getDailyGoal();

  const updated: DailyGoalData = {
    ...data,
    solvedToday: data.lastDate !== today ? 1 : data.solvedToday + 1,
    lastDate:    today,
  };

  persist(updated);
  return updated;
}