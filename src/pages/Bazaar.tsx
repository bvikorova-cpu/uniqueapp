import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, MapPin, Clock, User, MessageCircle, Upload, X, Trash2, Crown, AlertCircle, ShoppingCart, Package, DollarSign, Wand2, Target, Shield, Check, Flame, BarChart3, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubscription } from "@/hooks/useSubscription";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import MyBazaarOrders from "@/components/bazaar/MyBazaarOrders";
import BazaarPurchaseDialog from "@/components/bazaar/BazaarPurchaseDialog";
import { BazaarHero } from "@/components/bazaar/BazaarHero";
import { MarketplaceToolCard } from "@/components/marketplace/MarketplaceToolCard";
import { PriceEstimatorView } from "@/components/bazaar/views/PriceEstimatorView";
import { ListingOptimizerView } from "@/components/bazaar/views/ListingOptimizerView";
import { BuyerMatchView } from "@/components/bazaar/views/BuyerMatchView";
import { FraudDetectorView } from "@/components/bazaar/views/FraudDetectorView";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { SEO } from "@/components/SEO";
import { BazaarFilters, defaultFilters, type BazaarFilterState } from "@/components/bazaar/BazaarFilters";
import { BazaarPhotoUploader, type PendingPhoto } from "@/components/bazaar/BazaarPhotoUploader";
import { BazaarPhotoGallery } from "@/components/bazaar/BazaarPhotoGallery";
import { BazaarItemChat } from "@/components/bazaar/BazaarItemChat";
import { SellerRatingBadge } from "@/components/bazaar/SellerRatingBadge";
import { useBazaarFavorites } from "@/hooks/useBazaarFavorites";
import { Heart } from "lucide-react";
import { PromoteListingDialog } from "@/components/bazaar/PromoteListingDialog";
import { VerifiedSellerBadge } from "@/components/bazaar/VerifiedSellerBadge";
import { ReportListingDialog } from "@/components/bazaar/ReportListingDialog";
import { RequestVerificationCard } from "@/components/bazaar/RequestVerificationCard";
import { PriceAlertDialog } from "@/components/marketplace/PriceAlertDialog";
import { SellerReviewsPanel } from "@/components/marketplace/SellerReviewsPanel";
import { Flag, Loader2 } from "lucide-react";
import { VerifiedSellersProvider } from "@/components/bazaar/VerifiedSellersContext";
import { SellerConnectGate } from "@/components/commerce/SellerConnectGate";

interface BazaarItem {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  category: string;
  condition: string;
  listing_type: string;
  image_url: string | null;
  image_urls: string[] | null;
  created_at: string;
  user_id: string;
  is_sold: boolean;
  bumped_until?: string | null;
  top_until?: string | null;
  brand?: string | null;
  size?: string | null;
  shipping_method?: string | null;
  shipping_price?: number | null;
  profiles?: { full_name: string | null } | null;
}

const aiTools = [
  {
    id: "price-estimator",
    title: "AI Price Estimator",
    description: "Get fair market value for any item with detailed price analysis",
    icon: DollarSign,
    badge: "3 CR",
    gradient: "bg-gradient-to-r from-amber-500 to-orange-600",
    features: ["Fair market value range", "Price comparison analysis", "Quick sale vs premium pricing"],
  },
  {
    id: "listing-optimizer",
    title: "AI Listing Optimizer",
    description: "Rewrite your listing for maximum engagement and conversions",
    icon: Wand2,
    badge: "3 CR",
    gradient: "bg-gradient-to-r from-orange-500 to-red-500",
    features: ["SEO-optimized titles", "Compelling descriptions", "Photo & urgency tips"],
  },
  {
    id: "buyer-match",
    title: "AI Buyer Match",
    description: "Find ideal buyers based on item category and market data",
    icon: Target,
    badge: "4 CR",
    gradient: "bg-gradient-to-r from-yellow-500 to-amber-600",
    features: ["Buyer persona profiles", "Target demographics", "Marketing angles"],
  },
  {
    id: "fraud-detector",
    title: "AI Fraud Detector",
    description: "Verify listing authenticity and spot potential scams",
    icon: Shield,
    badge: "4 CR",
    gradient: "bg-gradient-to-r from-emerald-500 to-teal-600",
    features: ["Trust score 0-100", "Red flag detection", "Verification checklist"],
  },
];

