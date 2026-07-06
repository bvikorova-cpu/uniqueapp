import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RecentDonation {
  donor_name: string;
  amount: number;
  campaign_type: string;
  created_at: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  medical: "💊", dream: "✨", hero: "🦸", crisis: "🆘",
  pet: "🐾", student: "🎓", talent: "🎭",
};

function formatMsg(d: RecentDonation): string {
  const emoji = CATEGORY_EMOJI[d.campaign_type] || "❤️";
  return `${d.donor_name} donated €${Number(d.amount).toFixed(0)} to a ${d.campaign_type} campaign ${emoji}`;
}

const FALLBACK = [
  "Be the first to donate — every gift shows up here in real time ❤️",
  "Start a campaign and watch it grow ✨",
  "Live donation feed powered by real transactions 🔴",
];

export function LiveImpactTicker() {
  const [messages, setMessages] = useState<string[]>(FALLBACK);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.rpc("get_recent_donations" as any, { _limit: 20 });
      if (cancelled) return;
      const items = (data as RecentDonation[]) || [];
      if (items.length > 0) setMessages(items.map(formatMsg));
    })();

    // Realtime updates as new donations come in
    const channel = supabase
      .channel("live-impact-ticker")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "campaign_donations" },
        (payload) => {
          const row = payload.new as any;
          if (!row || !["succeeded", "completed", "paid"].includes(row.status)) return;
          const msg = formatMsg({
            donor_name: row.is_anonymous ? "Anonymous" : (row.donor_name || "Someone"),
            amount: row.amount,
            campaign_type: row.campaign_type || "campaign",
            created_at: row.created_at,
          });
          setMessages((prev) => [msg, ...prev].slice(0, 30));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [messages.length]);

  const current = messages[currentIndex % messages.length];

  return (
    <div className="relative overflow-hidden bg-primary/5 border-y border-border/30 py-3 px-4">
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <div className="flex items-center gap-1.5 shrink-0">
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-green-500"
          />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Live</span>
        </div>

        <div className="flex-1 overflow-hidden h-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-sm text-foreground/80 flex items-center gap-1.5 truncate"
            >
              <Heart className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">{current}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
