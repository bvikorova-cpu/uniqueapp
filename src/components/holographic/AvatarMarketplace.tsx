import { useState } from "react";
import { ArrowLeft, ShoppingBag, Tag, Star, Filter, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const CATEGORIES = ["All", "Skins", "Accessories", "Animations", "Voices", "Backgrounds"];

const MARKETPLACE_ITEMS = [
  { id: 1, name: "Neon Cyberpunk Armor", category: "Skins", price: 4.99, rarity: "Legendary", seller: "NeonWraith", rating: 4.9, sales: 142 },
  { id: 2, name: "Crystal Wings", category: "Accessories", price: 2.99, rarity: "Epic", seller: "CrystalSage", rating: 4.7, sales: 98 },
  { id: 3, name: "Shadow Dance Animation", category: "Animations", price: 1.99, rarity: "Rare", seller: "ShadowKing", rating: 4.5, sales: 234 },
  { id: 4, name: "Cosmic Voice Pack", category: "Voices", price: 3.49, rarity: "Epic", seller: "CosmicVoid", rating: 4.8, sales: 67 },
  { id: 5, name: "Ethereal Glow Aura", category: "Accessories", price: 1.49, rarity: "Uncommon", seller: "BioHunter", rating: 4.3, sales: 312 },
  { id: 6, name: "Holographic Throne Room", category: "Backgrounds", price: 5.99, rarity: "Legendary", seller: "HoloMaster", rating: 5.0, sales: 45 },
  { id: 7, name: "Phoenix Rebirth Animation", category: "Animations", price: 2.49, rarity: "Epic", seller: "FlameRider", rating: 4.6, sales: 156 },
  { id: 8, name: "Quantum Glitch Skin", category: "Skins", price: 3.99, rarity: "Rare", seller: "PixelGhost", rating: 4.4, sales: 89 },
];

const rarityColors: Record<string, string> = {
  "Legendary": "text-amber-500 bg-amber-500/10 border-amber-500/30",
  "Epic": "text-violet-500 bg-violet-500/10 border-violet-500/30",
  "Rare": "text-blue-500 bg-blue-500/10 border-blue-500/30",
  "Uncommon": "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
};

export const AvatarMarketplace = ({ onBack }: Props) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const { toast } = useToast();

  const filtered = MARKETPLACE_ITEMS.filter(item =>
    (activeCategory === "All" || item.category === activeCategory) &&
    (!search || item.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleBuy = async (item: typeof MARKETPLACE_ITEMS[0]) => {
    setBuyingId(item.id);
    try {
      const { data, error } = await supabase.functions.invoke("create-holographic-avatar-checkout", {
        body: { priceId: "price_1SPjFUGaXSfGtYFtNiiQEQcT", featureName: `Marketplace: ${item.name}`, metadata: { itemId: item.id, itemName: item.name } },
      });
      if (error) throw error;
      if (data?.url) { window.open(data.url, "_blank"); toast({ title: "Purchase Started", description: `Buying ${item.name}` }); }
    } catch { toast({ title: "Error", description: "Failed to start purchase", variant: "destructive" }); }
    finally { setBuyingId(null); }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Avatar Marketplace'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Avatar Marketplace panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Avatar Marketplace</h2>
          <p className="text-sm text-muted-foreground">Buy & sell custom skins, accessories, and animations</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1" />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <Button key={cat} size="sm" variant={activeCategory === cat ? "default" : "outline"} onClick={() => setActiveCategory(cat)} className="whitespace-nowrap text-xs">
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="hover:border-primary/40 transition-all group">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-sm">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">by {item.seller}</p>
                  </div>
                  <Badge className={`text-xs ${rarityColors[item.rarity]}`}>{item.rarity}</Badge>
                </div>
                <div className="h-24 bg-gradient-to-br from-primary/10 via-accent/5 to-violet-500/10 rounded-lg mb-3 flex items-center justify-center border border-border/40">
                  <Sparkles className="w-8 h-8 text-primary/50" />
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl font-black">€{item.price}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{item.rating}</span>
                    <span>{item.sales} sold</span>
                  </div>
                </div>
                <Button onClick={() => handleBuy(item)} disabled={buyingId === item.id} className="w-full" size="sm">
                  {buyingId === item.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <ShoppingBag className="w-3 h-3 mr-1" />} Buy Now
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
};
