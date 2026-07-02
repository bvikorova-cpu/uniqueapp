import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { shadowArenaCall } from "@/hooks/useShadowArenaRouter";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface CatalogItem {
  id: string; code: string; name: string; emoji: string;
  tier: string; credit_cost: number; animation: string;
}

const TIER_COLOR: Record<string, string> = {
  common: "border-zinc-700/60",
  rare: "border-blue-500/60",
  epic: "border-purple-500/60",
  legendary: "border-amber-500/60",
};

export function VirtualGiftsCard({ recipientId, contextType, contextId }: { recipientId?: string; contextType?: string; contextId?: string }) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [sending, setSending] = useState<string | null>(null);
  const [flying, setFlying] = useState<{ emoji: string; key: number } | null>(null);

  useEffect(() => {
    supabase.from("shadow_gift_catalog").select("*").eq("is_active", true)
      .order("credit_cost", { ascending: true })
      .then(({ data }) => setItems((data as CatalogItem[]) || []));
  }, []);

  const send = async (g: CatalogItem) => {
    if (!recipientId) { toast.error("Open a creator's stream to send gifts."); return; }
    setSending(g.code);
    try {
      await shadowArenaCall("gift_send", {
        gift_code: g.code, recipient_id: recipientId,
        context_type: contextType, context_id: contextId,
      });
      setFlying({ emoji: g.emoji, key: Date.now() });
      toast.success(`${g.emoji} ${g.name} sent!`);
      setTimeout(() => setFlying(null), 1500);
    } catch (e: any) {
      toast.error(e.message === "insufficient_credits" ? "Not enough Shadow credits." : e.message);
    } finally { setSending(null); }
  };

  return (
    <><FloatingHowItWorks title="VirtualGiftsCard — How it works" steps={[{title:"Open this section",desc:"Access VirtualGiftsCard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<Card className="p-5 mb-6 border-purple-900/40 bg-gradient-to-br from-zinc-950 to-purple-950/30 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <Gift className="h-5 w-5 text-pink-400" />
        <h3 className="font-bold text-foreground">Virtual Gifts</h3>
        <Sparkles className="h-4 w-4 text-amber-400 ml-auto" />
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {items.map((g) => (
          <button
            key={g.id}
            onClick={() => send(g)}
            disabled={sending === g.code}
            className={`rounded-lg border ${TIER_COLOR[g.tier]} p-2 bg-black/40 hover:bg-purple-900/30 transition active:scale-95 disabled:opacity-50`}
          >
            <div className="text-2xl">{g.emoji}</div>
            <div className="text-[10px] text-muted-foreground truncate">{g.name}</div>
            <div className="text-[11px] font-bold text-amber-300">{g.credit_cost}c</div>
          </button>
        ))}
      </div>
      {flying && (
        <div key={flying.key} className="pointer-events-none absolute inset-0 flex items-center justify-center text-7xl animate-[ping_1.5s_ease-out]">
          {flying.emoji}
        </div>
      )}
    </Card>
  </>
  );
}
