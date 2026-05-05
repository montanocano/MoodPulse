import { formatShortDate } from "./formatters";

describe("formatShortDate", () => {
  it("formats '2026-04-15' and includes '15', 'abr' and '2026'", () => {
    const result = formatShortDate("2026-04-15").toLowerCase();
    expect(result).toContain("15");
    expect(result).toContain("abr");
    expect(result).toContain("2026");
  });

  it("formats '2026-01-01' and includes '1', 'ene' and '2026'", () => {
    const result = formatShortDate("2026-01-01").toLowerCase();
    expect(result).toContain("1");
    expect(result).toContain("ene");
    expect(result).toContain("2026");
  });

  it("formats '2026-12-31' and includes '31', 'dic' and '2026'", () => {
    const result = formatShortDate("2026-12-31").toLowerCase();
    expect(result).toContain("31");
    expect(result).toContain("dic");
    expect(result).toContain("2026");
  });
});
