import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, DollarSign, Zap, Heart } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface MarketListing {
  id: string;
  horse_id: string;
  seller_id: string;
  price_coins: number;
  listed_at: string;
  horses: {
    id: string;
    name: string;
    breed: string;
    color: string;
    speed_stat: number;
    stamina_stat: number;
    race_wins: number;
  };
}

export const HorseMarketplace = () => {
  const queryClient = useQueryClient();
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState("");
  const [sellPrice, setSellPrice] = useState("");

  const { data: myHorses = [] } = useQuery({
    queryKey: ["my-horses"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("horses")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data || [];
    },
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["horse-marketplace"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("horse_market_listings")
        .select(`
          *,
          horses (
            id,
            name,
            breed,
            color,
            speed_stat,
            stamina_stat,
            race_wins
          )
        `)
        .eq("is_active", true)
        .order("listed_at", { ascending: false });

      if (error) throw error;
      return data as MarketListing[] || [];
    },
    refetchInterval: 30000,
  });

  const listHorse = useMutation({
    mutationFn: async ({ horseId, price }: { horseId: string; price: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("horse_market_listings")
        .insert({
          horse_id: horseId,
          seller_id: user.id,
          price_coins: price,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Horse listed successfully!");
      setShowSellDialog(false);
      setSelectedHorse("");
      setSellPrice("");
      queryClient.invalidateQueries({ queryKey: ["horse-marketplace"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to list horse: ${error.message}`);
    },
  });

  const buyHorse = useMutation({
    mutationFn: async (listingId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("purchase_horse_from_market", {
        listing_id: listingId,
        buyer_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Horse purchased successfully!");
      queryClient.invalidateQueries({ queryKey: ["horse-marketplace"] });
      queryClient.invalidateQueries({ queryKey: ["my-horses"] });
      queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
    },
    onError: (error: Error) => {
      toast.error(`Purchase failed: ${error.message}`);
    },
  });

  const handleListHorse = () => {
    const price = parseInt(sellPrice);
    if (!selectedHorse || !price || price <= 0) {
      toast.error("Please select a horse and enter a valid price");
      return;
    }

    listHorse.mutate({ horseId: selectedHorse, price });
  };

  return (
    <>
      <FloatingHowItWorks title={"Horse Marketplace - How it works"} steps={[{ title: 'Open', desc: 'Access the Horse Marketplace section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Horse Marketplace.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Horse Marketplace
          </CardTitle>
          <Button onClick={() => setShowSellDialog(true)}>
            <DollarSign className="h-4 w-4 mr-2" />
            Sell Horse
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
          ) : listings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No horses for sale yet
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {listings.map((listing) => (
                <Card key={listing.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar 
                        className="h-16 w-16 border-2" 
                        style={{ borderColor: listing.horses.color }}
                      >
                        <AvatarFallback style={{ backgroundColor: listing.horses.color }}>
                          🐴
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{listing.horses.name}</h3>
                        <p className="text-sm text-muted-foreground">{listing.horses.breed}</p>
                        <Badge variant="secondary" className="mt-1">
                          {listing.horses.race_wins} wins
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span>Speed: {listing.horses.speed_stat}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>Stamina: {listing.horses.stamina_stat}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-5 w-5 text-yellow-500" />
                        <span className="text-2xl font-bold">{listing.price_coins}</span>
                        <span className="text-sm text-muted-foreground">coins</span>
                      </div>
                      <Button 
                        onClick={() => buyHorse.mutate(listing.id)}
                        disabled={buyHorse.isPending}
                      >
                        {buyHorse.isPending ? "Buying..." : "Buy"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sell Horse</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Horse</Label>
              <select 
                className="w-full mt-2 p-2 border rounded"
                value={selectedHorse}
                onChange={(e) => setSelectedHorse(e.target.value)}
              >
                <option value="">Choose a horse...</option>
                {myHorses.map((horse) => (
                  <option key={horse.id} value={horse.id}>
                    {horse.name} ({horse.breed})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Price (Coins)</Label>
              <Input
                type="number"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                placeholder="Enter price..."
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSellDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleListHorse}
              disabled={listHorse.isPending}
            >
              {listHorse.isPending ? "Listing..." : "List for Sale"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
    </>
  );
};
