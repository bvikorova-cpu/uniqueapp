import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Gavel, Clock, TrendingUp, Plus, Upload, X, AlertCircle, DollarSign, FileText, Target, Tags, Flame, Trophy, Star, Lightbulb, BarChart3, Bell, Tag, Camera, Handshake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { AuctionHero } from "@/components/auction/AuctionHero";
import { PriceEstimatorView } from "@/components/auction/views/PriceEstimatorView";
import { ListingOptimizerView } from "@/components/auction/views/ListingOptimizerView";
import { BidStrategyView } from "@/components/auction/views/BidStrategyView";
import { CategoryRecommenderView } from "@/components/auction/views/CategoryRecommenderView";
import { AuctionAnalyticsView } from "@/components/auction/views/AuctionAnalyticsView";
import { SmartAlertsView } from "@/components/auction/views/SmartAlertsView";
import { ValueTrackerView } from "@/components/auction/views/ValueTrackerView";
import { PhotoEnhancerView } from "@/components/auction/views/PhotoEnhancerView";
import { NegotiationCoachView } from "@/components/auction/views/NegotiationCoachView";
import { MarketTrendsView } from "@/components/auction/views/MarketTrendsView";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { SellerConnectGate } from "@/components/commerce/SellerConnectGate";
interface AuctionItem {
  id: string;
  title: string;
  description: string;
  starting_price: number;
  current_price: number;
  buyout_price: number | null;
  image_url: string | null;
  category: string;
  condition: string;
  ends_at: string;
  user_id: string;
}

type ActiveView = "dashboard" | "price_estimator" | "listing_optimizer" | "bid_strategy" | "category_recommender" | "auction_analytics" | "smart_alerts" | "value_tracker" | "photo_enhancer" | "negotiation_coach" | "market_trends";

const aiTools = [
  { id: "price_estimator" as const, icon: DollarSign, label: "AI Price Estimator", desc: "Smart pricing recommendations", credits: 3, gradient: "from-amber-600 to-yellow-600" },
  { id: "listing_optimizer" as const, icon: FileText, label: "AI Listing Optimizer", desc: "SEO-optimized descriptions", credits: 4, gradient: "from-orange-600 to-amber-600" },
  { id: "bid_strategy" as const, icon: Target, label: "AI Bid Strategy", desc: "Win auctions smartly", credits: 3, gradient: "from-yellow-600 to-amber-500" },
  { id: "category_recommender" as const, icon: Tags, label: "AI Category Match", desc: "Auto-categorize items", credits: 2, gradient: "from-amber-500 to-orange-500" },
  { id: "auction_analytics" as const, icon: BarChart3, label: "AI Auction Analytics", desc: "Performance insights", credits: 4, gradient: "from-amber-600 to-yellow-600" },
  { id: "smart_alerts" as const, icon: Bell, label: "AI Smart Alerts", desc: "Deal notifications", credits: 3, gradient: "from-yellow-600 to-orange-600" },
  { id: "value_tracker" as const, icon: Tag, label: "AI Value Tracker", desc: "Track market values", credits: 3, gradient: "from-emerald-600 to-amber-600" },
  { id: "photo_enhancer" as const, icon: Camera, label: "AI Photo Enhancer", desc: "Pro photo tips", credits: 3, gradient: "from-purple-600 to-amber-600" },
  { id: "negotiation_coach" as const, icon: Handshake, label: "AI Negotiation Coach", desc: "Master deal-making", credits: 4, gradient: "from-rose-600 to-amber-600" },
  { id: "market_trends" as const, icon: TrendingUp, label: "AI Market Trends", desc: "Category predictions", credits: 4, gradient: "from-blue-600 to-amber-600" },
];

