import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ShoppingBag, Coins, Lock, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getStars, spendStars } from "@/lib/kidsAcademyEconomy";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const SHOP_ITEMS = [
  { id: "avatar-robot", name: "Robot Avatar", emoji: "🤖", price: 50, category: "avatar", owned: false },
  { id: "avatar-dragon", name: "Dragon Avatar", emoji: "🐉", price: 100, category: "avatar", owned: false },
  { id: "avatar-unicorn", name: "Unicorn Avatar", emoji: "🦄", price: 150, category: "avatar", owned: false },
  { id: "avatar-wizard", name: "Wizard Avatar", emoji: "🧙‍♂️", price: 200, category: "avatar", owned: false },
  { id: "bg-galaxy", name: "Galaxy Background", emoji: "🌌", price: 75, category: "background", owned: false },
  { id: "bg-forest", name: "Enchanted Forest", emoji: "🌳", price: 75, category: "background", owned: false },
  { id: "bg-ocean", name: "Deep Ocean", emoji: "🌊", price: 100, category: "background", owned: false },
  { id: "story-pirate", name: "Pirate Adventure", emoji: "🏴‍☠️", price: 120, category: "story", owned: false },
  { id: "story-space", name: "Space Odyssey", emoji: "🚀", price: 120, category: "story", owned: false },
  { id: "power-2x", name: "2x XP Boost (1hr)", emoji: "⚡", price: 30, category: "powerup", owned: false },
  { id: "power-hint", name: "Quiz Hint Pack (5)", emoji: "💡", price: 25, category: "powerup", owned: false },
  { id: "power-skip", name: "Challenge Skip", emoji: "⏭️", price: 15, category: "powerup", owned: false },
];

const CATEGORIES = [
  { id: "all", label: "All", emoji: "🛒" },
  { id: "avatar", label: "Avatars", emoji: "👤" },
  { id: "background", label: "Backgrounds", emoji: "🎨" },
  { id: "story", label: "Stories", emoji: "📖" },
  { id: "powerup", label: "Power-ups", emoji: "⚡" },
];

export const KidsAcademyShop = () => {
  const [stars, setStars] = useState<number>(() => getStars());
  const [owned, setOwned] = useState<string[]>(() => {
    const saved = localStorage.getItem("kids-academy-shop-owned");
    return saved ? JSON.parse(saved) : [];
  });
  const [filter, setFilter] = useState("all");

  // Keep stars in sync with XP changes (XP earned anywhere → stars update here).
  useEffect(() => {
    const refresh = () => setStars(getStars());
    window.addEventListener("storage", refresh);
    const interval = setInterval(refresh, 1500);
    return () => {
      window.removeEventListener("storage", refresh);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("kids-academy-shop-owned", JSON.stringify(owned));
  }, [owned]);

  const handleBuy = (item: typeof SHOP_ITEMS[0]) => {
    if (owned.includes(item.id)) {
      toast.info("You already own this item!");
      return;
    }
    if (!spendStars(item.price)) {
      toast.error("Not enough stars!", { description: `You need ${item.price - stars} more stars. Earn XP to get more!` });
      return;
    }
    setStars(getStars());
    setOwned(prev => [...prev, item.id]);
    toast.success(`Unlocked: ${item.name} ${item.emoji}`);
  };

  const filteredItems = filter === "all" ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.category === filter);

  return (
    <div className="space-y-4">
      {/* Star balance */}
      <Card className="border-2 border-amber-500/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-2xl"
              >
                ⭐
              </motion.div>
              <div>
                <div className="text-2xl font-black text-foreground">{stars}</div>
                <div className="text-xs text-muted-foreground">Stars earned</div>
              </div>
            </div>
            <Badge className="bg-primary/15 text-primary border-primary/30">
              <Coins className="w-3 h-3 mr-1" />
              1 star per 10 XP
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Shop */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Rewards Shop
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <Button
                key={cat.id}
                variant={filter === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(cat.id)}
                className="text-xs"
              >
                {cat.emoji} {cat.label}
              </Button>
            ))}
          </div>

          {/* Items grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredItems.map((item, i) => {
              const isOwned = owned.includes(item.id);
              const canAfford = stars >= item.price;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`relative p-3 rounded-xl border-2 text-center transition-all flex flex-col ${
                    isOwned
                      ? "border-green-500/40 bg-green-500/5"
                      : canAfford
                      ? "border-primary/30 bg-card hover:border-primary/50 hover:shadow-md"
                      : "border-border/50 bg-muted/20 opacity-70"
                  }`}
                >
                  <motion.span
                    className="text-3xl block mb-2"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                  >
                    {item.emoji}
                  </motion.span>
                  <h4 className="text-xs font-bold text-foreground mb-1 truncate">{item.name}</h4>
                  <div className="flex items-center justify-center gap-1 text-xs mb-2">
                    <span>⭐</span>
                    <span className={`font-bold ${canAfford ? "text-amber-600" : "text-muted-foreground"}`}>
                      {item.price}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant={isOwned ? "outline" : "default"}
                    className="w-full text-[10px] h-7 mt-auto"
                    disabled={isOwned || !canAfford}
                    onClick={() => handleBuy(item)}
                  >
                    {isOwned ? (
                      <><Check className="w-3 h-3 mr-1" /> Owned</>
                    ) : !canAfford ? (
                      <><Lock className="w-3 h-3 mr-1" /> Locked</>
                    ) : (
                      "Buy"
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
