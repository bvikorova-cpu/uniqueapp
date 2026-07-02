import { useEffect, useState } from "react";
import { Clock, Infinity as InfinityIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

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
      <FloatingHowItWorks
        title={"Match Expiry Badge"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <Clock className="h-3 w-3" /> {fmt(remaining)}
    </Badge>
  );
};
