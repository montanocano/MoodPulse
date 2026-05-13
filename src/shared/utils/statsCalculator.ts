// ── Statistics calculator — all pure functions, no side-effects ──────────────

import { EmotionRecord, EmotionType } from "../../types/emotion";
import { todayISO } from "./calendarHelpers";

// ── Types ────────────────────────────────────────────────────────────────────

export interface WeeklyTrendEntry {
  date: string;
  emotion: EmotionType | null;
  intensity: number | null;
}

export interface DistributionEntry {
  emotion: EmotionType;
  percentage: number;
  count: number;
}

// ── dominantEmotion ──────────────────────────────────────────────────────────

/**
 * Returns the EmotionType that appears most often in `records`.
 * On a tie, returns the first one encountered (insertion order).
 * Returns null for an empty array.
 */
export function dominantEmotion(records: EmotionRecord[]): EmotionType | null {
  if (records.length === 0) return null;

  const counts = new Map<EmotionType, number>();
  for (const r of records) {
    counts.set(r.emotion, (counts.get(r.emotion) ?? 0) + 1);
  }

  let best: EmotionType | null = null;
  let bestCount = 0;
  for (const [emotion, count] of counts) {
    if (count > bestCount) {
      bestCount = count;
      best = emotion;
    }
  }
  return best;
}

// ── currentStreak ────────────────────────────────────────────────────────────

/**
 * Returns the number of consecutive days (ending on `today`) that have a record.
 * Returns 0 if there is no record for today.
 */
export function currentStreak(
  records: EmotionRecord[],
  today?: string,
): number {
  const reference = today ?? todayISO();
  const dateSet = new Set(records.map((r) => r.date));

  if (!dateSet.has(reference)) return 0;

  let streak = 0;
  let cursor = reference;

  while (dateSet.has(cursor)) {
    streak++;
    // Move to the previous day — use UTC to avoid local-timezone offset issues
    const [y, m, d] = cursor.split("-").map(Number);
    const prev = new Date(Date.UTC(y, m - 1, d - 1));
    cursor = prev.toISOString().slice(0, 10);
  }

  return streak;
}

// ── weeklyTrend ───────────────────────────────────────────────────────────────

/**
 * Returns an array of `days` entries (default 7) in ascending date order.
 * Each entry covers one calendar day, newest = last element.
 * If a record exists for that date, its emotion and intensity are included.
 * Otherwise emotion and intensity are null.
 */
export function weeklyTrend(
  records: EmotionRecord[],
  days = 7,
): WeeklyTrendEntry[] {
  const byDate = new Map(records.map((r) => [r.date, r]));

  const result: WeeklyTrendEntry[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    // Use UTC to stay consistent with todayISO() which also uses UTC
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i),
    );
    const date = d.toISOString().slice(0, 10);
    const record = byDate.get(date);
    result.push({
      date,
      emotion: record?.emotion ?? null,
      intensity: record != null ? record.intensity : null,
    });
  }

  return result;
}

// ── emotionDistribution ───────────────────────────────────────────────────────

/**
 * Returns each emotion's share as a percentage (0–100, rounded to nearest int)
 * sorted descending by count. Returns [] for empty input.
 */
export function emotionDistribution(
  records: EmotionRecord[],
): DistributionEntry[] {
  if (records.length === 0) return [];

  const counts = new Map<EmotionType, number>();
  for (const r of records) {
    counts.set(r.emotion, (counts.get(r.emotion) ?? 0) + 1);
  }

  const total = records.length;
  const entries: DistributionEntry[] = [];

  for (const [emotion, count] of counts) {
    entries.push({
      emotion,
      count,
      percentage: Math.round((count / total) * 100),
    });
  }

  entries.sort((a, b) => b.count - a.count);
  return entries;
}
