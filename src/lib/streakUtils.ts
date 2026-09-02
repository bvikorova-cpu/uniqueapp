/** Local (device timezone) YYYY-MM-DD — matches the server, which now uses Europe/Bratislava. */
export function localDateIso(d: Date = new Date()): string {
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 10);
}

/**
 * A streak is only "live" when the last recorded activity is today or
 * yesterday. Older rows are stale (the user broke the streak) and must be
 * displayed as 0 instead of the last stored value.
 */
export function liveStreak(currentStreak: number, lastActiveDate?: string | null): number {
  if (!currentStreak || !lastActiveDate) return 0;
  const today = localDateIso();
  const yesterday = localDateIso(new Date(Date.now() - 86400000));
  return lastActiveDate === today || lastActiveDate === yesterday ? currentStreak : 0;
}
