const STORAGE_KEY = 'dsa-solved-backup';

/** Validates that a parsed value is an array of strings */
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

/**
 * Persists the current solved problems set to localStorage.
 * Safe to call during SSR (performs a silent no-op).
 */
export function saveSolvedProblems(solved: Set<string>): void { // fix: narrowed to Set<string> only
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...solved]));
  } catch (error) {
    console.error('Failed to save solved problems to localStorage:', error);
  }
}

/**
 * Retrieves the solved problems from localStorage as a Set.
 * Safe to call during SSR (returns an empty Set fallback).
 */
export function getSolvedProblems(): Set<string> { // fix: returns Set<string> consistently
  if (typeof window === 'undefined') return new Set();

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return new Set();

  try {
    const parsed: unknown = JSON.parse(saved);
    return isStringArray(parsed) // fix: validates element types, not just Array.isArray
      ? new Set(parsed)
      : new Set();
  } catch (error) {
    console.error('Failed to parse solved problems from localStorage:', error);
    return new Set();
  }
}