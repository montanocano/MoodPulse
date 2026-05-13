import { create } from "zustand";
import { shiftMonth } from "../../../shared/utils/calendarHelpers";

function currentYear(): number {
  return new Date().getFullYear();
}

function currentMonth(): number {
  return new Date().getMonth() + 1; // 1-based
}

interface HistoryState {
  year: number;
  month: number;
  selectedDate: string | null;
  showStats: boolean;
}

interface HistoryActions {
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  selectDate: (date: string) => void;
  clearSelection: () => void;
  setShowStats: (show: boolean) => void;
}

export const useHistoryStore = create<HistoryState & HistoryActions>()(
  (set, get) => ({
    year: currentYear(),
    month: currentMonth(),
    selectedDate: null,
    showStats: false,

    goToPrevMonth: () => {
      const { year, month } = get();
      const shifted = shiftMonth(year, month, -1);
      set({ year: shifted.year, month: shifted.month });
    },

    goToNextMonth: () => {
      const { year, month } = get();
      const isCurrentMonth = year === currentYear() && month === currentMonth();
      if (isCurrentMonth) return;
      const shifted = shiftMonth(year, month, 1);
      set({ year: shifted.year, month: shifted.month });
    },

    selectDate: (date: string) => set({ selectedDate: date }),
    clearSelection: () => set({ selectedDate: null }),
    setShowStats: (show: boolean) => set({ showStats: show }),
  }),
);
