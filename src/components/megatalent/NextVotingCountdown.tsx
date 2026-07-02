import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Clock, Flame, PlayCircle } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

/**
 * Countdown to the next MegaTalent voting round / €10,000 prize draw.
 * Round ends at the last day of the current calendar month at 23:59:59
 * in the configured timezone (default: Europe/Berlin), independent of
 * the visitor's local time.
 */
const DRAW_TIMEZONE = "Europe/Berlin";

/** Get the current Y/M/D/H/M/S in a given IANA timezone. */
function getZonedParts(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).filter((p) => p.type !== "literal").map((p) => [p.type, Number(p.value)])
  ) as Record<string, number>;
  return parts;
}

/** Build a UTC timestamp for a given wall-clock moment in `timeZone`. */
function zonedTimeToUtc(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string
) {
  // Initial guess assuming wall time is UTC, then correct using the offset
  // implied by Intl for that instant in the target timezone.
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  const p = getZonedParts(new Date(guess), timeZone);
  const asIfUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const offset = asIfUtc - guess; // ms the zone is ahead of UTC at that instant
  return guess - offset;
}

function getTimeLeft() {
  const now = new Date();
  const z = getZonedParts(now, DRAW_TIMEZONE);
  // Last day of current month in target timezone = day 0 of next month
  const lastDay = new Date(Date.UTC(z.year, z.month, 0)).getUTCDate();
  const endUtcMs = zonedTimeToUtc(z.year, z.month, lastDay, 23, 59, 59, DRAW_TIMEZONE);
  const end = new Date(endUtcMs);
  // Voting for the current round opened on the 1st day of this month at 00:00 in DRAW_TIMEZONE
  const startUtcMs = zonedTimeToUtc(z.year, z.month, 1, 0, 0, 0, DRAW_TIMEZONE);
  const start = new Date(startUtcMs);
  const diff = Math.max(0, endUtcMs - now.getTime());
  return {
    end,
    start,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

export default function NextVotingCountdown() {
  const [t, setT] = useState(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const Box = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center min-w-[56px]">
      <div className="px-2 py-1.5 rounded-lg bg-black/40 border border-yellow-500/30 text-xl sm:text-2xl font-black tabular-nums text-yellow-300">
        {value.toString().padStart(2, "0")}
      </div>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</span>
    </div>
  );

  const drawDateTime = t.end.toLocaleString(undefined, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: DRAW_TIMEZONE,
    timeZoneName: "short",
  });

  const startDateTime = t.start.toLocaleString(undefined, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: DRAW_TIMEZONE,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 rounded-2xl bg-gradient-to-r from-yellow-500/15 via-amber-500/10 to-orange-500/15 border border-yellow-500/30"
    >
      <div className="flex items-center gap-3 text-center sm:text-left">
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Trophy className="h-6 w-6 text-yellow-400" />
        </motion.div>
        <div>
          <div className="text-sm sm:text-base font-black flex items-center gap-1.5 justify-center sm:justify-start">
            <Flame className="h-4 w-4 text-orange-400" />
            Next voting round & €10,000 prize draw
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center sm:justify-start mt-0.5">
            <PlayCircle className="h-3 w-3 text-green-400" />
            <span>
              Voting open since <span className="text-green-300 font-semibold">{startDateTime}</span>
            </span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center sm:justify-start mt-0.5">
            <Clock className="h-3 w-3" />
            <span>
              Draw: <span className="text-yellow-300 font-semibold">{drawDateTime}</span>
              <span className="opacity-70"> · {DRAW_TIMEZONE}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Box value={t.days} label="Days" />
        <span className="text-xl font-black opacity-50">:</span>
        <Box value={t.hours} label="Hrs" />
        <span className="text-xl font-black opacity-50">:</span>
        <Box value={t.minutes} label="Min" />
        <span className="text-xl font-black opacity-50">:</span>
        <Box value={t.seconds} label="Sec" />
      </div>
    </motion.div>
  );
}