const Auction = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [buyoutPrice, setBuyoutPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [duration, setDuration] = useState("24");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [bidding, setBidding] = useState(false);
  const [buyingOutId, setBuyingOutId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailAuction, setDetailAuction] = useState<AuctionItem | null>(null);
  const [auctionPhotos, setAuctionPhotos] = useState<string[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");
  const { limits } = useSubscription();

  useEffect(() => {
    checkUser();
    fetchAuctions();
    checkPaymentStatus();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkPaymentStatus = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');
    if (paymentStatus === 'success' && sessionId) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await supabase.functions.invoke('verify-payment', {
          body: { session_id: sessionId, product_type: 'auction_buyout' },
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined
        });
        toast.success("Payment successful!");
        window.history.replaceState({}, '', window.location.pathname);
        fetchAuctions();
      } catch { toast.error("Failed to verify payment."); }
    } else if (paymentStatus === 'canceled') {
      toast.error("Payment was cancelled.");
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const checkUser = async () => { const { data: { user } } = await supabase.auth.getUser(); setUser(user); };

  const fetchAuctions = async () => {
    try {
      const { data, error } = await supabase.from("auction_items").select("*").eq("is_active", true).order("created_at", { ascending: false });
      if (error) throw error;
      setAuctions(data || []);
    } catch { toast.error("Failed to load auctions"); }
    finally { setLoading(false); }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (imageFiles.length + files.length > 3) { toast.error("Maximum 3 photos"); return; }
    const validFiles = files.filter(f => { if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} too large`); return false; } return true; });
    setImageFiles(prev => [...prev, ...validFiles]);
    validFiles.forEach(file => { const r = new FileReader(); r.onloadend = () => setImagePreviews(prev => [...prev, r.result as string]); r.readAsDataURL(file); });
  };

  const removeImage = (index: number) => { setImageFiles(prev => prev.filter((_, i) => i !== index)); setImagePreviews(prev => prev.filter((_, i) => i !== index)); };

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("You must be logged in"); navigate("/auth"); return; }
    setUploading(true);
    try {
      const endsAt = new Date(); endsAt.setHours(endsAt.getHours() + parseInt(duration));
      let firstImageUrl = null; const uploadedPhotos: string[] = [];
      for (const file of imageFiles) {
        const fileName = `${user.id}-${Date.now()}-${Math.random()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('bazaar_images').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('bazaar_images').getPublicUrl(fileName);
        uploadedPhotos.push(publicUrl);
        if (!firstImageUrl) firstImageUrl = publicUrl;
      }
      const { data: auctionData, error: auctionError } = await supabase.from("auction_items").insert({
        user_id: user.id, title, description, starting_price: parseFloat(startingPrice), current_price: parseFloat(startingPrice),
        buyout_price: buyoutPrice ? parseFloat(buyoutPrice) : null, category, condition, ends_at: endsAt.toISOString(), image_url: firstImageUrl,
      }).select().single();
      if (auctionError) throw auctionError;
      if (uploadedPhotos.length > 0) {
        await supabase.from("auction_photos").insert(uploadedPhotos.map(url => ({ auction_id: auctionData.id, photo_url: url })));
      }
      toast.success("Auction created!");
      setCreateDialogOpen(false);
      setTitle(""); setDescription(""); setStartingPrice(""); setBuyoutPrice(""); setCategory(""); setCondition(""); setDuration("24"); setImageFiles([]); setImagePreviews([]);
      fetchAuctions();
    } catch { toast.error("Failed to create auction"); }
    finally { setUploading(false); }
  };

  const handleBid = (auction: AuctionItem) => { if (!user) { toast.error("You must be logged in"); navigate("/auth"); return; } setSelectedAuction(auction); setBidAmount(""); setBidDialogOpen(true); };

  const handleBuyout = async (auction: AuctionItem) => {
    if (!user) { toast.error("You must be logged in"); navigate("/auth"); return; }
    if (!auction.buyout_price) return;
    if (auction.user_id === user.id) { toast.error("Cannot buy your own auction"); return; }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("create-auction-buyout", {
        body: { auction_id: auction.id },
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      });
      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL");
      window.location.href = data.url;
    } catch (e: any) {
      toast.error(e?.message || "Failed to start checkout");
    }
  };

  const submitBid = async () => {
    if (!selectedAuction || !bidAmount) return;
    const amount = parseFloat(bidAmount);
    if (amount <= selectedAuction.current_price) { toast.error("Bid must be higher than current price"); return; }
    try {
      const { error } = await supabase.rpc("place_auction_bid" as any, {
        p_auction_id: selectedAuction.id,
        p_amount: amount,
      });
      if (error) throw error;
      toast.success("Bid placed!"); setBidDialogOpen(false); setBidAmount(""); setSelectedAuction(null); fetchAuctions();
    } catch (e: any) { toast.error(e?.message || "Failed to place bid"); }
  };

  const handleDeleteAuction = async (auctionId: string) => {
    if (!user) return;
    try { await supabase.from("auction_items").delete().eq("id", auctionId).eq("user_id", user.id); toast.success("Auction deleted"); fetchAuctions(); }
    catch { toast.error("Failed to delete"); }
  };

  const handleShowDetail = async (auction: AuctionItem) => {
    setDetailAuction(auction);
    const { data: photos } = await supabase.from("auction_photos").select("photo_url").eq("auction_id", auction.id).order("created_at", { ascending: true });
    setAuctionPhotos(photos?.map(p => p.photo_url) || []);
    setDetailDialogOpen(true);
  };

  const getTimeRemaining = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return "Ended";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 24 ? `${Math.floor(hours / 24)}d ${hours % 24}h` : `${hours}h ${minutes}m`;
  };

  // Render AI tool views
  if (activeView === "price_estimator") return <PriceEstimatorView onBack={() => setActiveView("dashboard")} />;
  if (activeView === "listing_optimizer") return <ListingOptimizerView onBack={() => setActiveView("dashboard")} />;
  if (activeView === "bid_strategy") return <BidStrategyView onBack={() => setActiveView("dashboard")} />;
  if (activeView === "category_recommender") return <CategoryRecommenderView onBack={() => setActiveView("dashboard")} />;
  if (activeView === "auction_analytics") return <AuctionAnalyticsView onBack={() => setActiveView("dashboard")} />;
  if (activeView === "smart_alerts") return <SmartAlertsView onBack={() => setActiveView("dashboard")} />;
  if (activeView === "value_tracker") return <ValueTrackerView onBack={() => setActiveView("dashboard")} />;
  if (activeView === "photo_enhancer") return <PhotoEnhancerView onBack={() => setActiveView("dashboard")} />;
  if (activeView === "negotiation_coach") return <NegotiationCoachView onBack={() => setActiveView("dashboard")} />;
  if (activeView === "market_trends") return <MarketTrendsView onBack={() => setActiveView("dashboard")} />;

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Cinematic Hero */}
        <AuctionHero />

        <div className="flex justify-end mb-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/my-auctions"><Trophy className="w-4 h-4 mr-2" />My Auctions</Link>
          </Button>
        </div>

        <HeroRewardedAd sectionKey="page_auction" />

        {/* Engagement Row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card/80 backdrop-blur-sm border border-amber-500/20 rounded-xl p-4 text-center">
            <Flame className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-lg font-bold">{auctions.filter(a => { const h = (new Date(a.ends_at).getTime() - Date.now()) / 3600000; return h <= 24 && h > 0; }).length}</div>
            <div className="text-xs text-muted-foreground">Ending Today</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card/80 backdrop-blur-sm border border-amber-500/20 rounded-xl p-4 text-center">
            <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-lg font-bold">{auctions.length}</div>
            <div className="text-xs text-muted-foreground">Active Auctions</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card/80 backdrop-blur-sm border border-amber-500/20 rounded-xl p-4 text-center">
            <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-lg font-bold">
              {auctions.length > 0 ? `€${(auctions.reduce((s, a) => s + Number(a.current_price), 0) / auctions.length).toFixed(0)}` : "—"}
            </div>
            <div className="text-xs text-muted-foreground">Avg Price</div>
          </motion.div>
        </div>

        {/* AI Tools Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" /> AI Auction Tools
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {aiTools.map((tool, i) => (
              <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card
                  className="cursor-pointer hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 border-amber-500/20 hover:border-amber-400/40 bg-card/80 backdrop-blur-sm group"
                  onClick={() => setActiveView(tool.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <tool.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-xs sm:text-sm">{tool.label}</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">{tool.desc}</p>
                    <Badge variant="outline" className="mt-2 text-[10px] border-amber-500/30 text-amber-500">{tool.credits} CR</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Create Auction Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            {limits.auctionListingsPerMonth !== -1 && (
              <Alert className="max-w-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Limit: {limits.auctionListingsPerMonth} auctions/month • Commission: {limits.commissionRate}%
                  {limits.tier === 'basic' && <Link to="/subscription" className="ml-2 text-primary hover:underline">Upgrade</Link>}
                </AlertDescription>
              </Alert>
            )}
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500">
                <Plus className="mr-2 h-5 w-5" /> Create Auction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create New Auction</DialogTitle></DialogHeader>
              <SellerConnectGate compact />
              <form onSubmit={handleCreateAuction} className="space-y-4">
                <div><Label htmlFor="title">Title</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                <div><Label htmlFor="description">Description</Label><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Starting Price (€)</Label><Input type="number" step="0.01" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} required /></div>
                  <div><Label>Buy Now (€)</Label><Input type="number" step="0.01" value={buyoutPrice} onChange={(e) => setBuyoutPrice(e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem><SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem><SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="books">Books</SelectItem><SelectItem value="toys">Toys</SelectItem>
                        <SelectItem value="automotive">Automotive</SelectItem><SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Condition</Label>
                    <Select value={condition} onValueChange={setCondition}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem><SelectItem value="used">Used</SelectItem><SelectItem value="damaged">Damaged</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Duration</Label>
                  <Select value={duration} onValueChange={setDuration}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 hours</SelectItem><SelectItem value="48">48 hours</SelectItem>
                      <SelectItem value="72">3 days</SelectItem><SelectItem value="168">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Images (max 3)</Label>
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                          <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeImage(index)}><X className="h-3 w-3" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {imagePreviews.length < 3 && (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Upload ({imagePreviews.length}/3)</p>
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageSelect} />
                    </label>
                  )}
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-yellow-600" disabled={uploading}>
                  {uploading ? "Creating..." : "Create Auction"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Auctions Grid */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="ending">Ending Soon</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
          </TabsList>

          {["all", "ending", "new"].map(tab => (
            <TabsContent key={tab} value={tab} className="mt-6">
              {loading ? (
                <div className="text-center py-12">Loading auctions...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(tab === "all" ? auctions : tab === "ending" ? auctions.filter(a => { const h = (new Date(a.ends_at).getTime() - Date.now()) / 3600000; return h <= 24 && h > 0; }) : auctions.slice(0, 6))
                    .map((auction) => (
                    <motion.div key={auction.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer border-amber-500/10 bg-card/80 backdrop-blur-sm"
                        onClick={() => handleShowDetail(auction)}>
                        <CardHeader>
                          <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4 overflow-hidden">
                            {auction.image_url ? <img src={auction.image_url} alt={auction.title} className="w-full h-full object-cover" /> : <Upload className="h-12 w-12 text-muted-foreground" />}
                          </div>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{auction.title}</CardTitle>
                            <Badge variant="outline" className="border-amber-500/30 text-amber-500">{auction.category}</Badge>
                          </div>
                          <CardDescription className="line-clamp-2">{auction.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Current Price:</span>
                            <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">€{Number(auction.current_price).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Remaining:</span>
                            <span className="text-sm font-semibold">{getTimeRemaining(auction.ends_at)}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {user?.id === auction.user_id ? (
                            <Button variant="destructive" className="flex-1" onClick={() => handleDeleteAuction(auction.id)}>Delete</Button>
                          ) : (
                            <>
                              <Button className="flex-1 bg-gradient-to-r from-amber-600 to-yellow-600" onClick={() => handleBid(auction)}>
                                <Gavel className="mr-2 h-4 w-4" /> Bid
                              </Button>
                              {auction.buyout_price && (
                                <Button variant="outline" className="flex-1 border-amber-500/30" onClick={() => handleBuyout(auction)}>
                                  Buy €{Number(auction.buyout_price).toFixed(2)}
                                </Button>
                              )}
                            </>
                          )}
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                  {((tab === "all" && auctions.length === 0) || (tab === "ending" && auctions.filter(a => { const h = (new Date(a.ends_at).getTime() - Date.now()) / 3600000; return h <= 24 && h > 0; }).length === 0)) && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">No auctions found</div>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Tips Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-12 mb-8">
          <Card className="border-amber-500/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="w-5 h-5 text-amber-400" /> Tips for Auction Success
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-amber-400">For Sellers</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Use clear, well-lit photos from multiple angles</li>
                    <li>• Write detailed descriptions with honest condition info</li>
                    <li>• Set competitive starting prices to attract bidders</li>
                    <li>• End auctions during peak hours (evenings work best)</li>
                    <li>• Use AI Listing Optimizer for professional descriptions</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-amber-400">For Buyers</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Set a maximum budget before bidding</li>
                    <li>• Use AI Bid Strategy for optimal timing</li>
                    <li>• Check item photos and description carefully</li>
                    <li>• Consider Buy Now for items you really want</li>
                    <li>• Watch "Ending Soon" tab for last-minute deals</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bid Dialog */}
        <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Place Bid</DialogTitle></DialogHeader>
            {selectedAuction && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Auction: <strong>{selectedAuction.title}</strong></p>
                  <p className="text-sm text-muted-foreground">Current: <strong className="text-amber-400">€{Number(selectedAuction.current_price).toFixed(2)}</strong></p>
                </div>
                <div>
                  <Label>Your Bid (€)</Label>
                  <Input type="number" step="0.01" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Min €${(Number(selectedAuction.current_price) + 0.01).toFixed(2)}`} />
                </div>
                <Button onClick={submitBid} className="w-full bg-gradient-to-r from-amber-600 to-yellow-600"
                  disabled={!bidAmount || parseFloat(bidAmount) <= Number(selectedAuction.current_price)}>
                  <Gavel className="h-4 w-4 mr-2" /> Place Bid {bidAmount && `€${parseFloat(bidAmount).toFixed(2)}`}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {detailAuction && (
              <>
                <DialogHeader><DialogTitle>{detailAuction.title}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  {auctionPhotos.length > 0 && (
                    <div className="space-y-2">
                      {auctionPhotos.map((photo, i) => (
                        <img key={i} src={photo} alt={`${detailAuction.title} ${i + 1}`}
                          className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => { setLightboxImage(photo); setLightboxOpen(true); }} />
                      ))}
                    </div>
                  )}
                  <div className="space-y-3">
                    <div><h3 className="font-semibold mb-1">Description</h3><p className="text-muted-foreground">{detailAuction.description}</p></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><h4 className="font-semibold text-sm">Current Price</h4><p className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">€{Number(detailAuction.current_price).toFixed(2)}</p></div>
                      {detailAuction.buyout_price && <div><h4 className="font-semibold text-sm">Buy Now</h4><p className="text-2xl font-bold">€{Number(detailAuction.buyout_price).toFixed(2)}</p></div>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><h4 className="font-semibold text-sm">Category</h4><Badge variant="outline" className="border-amber-500/30">{detailAuction.category}</Badge></div>
                      <div><h4 className="font-semibold text-sm">Condition</h4><Badge variant="secondary">{detailAuction.condition}</Badge></div>
                    </div>
                    <div><h4 className="font-semibold text-sm">Time Remaining</h4><p className="text-lg font-semibold text-amber-400">{getTimeRemaining(detailAuction.ends_at)}</p></div>
                  </div>
                  {user?.id !== detailAuction.user_id && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button className="flex-1 bg-gradient-to-r from-amber-600 to-yellow-600" onClick={() => { setDetailDialogOpen(false); handleBid(detailAuction); }}>
                        <Gavel className="mr-2 h-4 w-4" /> Place Bid
                      </Button>
                      {detailAuction.buyout_price && (
                        <Button variant="outline" className="flex-1 border-amber-500/30" onClick={() => { setDetailDialogOpen(false); handleBuyout(detailAuction); }}>
                          Buy €{Number(detailAuction.buyout_price).toFixed(2)}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-5xl w-full p-0 bg-black/95 border-0">
            <div className="relative w-full h-[90vh] flex items-center justify-center">
              <img src={lightboxImage} alt="Enlarged view" className="max-w-full max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Auction;
