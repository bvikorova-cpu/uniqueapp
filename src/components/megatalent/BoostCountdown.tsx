import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";

interface Props {
  expiresAt: string;
  onExpired?: () => void;
}

function format(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function BoostCountdown({ expiresAt, onExpired }: Props) {
  const [left, setLeft] = useState(() => new Date(expiresAt).getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const ms = new Date(expiresAt).getTime() - Date.now();
      setLeft(ms);
      if (ms <= 0) {
        clearInterval(id);
        onExpired?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (left <= 0) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-500 tabular-nums">
      <Rocket className="h-3 w-3" />
      Boost ends in {format(left)}
    </span>
  );
}
