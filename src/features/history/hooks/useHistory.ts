import { useMemo } from "react";
import { useEmotionStore } from "../../emotion/store/emotionStore";
import { useHistoryStore } from "../store/historyStore";
import { EmotionRecord, EmotionType } from "../../../types/emotion";
import {
  buildMonthGrid,
  monthLabel,
  todayISO,
} from "../helpers/calendarHelpers";
import {
  dominantEmotion,
  currentStreak,
  weeklyTrend,
  emotionDistribution,
  WeeklyTrendEntry,
  DistributionEntry,
} from "../helpers/statsCalculator";

export interface HistoryViewModel {
  // ── Calendar ──────────────────────────────────────────────────────────────
  year: number;
  month: number;
  monthName: string;
  grid: (string | null)[][];
  recordsByDate: Record<string, EmotionRecord>;
  isCurrentMonth: boolean;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  // ── Detail sheet ─────────────────────────────────────────────────────────
  selectedDate: string | null;
  selectDate: (date: string) => void;
  clearSelection: () => void;
  // ── Stats toggle ──────────────────────────────────────────────────────────
  showStats: boolean;
  setShowStats: (show: boolean) => void;
  // ── Statistics ───────────────────────────────────────────────────────────
  dominant: EmotionType | null;
  streak: number;
  trend: WeeklyTrendEntry[];
  distribution: DistributionEntry[];
  hasEnoughRecords: boolean;
  // ── Misc ──────────────────────────────────────────────────────────────────
  loading: boolean;
}

export function useHistory(): HistoryViewModel {
  // ── History store (calendar navigation state only) ────────────────────────
  const year = useHistoryStore((s) => s.year);
  const month = useHistoryStore((s) => s.month);
  const selectedDate = useHistoryStore((s) => s.selectedDate);
  const showStats = useHistoryStore((s) => s.showStats);
  const goToPrevMonth = useHistoryStore((s) => s.goToPrevMonth);
  const goToNextMonth = useHistoryStore((s) => s.goToNextMonth);
  const selectDate = useHistoryStore((s) => s.selectDate);
  const clearSelection = useHistoryStore((s) => s.clearSelection);
  const setShowStats = useHistoryStore((s) => s.setShowStats);

  // ── Emotion store (locally-cached records — source of truth for UI) ───────
  const allRecords = useEmotionStore((s) => s.records);
  const loading = useEmotionStore((s) => s.loading);

  // ── Derived UI state ──────────────────────────────────────────────────────
  const now = new Date();
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth() + 1;

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  // Filter locally-cached records to the displayed month — no extra Firestore
  // call needed; emotionStore is already persisted to AsyncStorage and receives
  // optimistic updates on every save.
  const recordsByDate = useMemo<Record<string, EmotionRecord>>(() => {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    const map: Record<string, EmotionRecord> = {};
    for (const r of allRecords) {
      if (r.date.startsWith(prefix)) map[r.date] = r;
    }
    return map;
  }, [allRecords, year, month]);

  // Stats computed over all-time records (not just current month)
  const dominant = useMemo(() => dominantEmotion(allRecords), [allRecords]);
  const streak = useMemo(() => currentStreak(allRecords), [allRecords]);
  const trend = useMemo(() => weeklyTrend(allRecords, 7), [allRecords]);
  const distribution = useMemo(
    () => emotionDistribution(allRecords),
    [allRecords],
  );
  const hasEnoughRecords = allRecords.length >= 3;

  return {
    year,
    month,
    monthName: monthLabel(month),
    grid,
    recordsByDate,
    isCurrentMonth,
    goToPrevMonth,
    goToNextMonth,
    selectedDate,
    selectDate,
    clearSelection,
    showStats,
    setShowStats,
    dominant,
    streak,
    trend,
    distribution,
    hasEnoughRecords,
    loading,
  };
}

// Re-export for convenience
export { WeeklyTrendEntry, DistributionEntry };
export { todayISO };
