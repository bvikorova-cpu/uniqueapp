import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plane } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface DepartureCountdownProps {
  /** ISO date string */
  departureDate: string;
  destination?: string;
}

function diff(target: number) {
  const ms = target - Date.now();
  if (ms <= 0) return null;
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return { d, h, m, s };
}

export function DepartureCountdown({ departureDate, destination }: DepartureCountdownProps) {
  const target = new Date(departureDate).getTime();
  const [remaining, setRemaining] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setRemaining(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!remaining) {
    return (
      <Card className="bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border-emerald-400/30">
        <CardContent className="p-4 flex items-center gap-3">
          <Plane className="w-5 h-5 text-emerald-400" />
          <p className="text-sm">Bon voyage{destination ? ` to ${destination}` : ""}!</p>
        </CardContent>
      </Card>
    );
  }

  const cell = (n: number, l: string) => (
    <div className="flex flex-col items-center px-2">
      <span className="text-2xl font-bold tabular-nums">{String(n).padStart(2, "0")}</span>
      <span className="text-[10px] uppercase opacity-70">{l}</span>
    </div>
  );

  return (
    <Card className="bg-gradient-to-br from-sky-500/20 to-purple-500/20 border-sky-400/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Plane className="w-4 h-4" />
          <p className="text-xs uppercase tracking-wider opacity-80">
            Remaining before departure{destination ? ` — ${destination}` : ""}
          </p>
        </div>
        <div className="flex items-center justify-center gap-1">
          {cell(remaining.d, "days")}
          <span className="opacity-50">:</span>
          {cell(remaining.h, "hrs")}
          <span className="opacity-50">:</span>
          {cell(remaining.m, "min")}
          <span className="opacity-50">:</span>
          {cell(remaining.s, "sec")}
        </div>
      </CardContent>
    </Card>
  );
}
