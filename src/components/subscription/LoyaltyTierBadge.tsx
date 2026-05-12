import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const tiers = [
  { name: "Bronze", months: 0, color: "bg-amber-700/20 text-amber-500" },
  { name: "Silver", months: 6, color: "bg-slate-400/20 text-slate-300" },
  { name: "Gold", months: 12, color: "bg-yellow-500/20 text-yellow-400" },
  { name: "Platinum", months: 24, color: "bg-purple-500/20 text-purple-300" },
];

export const LoyaltyTierBadge = () => {
  const [months, setMonths] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: oldest } = await supabase.from("subscriptions").select("created_at").eq("user_id", user.id).order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (oldest?.created_at) {
        const m = Math.floor((Date.now() - new Date(oldest.created_at).getTime()) / (30 * 86400000));
        setMonths(m);
      }
    })();
  }, []);

  const tier = [...tiers].reverse().find(t => months >= t.months) ?? tiers[0];
  return (
    <Badge className={`${tier.color} gap-1`}>
      <Award className="h-3 w-3" /> {tier.name} member · {months} mo
    </Badge>
  );
};
