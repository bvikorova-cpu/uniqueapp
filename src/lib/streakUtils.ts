/**
 * A streak is only "live" when the last recorded activity is today or
 * yesterday. Older rows are stale (the user broke the streak) and must be
 * displayed as 0 instead of the last stored value.
 */
export function liveStreak(currentStreak: number, lastActiveDate?: string | null): number {
  if (!currentStreak || !lastActiveDate) return 0;
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const yesterdayIso = new Date(today.getTime() - 86400000).toISOString().slice(0, 10);
  return lastActiveDate === todayIso || lastActiveDate === yesterdayIso ? currentStreak : 0;
}
