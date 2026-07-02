import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Gavel, Zap, Heart, Star, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const HorseAuctionHouse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showSell, setShowSell] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState("");
  const [sellPrice, setSellPrice] = useState("");

  const { data: myHorses = [] } = useQuery({
    queryKey: ["my-horses-auction"],
    queryFn: async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return [];
      const { data } = await supabase.from("horses").select("*").eq("user_id", u.id);
      return data || [];
    },
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["horse-marketplace"],
    queryFn: async () => {
      const { data } = await supabase
        .from("horse_market_listings")
        .select("*, horses(id, name, breed, color, speed_stat, stamina_stat, acceleration_stat, temperament_stat, race_wins, level)")
        .eq("is_active", true)
        .order("listed_at", { ascending: false });
      return data || [];
    },
    refetchInterval: 15000,
  });

  const listHorse = useMutation({
    mutationFn: async ({ horseId, price }: { horseId: string; price: number }) => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) throw new Error("Not authenticated");
      const { error } = await supabase.from("horse_market_listings").insert({
        horse_id: horseId, seller_id: u.id, price_coins: price,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Horse listed for auction!");
      setShowSell(false); setSelectedHorse(""); setSellPrice("");
      queryClient.invalidateQueries({ queryKey: ["horse-marketplace"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const buyHorse = useMutation({
    mutationFn: async (listingId: string) => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) throw new Error("Not authenticated");
      const { error } = await supabase.rpc("purchase_horse_from_market", { listing_id: listingId, buyer_id: u.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Horse purchased!");
      queryClient.invalidateQueries({ queryKey: ["horse-marketplace"] });
      queryClient.invalidateQueries({ queryKey: ["my-horses-auction"] });
      queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const getPowerScore = (h: any) => (h.speed_stat || 0) + (h.stamina_stat || 0) + (h.acceleration_stat || 0) + (h.temperament_stat || 0);

  return (
    <>
      <FloatingHowItWorks title={"Horse Auction House - How it works"} steps={[{ title: 'Open', desc: 'Access the Horse Auction House section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Horse Auction House.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Gavel className="h-6 w-6 text-amber-400" /> Horse Auction House
          </h2>
          <p className="text-muted-foreground text-sm">Buy & sell champion horses on the open market</p>
        </div>
        <Button onClick={() => { if (!user) { navigate("/auth"); return; } setShowSell(true); }}
          className="bg-gradient-to-r from-purple-600 to-amber-600 text-white"
        >
          <DollarSign className="h-4 w-4 mr-1" /> Sell Horse
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">Loading auctions...</p>
      ) : listings.length === 0 ? (
        <div className="text-center py-12">
          <Gavel className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">No horses for sale yet. Be the first to list!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((listing: any, i: number) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-4 border-purple-500/10 bg-card/80 backdrop-blur-sm hover:border-amber-500/30 transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-xl border-2 border-white/20" style={{ backgroundColor: listing.horses?.color }} />
                    <div className="absolute -inset-1 rounded-xl blur-md opacity-30" style={{ backgroundColor: listing.horses?.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{listing.horses?.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{listing.horses?.breed} • Lvl {listing.horses?.level}</p>
                    <Badge variant="secondary" className="text-[10px] mt-1">
                      <Star className="h-3 w-3 mr-1" /> Power: {getPowerScore(listing.horses)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1 mb-3 text-[10px]">
                  <span className="flex items-center gap-0.5"><Zap className="h-3 w-3 text-yellow-400" /> {listing.horses?.speed_stat}</span>
                  <span className="flex items-center gap-0.5"><Heart className="h-3 w-3 text-blue-400" /> {listing.horses?.stamina_stat}</span>
                  <span className="flex items-center gap-0.5"><TrendingUp className="h-3 w-3 text-orange-400" /> {listing.horses?.acceleration_stat}</span>
                  <span className="text-amber-400">🏆 {listing.horses?.race_wins}W</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-amber-400">{listing.price_coins} Coins</span>
                  <Button size="sm" onClick={() => { if (!user) { navigate("/auth"); return; } buyHorse.mutate(listing.id); }}
                    disabled={buyHorse.isPending}
                    className="bg-gradient-to-r from-purple-600 to-amber-600 text-white"
                  >
                    <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                    {buyHorse.isPending ? "..." : "Buy Now"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={showSell} onOpenChange={setShowSell}>
        <DialogContent>
          <DialogHeader><DialogTitle>List Horse for Sale</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <select className="w-full p-2 border rounded bg-background" value={selectedHorse} onChange={e => setSelectedHorse(e.target.value)}>
              <option value="">Choose a horse...</option>
              {myHorses.map((h: any) => <option key={h.id} value={h.id}>{h.name} ({h.breed})</option>)}
            </select>
            <Input type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} placeholder="Price in Coins" min="1" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSell(false)}>Cancel</Button>
            <Button onClick={() => {
              const price = parseInt(sellPrice);
              if (!selectedHorse || !price || price <= 0) { toast.error("Enter valid details"); return; }
              listHorse.mutate({ horseId: selectedHorse, price });
            }} disabled={listHorse.isPending}>
              {listHorse.isPending ? "Listing..." : "List for Sale"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};
