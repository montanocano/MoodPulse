// ── Calendar helper utilities — all pure functions, no side-effects ──────────

/** Day-of-week labels starting on Monday (ISO week). */
export const dayLabels = ["L", "M", "X", "J", "V", "S", "D"] as const;

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

/** Returns the Spanish month name for a 1-based month number (1 = Enero … 12 = Diciembre). */
export function monthLabel(month: number): string {
  return MONTH_NAMES[month - 1] ?? "";
}

/** Returns today as a YYYY-MM-DD string. */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Splits a YYYY-MM-DD string into { year, month, day } as numbers. */
export function parseISODate(isoDate: string): {
  year: number;
  month: number;
  day: number;
} {
  const [y, m, d] = isoDate.split("-").map(Number);
  return { year: y, month: m, day: d };
}

/**
 * Advances or retreats { year, month } by `delta` months, handling year rollovers.
 * month is 1-based (1 = January … 12 = December).
 */
export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  // Convert to 0-based total months for arithmetic
  const totalMonths = year * 12 + (month - 1) + delta;
  const newYear = Math.floor(totalMonths / 12);
  const newMonth = (totalMonths % 12) + 1;
  return { year: newYear, month: newMonth };
}

/**
 * Builds a 6-row × 7-column grid for the given month (Mon–Sun ISO week).
 * Cells inside the month are YYYY-MM-DD strings.
 * Padding cells (before the 1st and after the last day) are null.
 */
export function buildMonthGrid(
  year: number,
  month: number,
): (string | null)[][] {
  // Day of week for the 1st of the month (0=Sun … 6=Sat)
  const firstDow = new Date(year, month - 1, 1).getDay();
  // Convert Sunday=0 → 6, Monday=1 → 0, …, Saturday=6 → 5  (ISO Mon=0 … Sun=6)
  const startOffset = (firstDow + 6) % 7;

  const daysInMonth = new Date(year, month, 0).getDate();

  const grid: (string | null)[][] = [];
  let dayOfMonth = 1;

  for (let row = 0; row < 6; row++) {
    const week: (string | null)[] = [];
    for (let col = 0; col < 7; col++) {
      const cellIndex = row * 7 + col;
      if (cellIndex < startOffset || dayOfMonth > daysInMonth) {
        week.push(null);
      } else {
        const mm = String(month).padStart(2, "0");
        const dd = String(dayOfMonth).padStart(2, "0");
        week.push(`${year}-${mm}-${dd}`);
        dayOfMonth++;
      }
    }
    grid.push(week);
  }

  return grid;
}
