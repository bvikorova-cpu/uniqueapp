import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Euro, TrendingUp, Users } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

/** Flat, non-tiered referral reward — always €5 per paid Megatalent entry. */
export const REFERRAL_REWARD_EUR = 5;

export const AffiliateTierCard = () => {
  const { user } = useAuth();
  const [approved, setApproved] = useState(0);
  const [earned, setEarned] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("megatalent_referral_earnings")
        .select("amount")
        .eq("referrer_id", user.id)
        .eq("auto_credited", true);
      if (!active) return;
      const rows = (data ?? []) as { amount: number | string }[];
      setApproved(rows.length);
      setEarned(rows.reduce((s, r) => s + Number(r.amount || 0), 0));
      setLoading(false);
    })();
    return () => { active = false; };
  }, [user]);

  if (!user || loading) return null;

  return (
    <>
      <FloatingHowItWorks
        title="Referral rewards - How it works"
        steps={[
          { title: "Share your code", desc: "Send your referral link to friends." },
          { title: "They join Megatalent", desc: "Your friend pays the Megatalent entry / subscription." },
          { title: "You earn €5", desc: "A flat €5 is credited for every paid referral — no tiers, no free bonuses." },
          { title: "Withdraw", desc: "Request a payout once your real balance is available." },
        ]}
      />
      <Card className="p-5 bg-gradient-to-br from-yellow-500/10 to-amber-600/5 border-border/50 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-background/40 text-yellow-500">
            <Euro className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Referral reward
            </div>
            <div className="text-xl font-bold flex items-center gap-2">
              Flat rate
              <Badge variant="secondary" className="font-mono">
                €{REFERRAL_REWARD_EUR.toFixed(2)} / referral
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-background/30">
            <div className="text-muted-foreground text-xs">Approved referrals</div>
            <div className="text-lg font-bold flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              {approved}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-background/30">
            <div className="text-muted-foreground text-xs">Lifetime earned</div>
            <div className="text-lg font-bold flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-primary" />
              €{earned.toFixed(2)}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground mt-3">
          Every paid Megatalent referral pays exactly €5. There are no tier upgrades and no free
          sign-up bonuses — you only earn what your referrals actually pay for.
        </p>
      </Card>
    </>
  );
};
