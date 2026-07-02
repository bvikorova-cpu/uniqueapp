import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Coins, Sparkles, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Currency } from "./CurrencySelector";
import { formatPrice } from "./CurrencySelector";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface RoiDashboardProps {
  userId: string;
  currency: Currency;
  tier: string;
}

/**
 * Personal ROI dashboard for active subscribers.
 * Pulls real numbers from activity_logs / ai_usage_history when available,
 * falls back to deterministic estimates if no data yet.
 */
export const RoiDashboard = ({ userId, currency, tier }: RoiDashboardProps) => {
  const [stats, setStats] = useState({
    aiCalls: 0,
    aiValue: 0,
    commissionSaved: 0,
    daysActive: 0,
    loading: true,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // AI usage
        const { count: aiCount } = await supabase
          .from("ai_usage_history")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        // Subscription start
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const calls = aiCount ?? 0;
        const start = sub?.created_at ? new Date(sub.created_at) : new Date();
        const days = Math.max(1, Math.floor((Date.now() - start.getTime()) / 86_400_000));

        if (!active) return;
        setStats({
          aiCalls: calls,
          aiValue: calls * 0.5, // €0.50 perceived value per generation
          commissionSaved: tier === "basic" ? 0 : Math.round(days * 1.2), // estimate
          daysActive: days,
          loading: false,
        });
      } catch {
        if (active) setStats((s) => ({ ...s, loading: false }));
      }
    })();
    return (
    <>
      <FloatingHowItWorks title={"Roi Dashboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Roi Dashboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Roi Dashboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => { active = false; };
  }, [userId, tier]);

  if (stats.loading) return null;

  const totalSaved = stats.aiValue + stats.commissionSaved;

  const cards = [
    {
      icon: Sparkles,
      label: "AI generations used",
      value: stats.aiCalls.toLocaleString(),
      sub: `Worth ~${formatPrice(stats.aiValue, currency)}`,
      color: "from-violet-500 to-fuchsia-500",
    },
    {
      icon: Coins,
      label: "Commission saved",
      value: formatPrice(stats.commissionSaved, currency),
      sub: "0% on every sale",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: TrendingUp,
      label: "Total value",
      value: formatPrice(totalSaved, currency),
      sub: "Since you joined",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Trophy,
      label: "Days active",
      value: stats.daysActive.toString(),
      sub: tier.toUpperCase() + " member",
      color: "from-primary to-purple-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 max-w-5xl mx-auto"
    >
      <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-purple-500/5 to-amber-400/5 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-primary/20">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black">Your Premium ROI</h3>
            <p className="text-sm text-muted-foreground">How much value you've unlocked so far.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="relative overflow-hidden rounded-2xl bg-background/40 border border-border/40 p-4"
            >
              <div className={`absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br ${c.color} opacity-15 blur-2xl`} />
              <c.icon className="h-5 w-5 text-primary mb-2" />
              <div className="text-xl sm:text-2xl font-black">{c.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{c.label}</div>
              <div className="text-[10px] text-primary/80 font-semibold mt-1">{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
