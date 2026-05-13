import {
  dominantEmotion,
  currentStreak,
  weeklyTrend,
  emotionDistribution,
} from "./statsCalculator";
import { EmotionRecord } from "../../types/emotion";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRecord(
  date: string,
  emotion: EmotionRecord["emotion"],
  intensity = 5,
): EmotionRecord {
  return {
    date,
    emotion,
    intensity,
    reflection: "",
    createdAt: null,
    updatedAt: null,
  };
}

/** Returns a YYYY-MM-DD string that is `offsetDays` before today (0 = today). */
function daysAgo(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

// ── dominantEmotion ───────────────────────────────────────────────────────────

describe("dominantEmotion", () => {
  it("returns the majority emotion", () => {
    const records = [
      makeRecord("2026-04-01", "feliz"),
      makeRecord("2026-04-02", "feliz"),
      makeRecord("2026-04-03", "feliz"),
      makeRecord("2026-04-04", "triste"),
    ];
    expect(dominantEmotion(records)).toBe("feliz");
  });

  it("returns null for empty input", () => {
    expect(dominantEmotion([])).toBeNull();
  });

  it("returns the single emotion when all records are the same", () => {
    const records = [
      makeRecord("2026-04-01", "ansioso"),
      makeRecord("2026-04-02", "ansioso"),
    ];
    expect(dominantEmotion(records)).toBe("ansioso");
  });

  it("returns the first-encountered emotion on a tie", () => {
    const records = [
      makeRecord("2026-04-01", "feliz"),
      makeRecord("2026-04-02", "triste"),
    ];
    // Both appear once; first inserted wins
    expect(dominantEmotion(records)).toBe("feliz");
  });
});

// ── currentStreak ─────────────────────────────────────────────────────────────

describe("currentStreak", () => {
  it("counts 3 consecutive days ending today", () => {
    const today = daysAgo(0);
    const yesterday = daysAgo(1);
    const dayBefore = daysAgo(2);
    const records = [
      makeRecord(today, "feliz"),
      makeRecord(yesterday, "feliz"),
      makeRecord(dayBefore, "feliz"),
    ];
    expect(currentStreak(records, today)).toBe(3);
  });

  it("returns 1 when only today has a record", () => {
    const today = daysAgo(0);
    const records = [makeRecord(today, "feliz")];
    expect(currentStreak(records, today)).toBe(1);
  });

  it("returns 0 when today has no record", () => {
    const today = daysAgo(0);
    const yesterday = daysAgo(1);
    const records = [makeRecord(yesterday, "feliz")];
    expect(currentStreak(records, today)).toBe(0);
  });

  it("returns 0 for empty input", () => {
    expect(currentStreak([], daysAgo(0))).toBe(0);
  });

  it("does not count a gap: record today and 3 days ago (but not yesterday/day-before) → streak 1", () => {
    const today = daysAgo(0);
    const threeDaysAgo = daysAgo(3);
    const records = [
      makeRecord(today, "feliz"),
      makeRecord(threeDaysAgo, "feliz"),
    ];
    expect(currentStreak(records, today)).toBe(1);
  });
});

// ── weeklyTrend ────────────────────────────────────────────────────────────────

describe("weeklyTrend", () => {
  it("returns an array of 7 by default", () => {
    expect(weeklyTrend([])).toHaveLength(7);
  });

  it("returns an array of the requested length", () => {
    expect(weeklyTrend([], 3)).toHaveLength(3);
  });

  it("all entries have emotion:null for empty records", () => {
    const trend = weeklyTrend([]);
    trend.forEach((e) => expect(e.emotion).toBeNull());
  });

  it("fills in records for matching dates", () => {
    const today = daysAgo(0);
    const yesterday = daysAgo(1);
    const threeDaysAgo = daysAgo(3);
    const records = [
      makeRecord(today, "feliz", 8),
      makeRecord(yesterday, "triste", 3),
      makeRecord(threeDaysAgo, "ansioso", 6),
    ];
    const trend = weeklyTrend(records, 7);
    expect(trend).toHaveLength(7);

    const withEmotions = trend.filter((e) => e.emotion !== null);
    expect(withEmotions).toHaveLength(3);

    const todayEntry = trend.find((e) => e.date === today);
    expect(todayEntry?.emotion).toBe("feliz");
    expect(todayEntry?.intensity).toBe(8);
  });

  it("entries are in ascending date order (oldest first)", () => {
    const trend = weeklyTrend([]);
    for (let i = 1; i < trend.length; i++) {
      expect(trend[i].date >= trend[i - 1].date).toBe(true);
    }
  });
});

// ── emotionDistribution ────────────────────────────────────────────────────────

describe("emotionDistribution", () => {
  it("returns [] for empty input", () => {
    expect(emotionDistribution([])).toEqual([]);
  });

  it("calculates correct percentages for 4×feliz + 1×triste", () => {
    const records = [
      makeRecord("2026-04-01", "feliz"),
      makeRecord("2026-04-02", "feliz"),
      makeRecord("2026-04-03", "feliz"),
      makeRecord("2026-04-04", "feliz"),
      makeRecord("2026-04-05", "triste"),
    ];
    const dist = emotionDistribution(records);
    expect(dist[0].emotion).toBe("feliz");
    expect(dist[0].percentage).toBe(80);
    expect(dist[0].count).toBe(4);
    expect(dist[1].emotion).toBe("triste");
    expect(dist[1].percentage).toBe(20);
    expect(dist[1].count).toBe(1);
  });

  it("result is sorted descending by count", () => {
    const records = [
      makeRecord("2026-04-01", "triste"),
      makeRecord("2026-04-02", "feliz"),
      makeRecord("2026-04-03", "feliz"),
      makeRecord("2026-04-04", "feliz"),
    ];
    const dist = emotionDistribution(records);
    for (let i = 1; i < dist.length; i++) {
      expect(dist[i].count).toBeLessThanOrEqual(dist[i - 1].count);
    }
  });

  it("percentages sum to approximately 100 (±1 for rounding)", () => {
    const records = [
      makeRecord("2026-04-01", "feliz"),
      makeRecord("2026-04-02", "feliz"),
      makeRecord("2026-04-03", "triste"),
      makeRecord("2026-04-04", "ansioso"),
      makeRecord("2026-04-05", "neutral"),
      makeRecord("2026-04-06", "agradecido"),
      makeRecord("2026-04-07", "cansado"),
    ];
    const dist = emotionDistribution(records);
    const sum = dist.reduce((acc, e) => acc + e.percentage, 0);
    expect(sum).toBeGreaterThanOrEqual(99);
    expect(sum).toBeLessThanOrEqual(101);
  });
});
