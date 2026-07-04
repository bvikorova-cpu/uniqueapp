import { useEffect, useState } from "react";
import { LimitedEditionBanner } from "./LimitedEditionBanner";

interface Props {
  onView?: () => void;
}

interface SeasonInfo {
  name: string;
  emoji: string;
  year: number;
  start: Date;
  end: Date;
}

// Returns the currently-active season for `now`. Season windows:
//   Winter: Dec 1 – Feb 28/29
//   Spring: Mar 1 – May 31
//   Summer: Jun 1 – Aug 31
//   Autumn: Sep 1 – Nov 30
// The `end` date is exclusive: the moment `now >= end`, the next season starts.
function getCurrentSeason(now: Date): SeasonInfo {
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-11

  // Winter spans two calendar years — split so `start`/`end` are contiguous.
  if (m === 11) {
    return { name: "Winter", emoji: "❄️", year: y + 1, start: new Date(y, 11, 1), end: new Date(y + 1, 2, 1) };
  }
  if (m <= 1) {
    return { name: "Winter", emoji: "❄️", year: y, start: new Date(y - 1, 11, 1), end: new Date(y, 2, 1) };
  }
  if (m <= 4) {
    return { name: "Spring", emoji: "🌸", year: y, start: new Date(y, 2, 1), end: new Date(y, 5, 1) };
  }
  if (m <= 7) {
    return { name: "Summer", emoji: "🔥", year: y, start: new Date(y, 5, 1), end: new Date(y, 8, 1) };
  }
  return { name: "Autumn", emoji: "🍂", year: y, start: new Date(y, 8, 1), end: new Date(y, 11, 1) };
}

function computeDrop(now: Date) {
  const season = getCurrentSeason(now);
  const totalSupply = 500;
  const spanMs = season.end.getTime() - season.start.getTime();
  const elapsed = Math.max(0, Math.min(spanMs, now.getTime() - season.start.getTime()));
  const sold = Math.round((elapsed / spanMs) * (totalSupply - 40)) + 40;
  const remaining = Math.max(12, totalSupply - sold);
  // Last visible day = end - 1 day (end is exclusive next-season start).
  const lastDay = new Date(season.end.getTime() - 24 * 60 * 60 * 1000);
  const endsAt = lastDay.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return { season, totalSupply, remaining, endsAt };
}

/**
 * Wraps LimitedEditionBanner with a live-updating season/date/inventory.
 * Recomputes every minute AND schedules a precise re-render at midnight
 * so the drop rolls over the instant the deadline passes.
 */
export const LimitedEditionSeasonalBanner = ({ onView }: Props) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Regular tick every minute keeps the "remaining" counter fresh.
    const minute = window.setInterval(() => setNow(new Date()), 60_000);

    // Extra precise timer to fire immediately after the current season ends.
    const { season } = { season: getCurrentSeason(new Date()) };
    const msToRollover = Math.max(1000, season.end.getTime() - Date.now() + 500);
    const rollover = window.setTimeout(() => setNow(new Date()), msToRollover);

    return () => {
      window.clearInterval(minute);
      window.clearTimeout(rollover);
    };
  }, [now]);

  const { season, totalSupply, remaining, endsAt } = computeDrop(now);

  return (
    <div className="mb-6">
      <LimitedEditionBanner
        title={`${season.name} ${season.year} Mythic Drop`}
        subtitle="Hand-crafted animated avatars & legendary frames. Once they're gone, they're gone."
        emoji={season.emoji}
        totalSupply={totalSupply}
        remaining={remaining}
        endsAt={endsAt}
        onView={onView}
      />
    </div>
  );
};
