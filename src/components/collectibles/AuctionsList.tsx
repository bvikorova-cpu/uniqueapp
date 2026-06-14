import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Clock, Coins, Gavel, Plus, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AuctionsListProps {
  userId: string;
}

export default function AuctionsList({ userId }: AuctionsListProps) {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [userCollectibles, setUserCollectibles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState<{ [key: string]: string }>({});
  const [biddingId, setBiddingId] = useState<string | null>(null);
  const [buyingOutId, setBuyingOutId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newAuction, setNewAuction] = useState({
    collectibleId: "",
    startingPrice: "",
    buyoutPrice: "",
    duration: "24"
  });

  useEffect(() => {
    fetchAuctions();
    fetchUserCollectibles();
  }, [userId]);

  const fetchAuctions = async () => {
    try {
      const { data, error } = await supabase
        .from('collectible_auctions')
        .select('*')
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAuctions(data || []);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      toast.error("Failed to load auctions");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCollectibles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_collectibles')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setUserCollectibles(data || []);
    } catch (error) {
      console.error('Error fetching collectibles:', error);
    }
  };

  const handleCreateAuction = async () => {
    if (!newAuction.collectibleId || !newAuction.startingPrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    const startPrice = parseInt(newAuction.startingPrice, 10);
    if (!Number.isFinite(startPrice) || startPrice <= 0 || startPrice > 100_000_000) {
      toast.error("Invalid starting price");
      return;
    }
    const buyout = newAuction.buyoutPrice ? parseInt(newAuction.buyoutPrice, 10) : null;
    if (buyout !== null && (!Number.isFinite(buyout) || buyout <= startPrice)) {
      toast.error("Buyout must be higher than starting price");
      return;
    }

    setIsCreating(true);
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(newAuction.duration, 10));

      const { error } = await supabase
        .from('collectible_auctions')
        .insert({
          seller_id: userId,
          user_collectible_id: newAuction.collectibleId,
          starting_price: startPrice,
          current_price: startPrice,
          buyout_price: buyout,
          status: 'active',
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      toast.success("Auction created successfully!");
      setNewAuction({ collectibleId: "", startingPrice: "", buyoutPrice: "", duration: "24" });
      fetchAuctions();
      fetchUserCollectibles();
    } catch (error) {
      console.error('Error creating auction:', error);
      toast.error("Failed to create auction");
    } finally {
      setIsCreating(false);
    }
  };

  const handlePlaceBid = async (auctionId: string) => {
    if (biddingId) return;
    const amount = parseInt(bidAmount[auctionId] || "", 10);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 100_000_000) {
      toast.error("Enter a valid bid amount");
      return;
    }
    setBiddingId(auctionId);
    try {
      const { data, error } = await supabase.rpc('place_collectible_bid', {
        p_auction_id: auctionId,
        p_bid: amount,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.success) {
        const reasonMap: Record<string, string> = {
          not_authenticated: "You must be signed in",
          not_found: "Auction not found",
          not_active: "Auction is no longer active",
          expired: "Auction has expired",
          own_auction: "You cannot bid on your own auction",
          bid_too_low: "Bid must be higher than current price",
          invalid_bid: "Invalid bid amount",
        };
        toast.error(reasonMap[row?.reason] || "Failed to place bid");
        return;
      }
      toast.success("Bid placed successfully!");
      setBidAmount({ ...bidAmount, [auctionId]: "" });
      fetchAuctions();
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error("Failed to place bid");
    } finally {
      setBiddingId(null);
    }
  };

  const handleBuyout = async (auctionId: string) => {
    if (buyingOutId) return;
    setBuyingOutId(auctionId);
    try {
      const { data, error } = await supabase.rpc('buyout_collectible_auction', {
        p_auction_id: auctionId,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.success) {
        const reasonMap: Record<string, string> = {
          not_authenticated: "You must be signed in",
          not_found: "Auction not found",
          not_active: "Auction is no longer active",
          expired: "Auction has expired",
          own_auction: "You cannot buy your own auction",
          no_buyout: "This auction has no buyout option",
        };
        toast.error(reasonMap[row?.reason] || "Failed to purchase item");
        return;
      }
      toast.success("Item purchased successfully!");
      fetchAuctions();
    } catch (error) {
      console.error('Error buying out:', error);
      toast.error("Failed to purchase item");
    } finally {
      setBuyingOutId(null);
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading auctions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Active Auctions</h3>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Auction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Auction</DialogTitle>
              <DialogDescription>
                List your collectible for auction
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Select Collectible</Label>
                <Select
                  value={newAuction.collectibleId}
                  onValueChange={(value) => setNewAuction({ ...newAuction, collectibleId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a collectible" />
                  </SelectTrigger>
                  <SelectContent>
                    {userCollectibles.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.collectible_type} - Level {item.level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Starting Price (coins)</Label>
                <Input
                  type="number"
                  value={newAuction.startingPrice}
                  onChange={(e) => setNewAuction({ ...newAuction, startingPrice: e.target.value })}
                  placeholder="100"
                />
              </div>

              <div>
                <Label>Buyout Price (optional)</Label>
                <Input
                  type="number"
                  value={newAuction.buyoutPrice}
                  onChange={(e) => setNewAuction({ ...newAuction, buyoutPrice: e.target.value })}
                  placeholder="500"
                />
              </div>

              <div>
                <Label>Duration</Label>
                <Select
                  value={newAuction.duration}
                  onValueChange={(value) => setNewAuction({ ...newAuction, duration: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                    <SelectItem value="72">72 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleCreateAuction} 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? "Creating..." : "Create Auction"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {auctions.length === 0 ? (
        <Card className="p-12 text-center">
          <Gavel className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No active auctions</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {auctions.map((auction) => (
            <Card key={auction.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Collectible #{auction.user_collectible_id.slice(0, 8)}</CardTitle>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {getTimeRemaining(auction.expires_at)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Bid</span>
                  <div className="flex items-center gap-1 font-bold text-lg">
                    <Coins className="h-4 w-4 text-primary" />
                    {auction.current_price}
                  </div>
                </div>

                {auction.buyout_price && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Buyout</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Coins className="h-3 w-3 text-primary" />
                      {auction.buyout_price}
                    </div>
                  </div>
                )}

                {auction.seller_id !== userId && (
                  <>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Your bid"
                        value={bidAmount[auction.id] || ""}
                        onChange={(e) => setBidAmount({ ...bidAmount, [auction.id]: e.target.value })}
                        disabled={biddingId === auction.id}
                      />
                      <Button
                        onClick={() => handlePlaceBid(auction.id)}
                        size="sm"
                        disabled={biddingId === auction.id}
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                    </div>

                    {auction.buyout_price && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleBuyout(auction.id)}
                        disabled={buyingOutId === auction.id}
                      >
                        {buyingOutId === auction.id ? "Processing..." : `Buy Now - ${auction.buyout_price} coins`}
                      </Button>
                    )}
                  </>
                )}

                {auction.seller_id === userId && (
                  <Badge variant="secondary" className="w-full justify-center">
                    Your Auction
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
