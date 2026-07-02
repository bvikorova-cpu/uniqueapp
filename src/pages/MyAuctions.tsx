import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gavel, Trophy, X, Clock, Package, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AuctionWithdrawalRequest } from "@/components/auction/AuctionWithdrawalRequest";
import { formatDistanceToNow } from "date-fns";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface AuctionItem {
  id: string;
  title: string;
  description: string;
  current_price: number;
  starting_price: number;
  buyout_price: number | null;
  image_url: string | null;
  category: string;
  ends_at: string;
  is_active: boolean | null;
  winner_id: string | null;
  user_id: string;
  escrow_status: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

interface MyBid {
  auction_id: string;
  bid_amount: number;
  created_at: string;
  auction: AuctionItem | null;
}

const MyAuctions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeBids, setActiveBids] = useState<MyBid[]>([]);
  const [wonAuctions, setWonAuctions] = useState<AuctionItem[]>([]);
  const [lostAuctions, setLostAuctions] = useState<MyBid[]>([]);
  const [myListings, setMyListings] = useState<AuctionItem[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to view your auctions");
        navigate("/auth");
        return;
      }
      setUserId(user.id);
      await loadAll(user.id);
    };
    init();
  }, [navigate]);

  const loadAll = async (uid: string) => {
    setLoading(true);
    try {
      // All my bids with related auctions
      const { data: bids } = await supabase
        .from("auction_bids")
        .select("auction_id, bid_amount, created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      const auctionIds = Array.from(new Set((bids || []).map((b) => b.auction_id)));
      let auctionsById: Record<string, AuctionItem> = {};
      if (auctionIds.length) {
        const { data: auctions } = await supabase
          .from("auction_items")
          .select("*")
          .in("id", auctionIds);
        auctionsById = Object.fromEntries((auctions || []).map((a) => [a.id, a as AuctionItem]));
      }

      // Highest bid per auction by this user
      const myMaxBidPerAuction = new Map<string, MyBid>();
      for (const b of bids || []) {
        const prev = myMaxBidPerAuction.get(b.auction_id);
        const auction = auctionsById[b.auction_id] || null;
        if (!prev || b.bid_amount > prev.bid_amount) {
          myMaxBidPerAuction.set(b.auction_id, { ...b, auction });
        }
      }

      const now = Date.now();
      const active: MyBid[] = [];
      const won: AuctionItem[] = [];
      const lost: MyBid[] = [];

      for (const bid of myMaxBidPerAuction.values()) {
        const a = bid.auction;
        if (!a) continue;
        const ended = new Date(a.ends_at).getTime() < now || a.is_active === false;
        if (!ended) {
          active.push(bid);
        } else if (a.winner_id === uid) {
          won.push(a);
        } else {
          lost.push(bid);
        }
      }

      // My own listings (separately)
      const { data: listings } = await supabase
        .from("auction_items")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      setActiveBids(active);
      setWonAuctions(won);
      setLostAuctions(lost);
      setMyListings((listings || []) as AuctionItem[]);
    } catch (e: any) {
      toast.error(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const AuctionCard = ({
    auction,
    myBid,
    badge,
  }: {
    auction: AuctionItem;
    myBid?: number;
    badge?: { label: string; variant?: "default" | "secondary" | "destructive" | "outline"; className?: string };
  }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden hover:shadow-lg transition border-border/60 bg-card/60 backdrop-blur">
        <div className="flex gap-4 p-4">
          <div className="w-24 h-24 rounded-md overflow-hidden bg-muted shrink-0">
            {auction.image_url ? (
              <img src={auction.image_url} alt={auction.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Package className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold truncate">{auction.title}</h3>
              {badge && (
                <Badge variant={badge.variant ?? "secondary"} className={badge.className}>
                  {badge.label}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{auction.description}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-sm">
              <span className="text-muted-foreground">
                Current: <span className="font-semibold text-foreground">€{auction.current_price.toFixed(2)}</span>
              </span>
              {typeof myBid === "number" && (
                <span className="text-muted-foreground">
                  Your bid: <span className="font-semibold text-primary">€{myBid.toFixed(2)}</span>
                </span>
              )}
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(auction.ends_at).getTime() > Date.now()
                  ? `Ends in ${formatDistanceToNow(new Date(auction.ends_at))}`
                  : `Ended ${formatDistanceToNow(new Date(auction.ends_at), { addSuffix: true })}`}
              </span>
            </div>
            <div className="mt-3">
              <Button size="sm" variant="outline" asChild>
                <Link to={`/auction?item=${auction.id}`}>View auction</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const Empty = ({ icon: Icon, text }: { icon: any; text: string }) => (
    <div className="text-center py-16 text-muted-foreground">
      <Icon className="w-10 h-10 mx-auto mb-3 opacity-60" />
      <p>{text}</p>
    </div>
  );

  return (
    <>
      <FloatingHowItWorks title="How My Auctions works" steps={[
          { title: 'Browse listings', desc: 'Explore items, services or offers.' },
          { title: 'Open a detail', desc: 'Review price, seller and terms.' },
          { title: 'Buy / order / bid', desc: 'Complete secure Stripe checkout in EUR. Fees follow platform splits.' },
          { title: 'Track & review', desc: 'Manage orders, leave reviews, get notifications.' },
        ]} />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/auction"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Gavel className="w-6 h-6 text-primary" /> My Auctions
          </h1>
          <p className="text-sm text-muted-foreground">History, active bids and results</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card><CardContent className="p-4"><CardDescription>Active bids</CardDescription><CardTitle className="text-2xl">{activeBids.length}</CardTitle></CardContent></Card>
        <Card><CardContent className="p-4"><CardDescription>Won</CardDescription><CardTitle className="text-2xl text-emerald-500">{wonAuctions.length}</CardTitle></CardContent></Card>
        <Card><CardContent className="p-4"><CardDescription>Lost</CardDescription><CardTitle className="text-2xl text-muted-foreground">{lostAuctions.length}</CardTitle></CardContent></Card>
        <Card><CardContent className="p-4"><CardDescription>My listings</CardDescription><CardTitle className="text-2xl">{myListings.length}</CardTitle></CardContent></Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="won">Won</TabsTrigger>
            <TabsTrigger value="lost">Lost</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3 mt-4">
            {activeBids.length === 0 ? (
              <Empty icon={Clock} text="No active bids. Place a bid on the auction page." />
            ) : (
              activeBids.map((b) => b.auction && (
                <AuctionCard
                  key={b.auction_id}
                  auction={b.auction}
                  myBid={b.bid_amount}
                  badge={{
                    label: b.bid_amount >= b.auction.current_price ? "Highest bidder" : "Outbid",
                    variant: b.bid_amount >= b.auction.current_price ? "default" : "destructive",
                  }}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="won" className="space-y-3 mt-4">
            {wonAuctions.length === 0 ? (
              <Empty icon={Trophy} text="No wins yet. Keep bidding!" />
            ) : (
              wonAuctions.map((a) => (
                <AuctionCard
                  key={a.id}
                  auction={a}
                  badge={{
                    label: a.delivered_at ? "Delivered" : a.shipped_at ? "Shipped" : a.paid_at ? "Paid" : "Pending payment",
                    className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
                  }}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="lost" className="space-y-3 mt-4">
            {lostAuctions.length === 0 ? (
              <Empty icon={X} text="No lost auctions yet." />
            ) : (
              lostAuctions.map((b) => b.auction && (
                <AuctionCard
                  key={b.auction_id}
                  auction={b.auction}
                  myBid={b.bid_amount}
                  badge={{ label: "Lost", variant: "outline" }}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="listings" className="space-y-3 mt-4">
            {myListings.length === 0 ? (
              <Empty icon={Package} text="You haven't listed any items yet." />
            ) : (
              myListings.map((a) => (
                <AuctionCard
                  key={a.id}
                  auction={a}
                  badge={{
                    label: a.is_active === false || new Date(a.ends_at).getTime() < Date.now()
                      ? a.winner_id ? "Sold" : "Ended"
                      : "Active",
                    variant: a.winner_id ? "default" : "secondary",
                  }}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}

      <div className="mt-8">
        <AuctionWithdrawalRequest />
      </div>
    </div>
    </>
    );
};

export default MyAuctions;
