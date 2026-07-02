import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  onSelectPackage: (creditsAmount: number) => void;
}

/**
 * Smart recommendation based on the last 30 days of AI usage.
 * Suggests the right pack so the user does not overpay.
 */
export const AICreditsRecommendation = ({ onSelectPackage }: Props) => {
  const [used30d, setUsed30d] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("ai_usage_history")
        .select("credits_used")
        .eq("user_id", user.id)
        .gte("created_at", since);
      if (cancelled) return;
      const total = (data ?? []).reduce((sum, r: any) => sum + (r.credits_used ?? 0), 0);
      setUsed30d(total);
    })();
    return () => { cancelled = true; };
  }, []);

  if (used30d === null || used30d === 0) return null;

  // Recommend: pack ≥ user's monthly spend
  const recommended =
    used30d <= 10 ? { name: "Starter", credits: 10, price: 5 } :
    used30d <= 25 ? { name: "Basic", credits: 25, price: 10 } :
    used30d <= 60 ? { name: "Pro", credits: 60, price: 20 } :
                    { name: "Ultimate", credits: 150, price: 40 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-purple-500/5 to-cyan-500/10 p-5 mb-6"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
          <Lightbulb className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] uppercase font-black tracking-wider text-primary">Smart pick for you</span>
          </div>
          <p className="text-base font-bold text-foreground">
            You used <span className="text-primary">{used30d} credits</span> in the last 30 days.
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Get <span className="font-bold text-foreground">{recommended.name}</span> — {recommended.credits} credits for €{recommended.price}.
            That's about a month at your current pace.
          </p>
          <Button
            size="sm"
            className="mt-3 bg-gradient-to-r from-primary to-purple-500 text-white font-bold shadow"
            onClick={() => onSelectPackage(recommended.credits)}
          >
            Get {recommended.name}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
