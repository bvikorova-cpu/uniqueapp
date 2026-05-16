import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";

const LISTINGS = [
  { id: "l1", title: "Custom Portrait Drawing", artist: "Anya K.", price: 45, eta: "3 days", emoji: "✏️" },
  { id: "l2", title: "Personalized Birthday Song", artist: "Jay M.", price: 60, eta: "5 days", emoji: "🎵" },
  { id: "l3", title: "Choreography for Wedding", artist: "Mila R.", price: 120, eta: "7 days", emoji: "💃" },
  { id: "l4", title: "Logo Animation Reel", artist: "Theo P.", price: 90, eta: "4 days", emoji: "🎬" },
];

const MegatalentTalentMarketplace = ({ category }: { category?: string }) => {
  const buy = (l: typeof LISTINGS[number]) => {
    toast.success(`Order placed: ${l.title}`, { description: `${l.price} credits in escrow · delivery in ${l.eta}` });
  };
  return (
    <Card className="overflow-hidden backdrop-blur-xl bg-card/70 border-border/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-bold">Talent Marketplace</h3>
          <Badge variant="secondary" className="ml-auto gap-1"><Sparkles className="h-3 w-3" /> Escrow</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Commission custom work from verified talents.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {LISTINGS.map((l, i) => (
            <motion.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border/40 bg-background/40 p-3 flex flex-col">
              <div className="text-3xl mb-2">{l.emoji}</div>
              <div className="text-sm font-semibold leading-tight line-clamp-2">{l.title}</div>
              <div className="text-[11px] text-muted-foreground mt-1">by {l.artist} · {l.eta}</div>
              <div className="mt-auto pt-3 flex items-center justify-between">
                <span className="font-bold text-primary">{l.price}</span>
                <Button size="sm" variant="secondary" onClick={() => buy(l)}>Order</Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MegatalentTalentMarketplace;
