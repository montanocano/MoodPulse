// Shared formatting utilities — add helpers here as the app grows.

/** Format a YYYY-MM-DD date string as a localised short date (e.g. "16 abr. 2026"). */
export function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