const Bazaar = () => {
  const [activeView, setActiveView] = useState<string | null>(null);
  const [filters, setFilters] = useState<BazaarFilterState>(defaultFilters);
  const searchTerm = filters.searchTerm;
  const selectedCategory = filters.category;
  const setSearchTerm = (v: string) => setFilters((f) => ({ ...f, searchTerm: v }));
  const setSelectedCategory = (v: string) => setFilters((f) => ({ ...f, category: v }));
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isOrdersDialogOpen, setIsOrdersDialogOpen] = useState(false);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState<BazaarItem | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [items, setItems] = useState<BazaarItem[]>([]);
  const [formData, setFormData] = useState({
    title: "", price: "", location: "", description: "",
    category: "electronics", condition: "Like New", listing_type: "sell",
    brand: "", size: "", shipping_method: "personal", shipping_price: "0",
  });
  const { toast } = useToast();
  const { limits, canCreateListing, calculateCommission } = useSubscription();
  const { isFavorite, toggle: toggleFavorite, ids: favoriteIds } = useBazaarFavorites(currentUserId);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [promoteItem, setPromoteItem] = useState<BazaarItem | null>(null);
  const [reportItem, setReportItem] = useState<BazaarItem | null>(null);
  // Pagination state — scale-ready (billions of rows; never fetch all).
  const PAGE_SIZE = 48;
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadItems();
    checkCurrentUser();
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');
    const orderId = urlParams.get('order_id');
    const transactionId = urlParams.get('transaction_id');

    if (paymentStatus === 'success' && sessionId && orderId) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { error } = await supabase.functions.invoke('verify-bazaar-order-payment', {
          body: { sessionId, orderId },
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
        });
        if (error) throw error;
        toast({ title: "Order confirmed! 🎉", description: "Your order has been placed. The seller will ship it soon." });
        window.history.replaceState({}, '', window.location.pathname);
        loadItems();
      } catch (error) {
        console.error('Error verifying order payment:', error);
        toast({ title: "Error", description: "Failed to verify payment. Please contact support.", variant: "destructive" });
      }
    } else if (paymentStatus === 'success' && sessionId && transactionId) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { error } = await supabase.functions.invoke('verify-bazaar-payment', {
          body: { sessionId, transactionId },
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
        });
        if (error) throw error;
        toast({ title: "Payment successful! 🎉", description: "Your purchase was processed successfully." });
        window.history.replaceState({}, '', window.location.pathname);
        loadItems();
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast({ title: "Error", description: "Failed to verify payment. Please contact support.", variant: "destructive" });
      }
    } else if (paymentStatus === 'cancelled') {
      toast({ title: "Payment cancelled", description: "The payment was cancelled.", variant: "destructive" });
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const [stripeConnectReady, setStripeConnectReady] = useState<boolean | null>(null);

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
    if (user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_connect_account_id, stripe_connect_charges_enabled, stripe_connect_payouts_enabled')
        .eq('id', user.id)
        .maybeSingle();
      setStripeConnectReady(
        !!(profile?.stripe_connect_account_id && profile?.stripe_connect_charges_enabled && profile?.stripe_connect_payouts_enabled)
      );
    }
  };

  const loadItems = async (reset = true) => {
    if (reset) setInitialLoading(true); else setLoadingMore(true);
    try {
      const targetPage = reset ? 0 : page + 1;
      const from = targetPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from('bazaar_items')
        .select('*, profiles(full_name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) {
        console.error('Error loading items:', error);
        toast({ title: "Failed to load listings", description: "Please check your connection and try again.", variant: "destructive" });
        return;
      }
      const rows = (data ?? []) as BazaarItem[];
      setItems(reset ? rows : [...items, ...rows]);
      setPage(targetPage);
      setHasMore(rows.length === PAGE_SIZE);
    } finally {
      if (reset) setInitialLoading(false); else setLoadingMore(false);
    }
  };

  // (multi-photo handling lives in BazaarPhotoUploader)


  const categories = [
    { id: "all", name: "All" }, { id: "electronics", name: "Electronics" },
    { id: "clothing", name: "Clothing" }, { id: "home", name: "Home & Garden" },
    { id: "sports", name: "Sports" }, { id: "books", name: "Books" }, { id: "other", name: "Other" },
  ];

  const conditions = ["Like New", "Very Good", "Good", "Used"];
  const listingTypes = [{ id: "sell", name: "Sell" }, { id: "buy", name: "Buy" }];

  const filteredItems = items
    .filter((item) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        item.title.toLowerCase().includes(term) ||
        (item.description ?? "").toLowerCase().includes(term);
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesCondition = filters.condition === "all" || item.condition === filters.condition;
      const min = filters.minPrice ? Number(filters.minPrice) : null;
      const max = filters.maxPrice ? Number(filters.maxPrice) : null;
      const matchesMin = min == null || Number(item.price) >= min;
      const matchesMax = max == null || Number(item.price) <= max;
      const matchesLocation =
        !filters.location || item.location.toLowerCase().includes(filters.location.toLowerCase());
      const matchesFavorite = !showOnlyFavorites || favoriteIds.has(item.id);
      const matchesBrand = !filters.brand || (item.brand ?? "").toLowerCase().includes(filters.brand.toLowerCase());
      const matchesSize = filters.size === "all" || (item.size ?? "") === filters.size;
      const matchesShipping = filters.shippingMethod === "all" || (item.shipping_method ?? "personal") === filters.shippingMethod;
      return matchesSearch && matchesCategory && matchesCondition && matchesMin && matchesMax && matchesLocation && matchesFavorite && matchesBrand && matchesSize && matchesShipping;
    })
    .sort((a, b) => {
      // Promoted listings always float to the top, regardless of sort.
      const now = Date.now();
      const aTop = a.top_until && new Date(a.top_until).getTime() > now ? 2 : 0;
      const bTop = b.top_until && new Date(b.top_until).getTime() > now ? 2 : 0;
      const aBump = a.bumped_until && new Date(a.bumped_until).getTime() > now ? 1 : 0;
      const bBump = b.bumped_until && new Date(b.bumped_until).getTime() > now ? 1 : 0;
      const promoDiff = (bTop + bBump) - (aTop + aBump);
      if (promoDiff !== 0) return promoDiff;
      switch (filters.sort) {
        case "price_asc":
          return Number(a.price) - Number(b.price);
        case "price_desc":
          return Number(b.price) - Number(a.price);
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getTimeAgo = (dateString: string) => {
    const diffInMs = new Date().getTime() - new Date(dateString).getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.location) {
      toast({ title: "Error", description: "Fill in all required fields", variant: "destructive" });
      return;
    }
    const canCreate = await canCreateListing('bazaar');
    if (!canCreate) {
      toast({ title: "Limit reached", description: `You have reached the limit of ${limits.bazaarListingsPerMonth} listings/month. Upgrade for more.`, variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Error", description: "You must be logged in", variant: "destructive" }); setUploading(false); return; }

      // Upload all photos to bazaar_images bucket
      const uploadedUrls: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i].file;
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}-${i}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('bazaar_images').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('bazaar_images').getPublicUrl(fileName);
        uploadedUrls.push(publicUrl);
      }
      const coverUrl = uploadedUrls[0] ?? null;

      const price = parseFloat(formData.price);
      const commission = calculateCommission(price);
      const { error: insertError } = await supabase.from('bazaar_items').insert({
        user_id: user.id, title: formData.title, price, location: formData.location,
        description: formData.description, category: formData.category,
        condition: formData.condition, listing_type: formData.listing_type,
        image_url: coverUrl, image_urls: uploadedUrls,
        brand: formData.brand || null,
        size: formData.size || null,
        shipping_method: formData.shipping_method,
        shipping_price: formData.shipping_price ? Number(formData.shipping_price) : 0,
      });
      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: commission > 0 ? `Listing added. On sale, a ${limits.commissionRate}% commission (€${commission.toFixed(2)}) will be charged` : "Listing added without commission",
      });
      setFormData({ title: "", price: "", location: "", description: "", category: "electronics", condition: "Like New", listing_type: "sell", brand: "", size: "", shipping_method: "personal", shipping_price: "0" });
      photos.forEach((p) => URL.revokeObjectURL(p.preview));
      setPhotos([]); setIsDialogOpen(false); loadItems();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Failed to add listing", variant: "destructive" });
    } finally { setUploading(false); }
  };

  const handleContact = (item: BazaarItem) => {
    if (!currentUserId) { toast({ title: "Error", description: "You must be logged in", variant: "destructive" }); return; }
    if (currentUserId === item.user_id) { toast({ title: "Warning", description: "You cannot contact yourself", variant: "destructive" }); return; }
    setSelectedItem(item); setIsContactDialogOpen(true);
  };

  const openDetail = (item: BazaarItem) => { setSelectedItem(item); setIsDetailOpen(true); };
  const handleDeleteClick = () => setIsDeleteDialogOpen(true);

  const handleSendMessage = async () => {
    if (sendingMessage) return;
    if (!selectedItem || !currentUserId || !contactMessage.trim()) {
      toast({ title: "Error", description: "Fill in message", variant: "destructive" }); return;
    }
    setSendingMessage(true);
    try {
      const { error } = await supabase.from('bazaar_messages').insert({
        item_id: selectedItem.id, sender_id: currentUserId, receiver_id: selectedItem.user_id, message: contactMessage,
      });
      if (error) throw error;
      toast({ title: "Success", description: "Message sent to seller" });
      setContactMessage(""); setIsContactDialogOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleting || !selectedItem) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('bazaar_items').delete().eq('id', selectedItem.id);
      if (error) throw error;
      toast({ title: "Success", description: "Listing deleted" });
      setIsDeleteDialogOpen(false); setIsDetailOpen(false); loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({ title: "Error", description: "Failed to delete listing", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleBuyItem = () => {
    if (!selectedItem || !currentUserId) { toast({ title: "Error", description: "You must be logged in to purchase items.", variant: "destructive" }); return; }
    if (selectedItem.is_sold) { toast({ title: "Already sold", description: "This item has already been sold.", variant: "destructive" }); return; }
    if (selectedItem.user_id === currentUserId) { toast({ title: "Error", description: "You cannot buy your own item.", variant: "destructive" }); return; }
    setIsDetailOpen(false); setIsPurchaseDialogOpen(true);
  };

  // AI Tool View Routing
  if (activeView === "price-estimator") return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12"><div className="container mx-auto px-3 sm:px-4 max-w-7xl"><PriceEstimatorView onBack={() => setActiveView(null)} /></div></div>;
  if (activeView === "listing-optimizer") return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12"><div className="container mx-auto px-3 sm:px-4 max-w-7xl"><ListingOptimizerView onBack={() => setActiveView(null)} /></div></div>;
  if (activeView === "buyer-match") return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12"><div className="container mx-auto px-3 sm:px-4 max-w-7xl"><BuyerMatchView onBack={() => setActiveView(null)} /></div></div>;
  if (activeView === "fraud-detector") return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12"><div className="container mx-auto px-3 sm:px-4 max-w-7xl"><FraudDetectorView onBack={() => setActiveView(null)} /></div></div>;

  return (
    <>
      <SEO
        title="Bazaar - Buy & sell with smart AI tools"
        description="List items, set the right price with AI estimator, and find buyers fast. Unique Bazaar — your community marketplace."
        canonical="/bazaar"
      />
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        {/* Cinematic Hero */}
        <BazaarHero itemCount={items.length} />

        <HeroRewardedAd sectionKey="page_bazaar" />

        {/* 3-Column Engagement Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card/80 backdrop-blur-xl border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Selling Streak</p>
                  <p className="font-black text-lg">🔥 Active</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-card/80 backdrop-blur-xl border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Top Categories</p>
                  <p className="font-black text-lg">Electronics · Clothing</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-card/80 backdrop-blur-xl border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Platform Benefits</p>
                  <p className="font-black text-lg">Secure Escrow · 10% Fee</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* AI Tools Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
          <h2 className="text-xl font-black mb-4">🤖 AI-Powered Bazaar Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiTools.map((tool, i) => (
              <MarketplaceToolCard key={tool.id} tool={tool} onSelect={() => setActiveView(tool.id)} index={i} />
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-lg font-bold mb-4">How It Works</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-primary">For Sellers</h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">1.</span><span><strong>Create a Listing:</strong> Upload photos, write a description, set your price in EUR (€). Price must include shipping.</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">2.</span><span><strong>Receive Orders:</strong> Get notified with shipping address and buyer notes.</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">3.</span><span><strong>Ship the Item:</strong> Package and ship. Click "Mark as Shipped" to update status.</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">4.</span><span><strong>Get Paid:</strong> Payout after buyer confirms delivery (minus 10% commission).</span></li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-primary">For Buyers</h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">1.</span><span><strong>Browse & Search:</strong> Filter by category, search by keywords.</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">2.</span><span><strong>Contact or Buy:</strong> Message seller or click "Buy Now". Price includes shipping.</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">3.</span><span><strong>Secure Payment:</strong> Pay via Stripe. Payment held until delivery confirmed.</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">4.</span><span><strong>Confirm Delivery:</strong> Click "Confirm Received" to complete the transaction.</span></li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border/50">
                <strong>Note:</strong> All prices include shipping. 10% commission deducted from seller payout. Use built-in chat for questions.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {limits.bazaarListingsPerMonth !== -1 && (
            <Alert className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Limit: {limits.bazaarListingsPerMonth} listings/month • Platform fee: 10%
                {limits.tier === 'basic' && <Link to="/subscription" className="ml-2 text-primary hover:underline">Upgrade</Link>}
              </AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2 w-full sm:w-auto">
            {currentUserId && (
              <Button variant="outline" size="lg" onClick={() => setIsOrdersDialogOpen(true)}>
                <Package className="h-5 w-5 mr-2" />My Orders
              </Button>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="lg"><Plus className="h-5 w-5 mr-2" />Add Listing</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>New Listing</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <SellerConnectGate compact />

                  <div>
                    <label className="text-sm font-medium mb-2 block">Listing Type</label>
                    <Select value={formData.listing_type} onValueChange={(v) => setFormData({ ...formData, listing_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{listingTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Input placeholder="Product Name" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                  <Input placeholder="Price (€)" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                  <Input placeholder="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                  <Textarea placeholder="Product description..." className="min-h-20" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{categories.filter(c => c.id !== "all").map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Condition</label>
                    <Select value={formData.condition} onValueChange={(v) => setFormData({ ...formData, condition: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{conditions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  {formData.category === "clothing" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Brand (e.g. Nike)" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                      <Input placeholder="Size (e.g. M, 42)" value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} />
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Shipping method</label>
                    <Select value={formData.shipping_method} onValueChange={(v) => setFormData({ ...formData, shipping_method: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal pickup</SelectItem>
                        <SelectItem value="post">Post</SelectItem>
                        <SelectItem value="packeta">Packeta / Z-Box</SelectItem>
                        <SelectItem value="courier">Courier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.shipping_method !== "personal" && (
                    <Input
                      placeholder="Shipping price (€) — included or extra"
                      type="number"
                      value={formData.shipping_price}
                      onChange={e => setFormData({ ...formData, shipping_price: e.target.value })}
                    />
                  )}
                  <BazaarPhotoUploader photos={photos} onChange={setPhotos} max={8} maxSizeMb={5} />
                  <Button variant="hero" className="w-full" disabled={uploading} onClick={handleSubmit}>
                    {uploading ? "Uploading..." : "Publish Listing"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Seller verification CTA */}
        {currentUserId && (
          <div className="mb-6">
            <RequestVerificationCard userId={currentUserId} />
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search in bazaar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <BazaarFilters
              filters={filters}
              onChange={setFilters}
              conditions={conditions}
              currentUserId={currentUserId}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>


        {/* Trust Banner */}
        <Card className="mb-8 bg-gradient-secondary border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="space-y-1 mb-3 md:mb-0">
                <h3 className="text-lg font-bold">🛡️ Secure Shopping Guaranteed</h3>
                <p className="text-sm text-muted-foreground">All sellers are verified members · Escrow payment protection</p>
              </div>
              <Badge className="bg-success text-success-foreground">✓ Verified Profiles</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Favorites toggle */}
        {currentUserId && (
          <div className="flex justify-end mb-4">
            <Button
              type="button"
              variant={showOnlyFavorites ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlyFavorites((v) => !v)}
              className="gap-2"
            >
              <Heart className={`h-4 w-4 ${showOnlyFavorites ? "fill-current" : ""}`} />
              {showOnlyFavorites ? "Showing favorites" : "Show favorites only"}
              {favoriteIds.size > 0 && <Badge variant="secondary" className="ml-1">{favoriteIds.size}</Badge>}
            </Button>
          </div>
        )}

        {/* Items Grid (batched seller-verification fetch eliminates N+1) */}
        <VerifiedSellersProvider sellerIds={filteredItems.map((it) => it.user_id)}>
          {initialLoading && items.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredItems.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.04, duration: 0.3 }}>
                  <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card/80 backdrop-blur-xl border-border/50">
                    <CardHeader className="p-0">
                      <div className="relative">
                        <img
                          src={(item.image_urls && item.image_urls[0]) || item.image_url || "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=300&h=300&fit=crop"}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        {item.image_urls && item.image_urls.length > 1 && (
                          <Badge className="absolute bottom-2 right-2 bg-background/90 text-foreground text-[10px]">
                            📷 {item.image_urls.length}
                          </Badge>
                        )}
                        <Badge className="absolute top-2 left-2 bg-background/90 text-foreground text-[10px]">{item.condition}</Badge>
                        <Badge className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-[10px]">
                          {listingTypes.find(t => t.id === item.listing_type)?.name}
                        </Badge>
                        {item.top_until && new Date(item.top_until).getTime() > Date.now() && (
                          <Badge className="absolute top-9 left-2 bg-yellow-500 text-black text-[10px] gap-1">
                            <Crown className="h-3 w-3" /> TOP
                          </Badge>
                        )}
                        {!(item.top_until && new Date(item.top_until).getTime() > Date.now()) &&
                          item.bumped_until && new Date(item.bumped_until).getTime() > Date.now() && (
                            <Badge className="absolute top-9 left-2 bg-orange-500 text-white text-[10px] gap-1">
                              <Flame className="h-3 w-3" /> Bumped
                            </Badge>
                          )}
                        {currentUserId && currentUserId !== item.user_id && (
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="absolute bottom-2 left-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                            aria-label={isFavorite(item.id) ? "Remove favorite" : "Add favorite"}
                          >
                            <Heart className={`h-4 w-4 ${isFavorite(item.id) ? "fill-red-500 text-red-500" : ""}`} />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2 cursor-pointer" onClick={() => openDetail(item)}>
                        {item.title}
                      </h3>
                      <div className="text-xl font-black text-success mb-2">€{item.price}</div>
                      <div className="space-y-1 mb-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</div>
                        <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{getTimeAgo(item.created_at)}</div>
                        <div className="flex items-center gap-1"><User className="h-3 w-3" />{item.profiles?.full_name || "Anonymous"}<VerifiedSellerBadge sellerId={item.user_id} /></div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                      {currentUserId === item.user_id && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="w-full gap-2"
                          onClick={(e) => { e.stopPropagation(); setPromoteItem(item); }}
                        >
                          <Flame className="h-3.5 w-3.5" /> Promote
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </VerifiedSellersProvider>

        {!initialLoading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No listings found</p>
            <Button variant="outline" onClick={() => setFilters(defaultFilters)} className="mt-4">Clear filters</Button>
          </div>
        )}

        {hasMore && items.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              size="lg"
              disabled={loadingMore}
              onClick={() => loadItems(false)}
              className="gap-2"
            >
              {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
              {loadingMore ? "Loading…" : "Load more listings"}
            </Button>
          </div>
        )}


        {/* Footer Info */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center bg-card/80 backdrop-blur-xl border-border/50">
            <CardContent className="p-5">
              <h3 className="font-bold mb-1">🔒 Security</h3>
              <p className="text-xs text-muted-foreground">All transactions protected by escrow system</p>
            </CardContent>
          </Card>
          <Card className="text-center bg-card/80 backdrop-blur-xl border-border/50">
            <CardContent className="p-5">
              <h3 className="font-bold mb-1">⚡ Fast Delivery</h3>
              <p className="text-xs text-muted-foreground">Local sellers for quick pickup & shipping</p>
            </CardContent>
          </Card>
          <Card className="text-center bg-card/80 backdrop-blur-xl border-border/50">
            <CardContent className="p-5">
              <h3 className="font-bold mb-1">💬 Support</h3>
              <p className="text-xs text-muted-foreground">24/7 support for all community members</p>
            </CardContent>
          </Card>
        </div>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{selectedItem?.title}</DialogTitle></DialogHeader>
            {selectedItem && (
              <div className="space-y-6">
                <BazaarPhotoGallery
                  images={
                    selectedItem.image_urls && selectedItem.image_urls.length > 0
                      ? selectedItem.image_urls
                      : selectedItem.image_url
                        ? [selectedItem.image_url]
                        : []
                  }
                  alt={selectedItem.title}
                />

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={selectedItem.listing_type === 'sell' ? 'default' : 'secondary'}>{listingTypes.find(t => t.id === selectedItem.listing_type)?.name}</Badge>
                      <Badge>{selectedItem.condition}</Badge>
                    </div>
                    <div className="text-3xl font-bold text-success">€{selectedItem.price}</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{selectedItem.location}</span></div>
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span>{getTimeAgo(selectedItem.created_at)}</span></div>
                    <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span>{selectedItem.profiles?.full_name || "Anonymous user"}</span><VerifiedSellerBadge sellerId={selectedItem.user_id} showPending /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><h4 className="font-semibold mb-1">Category</h4><p className="text-muted-foreground">{categories.find(c => c.id === selectedItem.category)?.name}</p></div>
                    {selectedItem.brand && <div><h4 className="font-semibold mb-1">Brand</h4><p className="text-muted-foreground">{selectedItem.brand}</p></div>}
                    {selectedItem.size && <div><h4 className="font-semibold mb-1">Size</h4><p className="text-muted-foreground">{selectedItem.size}</p></div>}
                    <div>
                      <h4 className="font-semibold mb-1">Shipping</h4>
                      <p className="text-muted-foreground capitalize">
                        {(selectedItem.shipping_method || "personal").replace("_", " ")}
                        {selectedItem.shipping_price && Number(selectedItem.shipping_price) > 0 ? ` · +€${Number(selectedItem.shipping_price).toFixed(2)}` : selectedItem.shipping_method === "personal" ? "" : " · Free"}
                      </p>
                    </div>
                  </div>
                  {selectedItem.description && <div><h4 className="font-semibold mb-2">Description</h4><p className="text-muted-foreground whitespace-pre-wrap">{selectedItem.description}</p></div>}
                  {selectedItem.listing_type === 'sell' && limits.commissionRate > 0 && currentUserId !== selectedItem.user_id && (
                    <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>
                      Platform commission: {limits.commissionRate}% (€{calculateCommission(selectedItem.price).toFixed(2)})
                      <br /><Link to="/subscription" className="text-primary hover:underline text-sm">Upgrade to Premium = 0% commission</Link>
                    </AlertDescription></Alert>
                  )}
                  <div className="flex gap-2">
                    {currentUserId !== selectedItem.user_id && selectedItem.listing_type === 'sell' && (
                      <Button className="flex-1" size="lg" onClick={handleBuyItem}><ShoppingCart className="h-5 w-5 mr-2" />Buy Now</Button>
                    )}
                    <Button className="flex-1" size="lg" variant="outline" onClick={() => handleContact(selectedItem)}><MessageCircle className="h-5 w-5 mr-2" />Contact</Button>
                    {currentUserId === selectedItem.user_id && (
                      <Button variant="destructive" size="lg" onClick={handleDeleteClick}><Trash2 className="h-5 w-5" /></Button>
                    )}
                    {currentUserId && currentUserId !== selectedItem.user_id && (
                      <Button variant="outline" size="lg" onClick={() => setReportItem(selectedItem)} title="Report listing">
                        <Flag className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                  {currentUserId !== selectedItem.user_id && selectedItem.listing_type === 'sell' && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <PriceAlertDialog productId={selectedItem.id} currentPriceCents={Math.round(Number(selectedItem.price) * 100)} />
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <SellerReviewsPanel sellerId={selectedItem.user_id} />
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete listing?</AlertDialogTitle>
              <AlertDialogDescription>This action is irreversible. The listing will be permanently deleted.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Contact Seller (realtime chat thread) */}
        <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between gap-2">
                <span className="truncate">Chat: {selectedItem?.title}</span>
                {selectedItem && <SellerRatingBadge sellerId={selectedItem.user_id} />}
              </DialogTitle>
            </DialogHeader>
            {selectedItem && currentUserId && (
              <BazaarItemChat itemId={selectedItem.id} sellerId={selectedItem.user_id} currentUserId={currentUserId} />
            )}
          </DialogContent>
        </Dialog>

        {/* My Orders */}
        <Dialog open={isOrdersDialogOpen} onOpenChange={setIsOrdersDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>My Orders</DialogTitle></DialogHeader>
            {currentUserId && <MyBazaarOrders userId={currentUserId} />}
          </DialogContent>
        </Dialog>

        {/* Purchase */}
        <BazaarPurchaseDialog item={selectedItem} open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen} />

        {promoteItem && (
          <PromoteListingDialog
            open={!!promoteItem}
            onOpenChange={(v) => !v && setPromoteItem(null)}
            itemId={promoteItem.id}
            itemTitle={promoteItem.title}
            onPromoted={loadItems}
          />
        )}

        {reportItem && currentUserId && (
          <ReportListingDialog
            open={!!reportItem}
            onOpenChange={(v) => !v && setReportItem(null)}
            itemId={reportItem.id}
            itemTitle={reportItem.title}
            reporterId={currentUserId}
          />
        )}
      </div>
    </div>
    </>
  );
};

export default Bazaar;
