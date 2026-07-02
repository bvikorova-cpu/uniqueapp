import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Donation {
  id: string;
  amount: number;
  donor_name: string | null;
  is_anonymous: boolean;
  campaign_type: string;
  created_at: string;
  message?: string | null;
}

const categoryEmoji: Record<string, string> = {
  medical: "💊", crisis: "🆘", pet: "🐾", student: "🎓",
  dream: "✨", hero: "🦸", talent: "🎭",
};

export function LiveDonationFeed() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("campaign_donations" as any)
        .select("id, amount, donor_name, is_anonymous, campaign_type, created_at, message")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(8);
      if (mounted && data) setDonations(data as unknown as Donation[]);
      setLoading(false);
    })();

    // Realtime subscribe
    const channel = supabase
      .channel("live-donations")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "campaign_donations", filter: "status=eq.completed" }, (payload) => {
        if (mounted) setDonations((prev) => [payload.new as Donation, ...prev].slice(0, 8));
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-emerald-500"
          />
          <h2 className="text-xl font-bold text-foreground">Live Donations</h2>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </div>

        <Card className="p-4 bg-gradient-to-br from-amber-500/5 via-rose-500/5 to-purple-500/5 border-amber-500/20">
          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-6">Loading…</p>
          ) : donations.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-10 h-10 text-amber-500/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Be the first to donate today</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {donations.map((d) => (
                  <motion.div
                    key={d.id}
                    layout
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/40 hover:border-amber-500/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 flex items-center justify-center text-lg shrink-0">
                      {categoryEmoji[d.campaign_type] || "❤️"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {d.is_anonymous || !d.donor_name ? "An anonymous hero" : d.donor_name}{" "}
                        <span className="text-muted-foreground font-normal">just donated to</span>{" "}
                        <span className="text-foreground font-semibold capitalize">{d.campaign_type}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-base bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent">
                        €{Number(d.amount).toFixed(0)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
