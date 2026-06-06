import { useEffect, useState } from "react";
import { Clock, Infinity as InfinityIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const fmt = (ms: number) => {
  if (ms <= 0) return "Expired";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h >= 1) return `${h}h ${m}m`;
  return `${m}m`;
};

export const MatchExpiryBadge = ({ expiresAt }: { expiresAt: string | null }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, [expiresAt]);

  if (!expiresAt) {
    return <Badge variant="secondary" className="text-[10px] gap-1"><InfinityIcon className="h-3 w-3" /> Active</Badge>;
  }
  const remaining = new Date(expiresAt).getTime() - now;
  const urgent = remaining < 6 * 3600000;
  return (
    <Badge variant={urgent ? "destructive" : "outline"} className="text-[10px] gap-1">
      <Clock className="h-3 w-3" /> {fmt(remaining)}
    </Badge>
  );
};
