import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Rocket, Star, Loader2, ShoppingBag } from "lucide-react";
import { useBrandVotes } from "@/hooks/useBrandVotes";
import { spendBrandCredits } from "@/lib/brandCredits";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const PACKS = [
  { id: "double_vote_24h", name: "2× Vote Multiplier", desc: "All votes count double for 24h", cost: 10, icon: Zap, color: "from-cyan-400 to-blue-600" },
  { id: "mega_boost_5x", name: "Mega Boost (5×)", desc: "Single vote counts as 5", cost: 25, icon: Rocket, color: "from-violet-400 to-fuchsia-600" },
  { id: "vip_frame", name: "VIP Profile Frame", desc: "Golden glow on your username (30 days)", cost: 50, icon: Star, color: "from-amber-300 to-yellow-600" },
  { id: "blitz_pack", name: "Blitz Pack", desc: "5 votes + 2× streak protection", cost: 15, icon: ShoppingBag, color: "from-emerald-400 to-green-600" },
];

export const BoosterPacks = () => {
  const { data: votes, refetch } = useBrandVotes();
  const [buying, setBuying] = useState<string | null>(null);

  const buy = async (pack: typeof PACKS[0]) => {
    if ((votes?.remaining ?? 0) < pack.cost) { toast.error(`Need ${pack.cost} credits`); return; }
    setBuying(pack.id);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Sign in"); return; }
      await spendBrandCredits(pack.cost);
      const expires = pack.id.includes("24h") ? new Date(Date.now() + 86400_000).toISOString() :
                       pack.id === "vip_frame" ? new Date(Date.now() + 30 * 86400_000).toISOString() : null;
      const { error } = await supabase.from("user_brand_boosters").insert({
        user_id: user.id, booster_type: pack.id, quantity: 1, expires_at: expires, is_equipped: true,
      });
      if (error) throw error;
      refetch();
      toast.success(`${pack.name} activated!`);
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBuying(null);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Booster Packs - How it works"} steps={[{ title: 'Open', desc: 'Access the Booster Packs section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Booster Packs.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-zinc-950 to-zinc-900">
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-amber-100">
          <Rocket className="h-5 w-5 text-amber-400" />
          Booster Packs & Cosmetics
        </CardTitle>
      </CardHeader>
      <CardContent className="relative grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PACKS.map(p => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.02 }}
              className="rounded-xl border border-amber-500/15 bg-zinc-950/60 p-3 flex items-center gap-3"
            >
              <div className={`p-2.5 rounded-lg bg-gradient-to-br ${p.color}`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-amber-100">{p.name}</p>
                <p className="text-[10px] text-amber-100/50 leading-snug">{p.desc}</p>
              </div>
              <Button
                size="sm"
                disabled={buying === p.id}
                onClick={() => buy(p)}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 hover:from-amber-600 border-0 text-xs shrink-0"
              >
                {buying === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : `${p.cost}c`}
              </Button>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
    </>
  );
};
