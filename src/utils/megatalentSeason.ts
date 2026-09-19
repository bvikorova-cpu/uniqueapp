// Megatalent contest season helper — isolated additive module.
// Seasons are calendar quarters: 1.1–31.3, 1.4–30.6, 1.7–30.9, 1.10–31.12.
// Signups made during the LAST month of a quarter roll into the next quarter,
// because the remaining days are too short to compete fairly.

export interface MegatalentSeason {
  start: Date;
  end: Date;
  label: string;
}

export function getMegatalentSignupSeason(now: Date = new Date()): MegatalentSeason {
  let quarter = Math.floor(now.getUTCMonth() / 3);
  let year = now.getUTCFullYear();
  // Last month of the quarter (Mar/Jun/Sep/Dec) → next quarter is the signup season.
  if (now.getUTCMonth() % 3 === 2) {
    quarter += 1;
    if (quarter === 4) {
      quarter = 0;
      year += 1;
    }
  }
  const start = new Date(Date.UTC(year, quarter * 3, 1));
  const end = new Date(Date.UTC(year, quarter * 3 + 3, 0, 23, 59, 59));
  return { start, end, label: `Q${quarter + 1} ${year}` };
}

/** Label like "Q4 2026" derived from an ISO date (YYYY-MM-DD) period start. */
export function megatalentSeasonLabelFromStart(periodStart: string): string {
  const d = new Date(`${periodStart}T00:00:00Z`);
  if (isNaN(d.getTime())) return "";
  return `Q${Math.floor(d.getUTCMonth() / 3) + 1} ${d.getUTCFullYear()}`;
}
