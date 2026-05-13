import { checkAchievements } from "./checkAchievements";
import type { AchievementType } from "./checkAchievements";
import type { EmotionRecord } from "../../types/emotion";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRecord(date: string): EmotionRecord {
  return {
    date,
    emotion: "feliz",
    intensity: 5,
    reflection: "",
    createdAt: null,
    updatedAt: null,
  };
}

/** Returns a YYYY-MM-DD string that is `n` days before today (0 = today). */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** n consecutive records ending today. */
function consecutiveDays(count: number): EmotionRecord[] {
  return Array.from({ length: count }, (_, i) => makeRecord(daysAgo(i)));
}

// ── checkAchievements ─────────────────────────────────────────────────────────

describe("checkAchievements", () => {
  it("returns [] for empty records and zero recommendations", () => {
    expect(
      checkAchievements({
        records: [],
        completedRecommendations: 0,
        existingTypes: [],
      }),
    ).toEqual([]);
  });

  it("returns [] when only today has a record but no threshold is reached", () => {
    const result = checkAchievements({
      records: [makeRecord(daysAgo(0))],
      completedRecommendations: 0,
      existingTypes: [],
    });
    expect(result).toEqual([]);
  });

  // ── streak achievements ───────────────────────────────────────────────────

  it("unlocks racha_7 with exactly 7 consecutive days ending today", () => {
    const result = checkAchievements({
      records: consecutiveDays(7),
      completedRecommendations: 0,
      existingTypes: [],
    });
    expect(result).toContain("racha_7");
  });

  it("does NOT unlock racha_7 with only 6 consecutive days", () => {
    const result = checkAchievements({
      records: consecutiveDays(6),
      completedRecommendations: 0,
      existingTypes: [],
    });
    expect(result).not.toContain("racha_7");
  });

  it("does NOT unlock racha_7 when the streak is broken (today missing)", () => {
    // Records from yesterday backwards — today has no entry → streak = 0
    const records = Array.from({ length: 7 }, (_, i) =>
      makeRecord(daysAgo(i + 1)),
    );
    const result = checkAchievements({
      records,
      completedRecommendations: 0,
      existingTypes: [],
    });
    expect(result).not.toContain("racha_7");
  });

  it("unlocks racha_30 with 30 consecutive days (also unlocks racha_7)", () => {
    const result = checkAchievements({
      records: consecutiveDays(30),
      completedRecommendations: 0,
      existingTypes: [],
    });
    expect(result).toContain("racha_30");
    expect(result).toContain("racha_7");
  });

  it("does NOT unlock racha_30 with only 29 consecutive days", () => {
    const result = checkAchievements({
      records: consecutiveDays(29),
      completedRecommendations: 0,
      existingTypes: [],
    });
    expect(result).not.toContain("racha_30");
  });

  // ── registros_30 ──────────────────────────────────────────────────────────

  it("unlocks registros_30 when there are exactly 30 records (non-consecutive)", () => {
    // Use fixed past dates — no streak implied
    const records = Array.from({ length: 30 }, (_, i) =>
      makeRecord(`2025-01-${String(i + 1).padStart(2, "0")}`),
    );
    const result = checkAchievements({
      records,
      completedRecommendations: 0,
      existingTypes: [],
    });
    expect(result).toContain("registros_30");
  });

  it("does NOT unlock registros_30 with only 29 records", () => {
    const records = Array.from({ length: 29 }, (_, i) =>
      makeRecord(`2025-01-${String(i + 1).padStart(2, "0")}`),
    );
    const result = checkAchievements({
      records,
      completedRecommendations: 0,
      existingTypes: [],
    });
    expect(result).not.toContain("registros_30");
  });

  // ── recomendaciones_5 ─────────────────────────────────────────────────────

  it("unlocks recomendaciones_5 with exactly 5 completed recommendations", () => {
    const result = checkAchievements({
      records: [],
      completedRecommendations: 5,
      existingTypes: [],
    });
    expect(result).toContain("recomendaciones_5");
  });

  it("unlocks recomendaciones_5 with more than 5 completed recommendations", () => {
    const result = checkAchievements({
      records: [],
      completedRecommendations: 10,
      existingTypes: [],
    });
    expect(result).toContain("recomendaciones_5");
  });

  it("does NOT unlock recomendaciones_5 with 4 completed recommendations", () => {
    const result = checkAchievements({
      records: [],
      completedRecommendations: 4,
      existingTypes: [],
    });
    expect(result).not.toContain("recomendaciones_5");
  });

  // ── already-existing achievements ─────────────────────────────────────────

  it("does NOT re-unlock an achievement that already exists", () => {
    const existingTypes: AchievementType[] = ["racha_7", "recomendaciones_5"];
    const result = checkAchievements({
      records: consecutiveDays(7),
      completedRecommendations: 5,
      existingTypes,
    });
    expect(result).not.toContain("racha_7");
    expect(result).not.toContain("recomendaciones_5");
  });

  it("only returns achievements NOT already in existingTypes", () => {
    // racha_7 already earned; registros_30 is new
    const records30 = Array.from({ length: 30 }, (_, i) =>
      makeRecord(`2025-02-${String(i + 1).padStart(2, "0")}`),
    );
    const result = checkAchievements({
      records: records30,
      completedRecommendations: 0,
      existingTypes: ["racha_7"],
    });
    expect(result).toContain("registros_30");
    expect(result).not.toContain("racha_7");
  });

  // ── multiple achievements at once ─────────────────────────────────────────

  it("returns multiple new achievements when several conditions are met", () => {
    const result = checkAchievements({
      records: consecutiveDays(7),
      completedRecommendations: 5,
      existingTypes: [],
    });
    expect(result).toContain("racha_7");
    expect(result).toContain("recomendaciones_5");
  });
});
