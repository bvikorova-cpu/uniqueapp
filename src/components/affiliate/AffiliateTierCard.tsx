import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, Crown, Gem, Medal, Sparkles, TrendingUp } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const TIER_META: Record<string, { icon: typeof Award; color: string; gradient: string }> = {
  bronze: { icon: Medal, color: "text-amber-700", gradient: "from-amber-700/20 to-amber-900/10" },
  silver: { icon: Award, color: "text-slate-300", gradient: "from-slate-300/20 to-slate-500/10" },
  gold: { icon: Crown, color: "text-yellow-400", gradient: "from-yellow-400/20 to-yellow-600/10" },
  diamond: { icon: Gem, color: "text-cyan-300", gradient: "from-cyan-300/25 to-purple-500/15" },
};

type TierConfig = {
  tier: "bronze" | "silver" | "gold" | "diamond";
  min_referrals: number;
  reward_eur: number;
  label: string;
  perks: string[];
};

type TierStatus = {
  tier: "bronze" | "silver" | "gold" | "diamond";
  approved_referrals: number;
  lifetime_earnings_eur: number;
};

export const AffiliateTierCard = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<TierStatus | null>(null);
  const [config, setConfig] = useState<TierConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: cfg }, { data: st }] = await Promise.all([
        supabase.from("affiliate_tier_config").select("*").order("min_referrals"),
        supabase.from("affiliate_tier_status").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      setConfig((cfg ?? []) as any);
      setStatus(
        (st as any) ?? {
          tier: "bronze",
          approved_referrals: 0,
          lifetime_earnings_eur: 0,
        },
      );
      setLoading(false);
    })();
  }, [user]);

  if (!user || loading || !status || !config.length) return null;

  const currentIdx = config.findIndex((c) => c.tier === status.tier);
  const current = config[currentIdx];
  const next = config[currentIdx + 1];
  const meta = TIER_META[status.tier];
  const Icon = meta.icon;

  const progress = next
    ? Math.min(100, (status.approved_referrals / next.min_referrals) * 100)
    : 100;
  const remaining = next ? Math.max(0, next.min_referrals - status.approved_referrals) : 0;

  return (
    <>
      <FloatingHowItWorks title={"Affiliate Tier Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Affiliate Tier Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Affiliate Tier Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className={`p-5 bg-gradient-to-br ${meta.gradient} border-border/50 backdrop-blur-xl`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-background/40 ${meta.color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Affiliate tier
            </div>
            <div className="text-xl font-bold flex items-center gap-2">
              {current.label}
              <Badge variant="secondary" className="font-mono">
                €{Number(current.reward_eur).toFixed(2)} / referral
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="p-3 rounded-lg bg-background/30">
          <div className="text-muted-foreground text-xs">Approved referrals</div>
          <div className="text-lg font-bold flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" />
            {status.approved_referrals}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-background/30">
          <div className="text-muted-foreground text-xs">Lifetime earned</div>
          <div className="text-lg font-bold">
            €{Number(status.lifetime_earnings_eur).toFixed(2)}
          </div>
        </div>
      </div>

      {next ? (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">
              {remaining} more to reach {next.label}
            </span>
            <span className="font-mono text-primary">
              €{Number(next.reward_eur).toFixed(2)} / referral
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      ) : (
        <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/30 text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-semibold">Top tier unlocked — maximum rewards!</span>
        </div>
      )}

      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Your perks
        </div>
        <ul className="space-y-1 text-sm">
          {(current.perks ?? []).map((p, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${meta.color.replace("text", "bg")}`} />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </Card>
    </>
  );
};
