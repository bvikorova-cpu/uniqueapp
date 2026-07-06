import { motion } from "framer-motion";
import { Crown, Heart, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const TIERS = [
  { name: "Diamond", min: 500, color: "from-cyan-400 to-blue-500", emoji: "💎" },
  { name: "Gold",    min: 200, color: "from-yellow-400 to-amber-500", emoji: "🥇" },
  { name: "Silver",  min: 100, color: "from-gray-300 to-gray-400", emoji: "🥈" },
  { name: "Bronze",  min: 0,   color: "from-orange-400 to-amber-600", emoji: "🥉" },
];

function tierOf(amount: number) {
  return TIERS.find((t) => amount >= t.min) || TIERS[TIERS.length - 1];
}

interface Donor {
  donor_name: string;
  total_amount: number;
  donation_count: number;
}

export function DonorLeaderboard() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.rpc("get_top_donors" as any, { _limit: 10 });
      if (!cancelled) {
        setDonors((data as Donor[]) || []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <FloatingHowItWorks title={"Donor Leaderboard - How it works"} steps={[{ title: 'Top 10 donors', desc: 'Rolling 30-day window, anonymous donations excluded.' }, { title: 'Tiers by total', desc: 'Diamond €500+, Gold €200+, Silver €100+, Bronze anything.' }, { title: 'Auto-updates', desc: 'Recalculates as new donations are recorded.' }, { title: 'Climb the list', desc: 'Every non-anonymous donation counts toward your rank.' }]} />
      <section className="py-12 px-4">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Top Donors — Last 30 Days</h2>
          </div>

          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted/30 rounded-xl animate-pulse" />)}</div>
          ) : donors.length === 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                No donations yet in the last 30 days. Be the first — every donation gets recognized here.
              </p>
              <div className="space-y-3">
                {TIERS.map((tier, i) => (
                  <div key={tier.name} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-sm`}>
                      <span className="text-lg">{tier.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-foreground">{tier.name} Donor</div>
                      <div className="text-xs text-muted-foreground">
                        {tier.min > 0 ? `€${tier.min}+ total donations` : "Any contribution"}
                      </div>
                    </div>
                    <Heart className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              {donors.map((d, i) => {
                const tier = tierOf(Number(d.total_amount));
                return (
                  <motion.div
                    key={`${d.donor_name}-${i}`}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30"
                  >
                    <div className="w-7 text-center font-black text-muted-foreground">{i + 1}</div>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-sm`}>
                      <span className="text-lg">{tier.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{d.donor_name}</div>
                      <div className="text-xs text-muted-foreground">{d.donation_count} donation{d.donation_count === 1 ? "" : "s"} · {tier.name}</div>
                    </div>
                    <div className="text-sm font-black text-primary">€{Number(d.total_amount).toFixed(0)}</div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
            <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Non-anonymous donations count toward the leaderboard.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
    </>
  );
}
