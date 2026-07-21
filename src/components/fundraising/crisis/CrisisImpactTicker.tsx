import { motion } from "framer-motion";
import { Heart, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TickerDonation {
  donor: string;
  amount: number;
  crisis: string;
}

export function CrisisImpactTicker() {
  const [current, setCurrent] = useState(0);

  const { data: donations = [] } = useQuery({
    queryKey: ["crisis-impact-ticker"],
    queryFn: async (): Promise<TickerDonation[]> => {
      const { data, error } = await supabase
        .from("campaign_donations")
        .select("amount, donor_name, is_anonymous, crisis_campaigns!inner(title, location)")
        .eq("campaign_type", "crisis")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) return [];
      return (data ?? []).map((r: any) => ({
        donor: r.is_anonymous ? "Anonymous" : (r.donor_name || "A supporter"),
        amount: Math.round(Number(r.amount) || 0),
        crisis: r.crisis_campaigns?.title
          ? `${r.crisis_campaigns.title}${r.crisis_campaigns.location ? " — " + r.crisis_campaigns.location : ""}`
          : "Crisis relief",
      }));
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (donations.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % donations.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [donations.length]);

  if (donations.length === 0) return null;
  const donation = donations[current % donations.length];

  return (
    <section className="py-4">
      <motion.div
        className="max-w-2xl mx-auto rounded-2xl border border-destructive/20 bg-destructive/5 backdrop-blur-sm px-6 py-3 flex items-center justify-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Zap className="w-4 h-4 text-destructive" />
        </motion.div>
        <motion.p
          key={current}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm text-foreground"
        >
          <span className="font-semibold">{donation.donor}</span> donated{" "}
          <span className="font-bold text-destructive">€{donation.amount}</span> to{" "}
          <span className="font-medium">{donation.crisis}</span>
        </motion.p>
        <Heart className="w-3 h-3 text-destructive fill-destructive" />
      </motion.div>
    </section>
  );
}
