import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Hammer, Clock, TrendingUp, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface Memory {
  id: string;
  title: string;
}

interface Auction {
  id: string;
  memory_id: string;
  starting_price: number;
  current_bid: number | null;
  highest_bidder_id: string | null;
  ends_at: string;
  status: string;
  created_at: string;
}

const MemoryAuctions = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [myMemories, setMyMemories] = useState<Memory[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [newAuction, setNewAuction] = useState({
    memory_id: "",
    starting_price: 10,
    duration_hours: 24,
  });

  const [bidAmount, setBidAmount] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchAuctions();
    fetchMyMemories();
  }, []);

  const fetchAuctions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("memory_auctions")
      .select("*")
      .eq("status", "active")
      .order("ends_at", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch auctions",
        variant: "destructive",
      });
    } else {
      setAuctions(data || []);
    }
    setLoading(false);
  };

  const fetchMyMemories = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("memories")
      .select("id, title")
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to fetch memories", error);
    } else {
      setMyMemories(data || []);
    }
  };

  const createAuction = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create auctions",
        variant: "destructive",
      });
      return;
    }

    if (!newAuction.memory_id) {
      toast({
        title: "Missing Information",
        description: "Please select a memory",
        variant: "destructive",
      });
      return;
    }

    const endsAt = new Date();
    endsAt.setHours(endsAt.getHours() + newAuction.duration_hours);

    const { error } = await supabase.from("memory_auctions").insert([
      {
        memory_id: newAuction.memory_id,
        starting_price: newAuction.starting_price,
        ends_at: endsAt.toISOString(),
      },
    ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create auction",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Auction created successfully",
      });
      setIsCreating(false);
      setNewAuction({
        memory_id: "",
        starting_price: 10,
        duration_hours: 24,
      });
      fetchAuctions();
    }
  };

  const placeBid = async (auction: Auction) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place bids",
        variant: "destructive",
      });
      return;
    }

    const bid = bidAmount[auction.id];
    const minBid = (auction.current_bid || auction.starting_price) + 1;

    if (!bid || bid < minBid) {
      toast({
        title: "Invalid Bid",
        description: `Minimum bid is ${minBid.toFixed(2)}€`,
        variant: "destructive",
      });
      return;
    }

    const { error: bidError } = await supabase.from("memory_auction_bids").insert([
      {
        auction_id: auction.id,
        bidder_id: user.id,
        bid_amount: bid,
      },
    ]);

    if (bidError) {
      toast({
        title: "Error",
        description: "Failed to place bid",
        variant: "destructive",
      });
      return;
    }

    const { error: updateError } = await supabase
      .from("memory_auctions")
      .update({
        current_bid: bid,
        highest_bidder_id: user.id,
      })
      .eq("id", auction.id);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update auction",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Bid placed: ${bid.toFixed(2)}€`,
      });
      fetchAuctions();
    }
  };

  const getTimeRemaining = (endsAt: string) => {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Memory Auctions</h2>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="h-4 w-4 mr-2" />
          {isCreating ? "Cancel" : "Create Auction"}
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Auction</CardTitle>
            <CardDescription>Put your memory up for auction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={newAuction.memory_id} onValueChange={(value) => setNewAuction({ ...newAuction, memory_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a memory" />
              </SelectTrigger>
              <SelectContent>
                {myMemories.map((memory) => (
                  <SelectItem key={memory.id} value={memory.id}>
                    {memory.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="1"
                min="10"
                max="500"
                value={newAuction.starting_price}
                onChange={(e) => setNewAuction({ ...newAuction, starting_price: parseFloat(e.target.value) })}
              />
              <span className="text-muted-foreground">€ starting price</span>
            </div>
            <Select
              value={newAuction.duration_hours.toString()}
              onValueChange={(value) => setNewAuction({ ...newAuction, duration_hours: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="48">48 hours</SelectItem>
                <SelectItem value="72">72 hours</SelectItem>
                <SelectItem value="168">7 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={createAuction} className="w-full" disabled={myMemories.length === 0}>
              Create Auction
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-muted-foreground">Loading auctions...</p>
        ) : auctions.length === 0 ? (
          <p className="text-muted-foreground">No active auctions</p>
        ) : (
          auctions.map((auction) => (
            <Card key={auction.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Hammer className="h-5 w-5" />
                  Auction #{auction.id.slice(0, 8)}
                </CardTitle>
                <CardDescription>Memory ID: {auction.memory_id.slice(0, 8)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Starting:</span>
                    <span className="font-semibold">{auction.starting_price.toFixed(2)}€</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Bid:</span>
                    <span className="font-bold text-primary">
                      {auction.current_bid ? `${auction.current_bid.toFixed(2)}€` : "No bids yet"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">{getTimeRemaining(auction.ends_at)}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="1"
                    min={(auction.current_bid || auction.starting_price) + 1}
                    placeholder="Your bid"
                    value={bidAmount[auction.id] || ""}
                    onChange={(e) => setBidAmount({ ...bidAmount, [auction.id]: parseFloat(e.target.value) })}
                  />
                  <Button onClick={() => placeBid(auction)} size="sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Bid
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MemoryAuctions;
