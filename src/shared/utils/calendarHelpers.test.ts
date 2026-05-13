import {
  buildMonthGrid,
  shiftMonth,
  parseISODate,
  monthLabel,
  dayLabels,
} from "./calendarHelpers";

// ── buildMonthGrid ────────────────────────────────────────────────────────────

describe("buildMonthGrid", () => {
  it("returns a 6×7 grid", () => {
    const grid = buildMonthGrid(2026, 5); // May 2026
    expect(grid).toHaveLength(6);
    grid.forEach((week) => expect(week).toHaveLength(7));
  });

  it("May 2026: first non-null cell is '2026-05-01' at index 4 of the first row (Mon=0…Fri=4)", () => {
    // May 1 2026 is a Friday → Mon(0)–Thu(3) are null, Fri(4) = '2026-05-01'
    const grid = buildMonthGrid(2026, 5);
    const firstRow = grid[0];
    expect(firstRow[0]).toBeNull(); // Monday
    expect(firstRow[1]).toBeNull(); // Tuesday
    expect(firstRow[2]).toBeNull(); // Wednesday
    expect(firstRow[3]).toBeNull(); // Thursday
    expect(firstRow[4]).toBe("2026-05-01"); // Friday
    expect(firstRow[5]).toBe("2026-05-02"); // Saturday
    expect(firstRow[6]).toBe("2026-05-03"); // Sunday
  });

  it("February 2024 (leap year) contains '2024-02-29'", () => {
    const grid = buildMonthGrid(2024, 2);
    const allCells = grid.flat();
    expect(allCells).toContain("2024-02-29");
  });

  it("February 2023 (non-leap) does NOT contain '2023-02-29'", () => {
    const grid = buildMonthGrid(2023, 2);
    const allCells = grid.flat();
    expect(allCells).not.toContain("2023-02-29");
  });

  it("February 2023 ends on '2023-02-28'", () => {
    const grid = buildMonthGrid(2023, 2);
    const allCells = grid.flat().filter(Boolean);
    expect(allCells[allCells.length - 1]).toBe("2023-02-28");
  });

  it("May 2026 has exactly 31 non-null cells", () => {
    const grid = buildMonthGrid(2026, 5);
    const nonNull = grid.flat().filter(Boolean);
    expect(nonNull).toHaveLength(31);
  });
});

// ── shiftMonth ────────────────────────────────────────────────────────────────

describe("shiftMonth", () => {
  it("advances December 2026 by 1 → January 2027", () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
  });

  it("retreats January 2026 by 1 → December 2025", () => {
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
  });

  it("delta 0 returns same month", () => {
    expect(shiftMonth(2026, 6, 0)).toEqual({ year: 2026, month: 6 });
  });

  it("advances by 12 returns same month next year", () => {
    expect(shiftMonth(2026, 3, 12)).toEqual({ year: 2027, month: 3 });
  });
});

// ── parseISODate ──────────────────────────────────────────────────────────────

describe("parseISODate", () => {
  it("parses '2026-04-15' correctly", () => {
    expect(parseISODate("2026-04-15")).toEqual({
      year: 2026,
      month: 4,
      day: 15,
    });
  });

  it("parses '2026-01-01' correctly", () => {
    expect(parseISODate("2026-01-01")).toEqual({
      year: 2026,
      month: 1,
      day: 1,
    });
  });
});

// ── monthLabel ────────────────────────────────────────────────────────────────

describe("monthLabel", () => {
  it("1 → 'Enero'", () => expect(monthLabel(1)).toBe("Enero"));
  it("4 → 'Abril'", () => expect(monthLabel(4)).toBe("Abril"));
  it("12 → 'Diciembre'", () => expect(monthLabel(12)).toBe("Diciembre"));
  it("7 → 'Julio'", () => expect(monthLabel(7)).toBe("Julio"));
});

// ── dayLabels ─────────────────────────────────────────────────────────────────

describe("dayLabels", () => {
  it("has exactly 7 items", () => expect(dayLabels).toHaveLength(7));
  it("first is 'L'", () => expect(dayLabels[0]).toBe("L"));
  it("last is 'D'", () => expect(dayLabels[6]).toBe("D"));
});
