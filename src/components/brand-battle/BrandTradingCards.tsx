import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Diamond } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useBrandVotes } from "@/hooks/useBrandVotes";
import { spendBrandCredits } from "@/lib/brandCredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Card { id: string; brand_id: string; rarity: string; power: number; base_price: number; minted_count: number; edition_size: number; brand?: { name: string; logo: string }; }

const RARITY = {
  common: { color: "from-zinc-500 to-zinc-700", border: "border-zinc-500/40", text: "text-zinc-300" },
  rare: { color: "from-blue-400 to-blue-600", border: "border-blue-500/40", text: "text-blue-300" },
  epic: { color: "from-violet-400 to-purple-600", border: "border-violet-500/40", text: "text-violet-300" },
  legendary: { color: "from-amber-300 to-yellow-600", border: "border-amber-400/60", text: "text-amber-300" },
};

export const BrandTradingCards = () => {
  const { data: votes, refetch } = useBrandVotes();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("brand_cards")
      .select("*, brand:brand_sponsors(name, logo)")
      .order("power", { ascending: false })
      .limit(20);
    if (data) setCards(data as any);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const mint = async (card: Card) => {
    if ((votes?.remaining ?? 0) < card.base_price) { toast.error(`Need ${card.base_price} credits`); return; }
    if (card.minted_count >= card.edition_size) { toast.error("Sold out!"); return; }

    setMinting(card.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Sign in first"); return; }

      await spendBrandCredits(card.base_price);

      const serial = card.minted_count + 1;
      const { error } = await supabase.from("user_brand_cards").insert({
        user_id: user.id, card_id: card.id, serial_number: serial,
      });
      if (error) throw error;
      await supabase.from("brand_cards").update({ minted_count: serial }).eq("id", card.id);

      refetch();
      toast.success(`Minted ${card.brand?.name} #${serial}!`);
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Mint failed");
    } finally {
      setMinting(null);
    }
  };

  if (loading) return <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-amber-400" /></div>;

  return (
    <>
      <FloatingHowItWorks title={"Brand Trading Cards - How it works"} steps={[{ title: 'Open', desc: 'Access the Brand Trading Cards section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Brand Trading Cards.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-zinc-950 to-zinc-900">
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-amber-100">
          <Diamond className="h-5 w-5 text-amber-400" />
          Brand Trading Cards
          <Badge className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0">COLLECT</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {cards.map(c => {
            const r = RARITY[c.rarity as keyof typeof RARITY] ?? RARITY.common;
            const soldOut = c.minted_count >= c.edition_size;
            return (
              <motion.div
                key={c.id}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`group relative rounded-xl overflow-hidden border-2 ${r.border} bg-gradient-to-br ${r.color} p-[1px]`}
              >
                <div className="rounded-[10px] bg-zinc-950 p-3 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`bg-gradient-to-r ${r.color} text-white border-0 text-[9px] uppercase font-black`}>
                      {c.rarity}
                    </Badge>
                    <span className="text-[10px] font-mono text-amber-100/40">{c.minted_count}/{c.edition_size}</span>
                  </div>
                  <div className={`text-3xl text-center my-3 bg-gradient-to-br ${r.color} bg-clip-text text-transparent`}>
                    {c.brand?.logo?.startsWith("http") ? "🏢" : c.brand?.logo}
                  </div>
                  <p className="text-xs font-bold text-amber-100 text-center truncate">{c.brand?.name}</p>
                  <p className={`text-[10px] text-center mt-1 ${r.text}`}>PWR {c.power}</p>
                  <Button
                    size="sm"
                    disabled={soldOut || minting === c.id}
                    onClick={() => mint(c)}
                    className={`mt-2 h-7 text-xs bg-gradient-to-r ${r.color} text-white border-0 hover:opacity-90`}
                  >
                    {minting === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : soldOut ? "Sold out" : `${c.base_price}c`}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
    </>
  );
};
