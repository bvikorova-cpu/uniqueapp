import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Coffee, Heart, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface TipStats {
  total_count: number;
  total_amount_cents: number;
  total_recipient_cents: number;
}

/** Tip earnings card — shows received tips and their contribution to withdrawable balance. */
export function TipEarningsCard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TipStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase.rpc("get_profile_tip_stats", { _recipient: user.id });
      const s = Array.isArray(data) ? data[0] : data;
      setStats(
        s ?? { total_count: 0, total_amount_cents: 0, total_recipient_cents: 0 },
      );
      setLoading(false);
    })();
  }, [user?.id]);

  const gross = (stats?.total_amount_cents ?? 0) / 100;
  const net = (stats?.total_recipient_cents ?? 0) / 100;
  const fee = +(gross - net).toFixed(2);

  return (
    <>
      <FloatingHowItWorks
        title={"Tip Earnings - How it works"}
        steps={[
          { title: "Receive tips", desc: "Other users can send you tips directly from your profile." },
          { title: "Net amount", desc: "Tips already have the platform fee deducted; the rest is yours." },
          { title: "Withdraw", desc: "Tip earnings are added to your available balance and paid out via Stripe Connect." },
        ]}
      />
      <Card className="relative overflow-hidden border-violet-400/30 bg-gradient-to-br from-violet-500/10 via-card to-fuchsia-500/5">
        <div className="absolute top-0 right-0 w-28 h-28 bg-violet-500/20 rounded-full blur-2xl" />
        <CardHeader className="pb-2 relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Coffee className="h-4 w-4 text-violet-400" /> Tip earnings
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              {loading ? "…" : stats?.total_count ?? 0} tips
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {loading ? (
            <div className="text-xs text-muted-foreground py-4">Loading…</div>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
              >
                €{net.toFixed(2)}
              </motion.div>
              <p className="text-[11px] text-muted-foreground mt-1">
                €{gross.toFixed(2)} received · €{fee} platform fee
              </p>
              <div className="flex items-center gap-1 mt-3 text-[11px] text-violet-300">
                <ArrowUpRight className="h-3 w-3" />
                <span>Included in available balance</span>
                <Heart className="h-3 w-3 ml-1" />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
