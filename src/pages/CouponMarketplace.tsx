import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Tag, Clock, User, MessageCircle, Upload, X, Trash2, Ticket, Store, Percent, Calendar, Gift, Sparkles, Shield, Zap, Star, Crown, Package, DollarSign, ShieldAlert, Target, Wand2, Flame, BarChart3, Award, Check, Bell, Building2, TrendingUp, MessageSquare, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { CouponHero } from "@/components/coupon/CouponHero";
import { MarketplaceToolCard } from "@/components/marketplace/MarketplaceToolCard";
import { CouponValuatorView } from "@/components/coupon/views/CouponValuatorView";
import { FraudScannerView } from "@/components/coupon/views/FraudScannerView";
import { DealMatcherView } from "@/components/coupon/views/DealMatcherView";
import { ListingWriterView } from "@/components/coupon/views/ListingWriterView";
import { ExpiryAlertView } from "@/components/coupon/views/ExpiryAlertView";
import { BundleBuilderView } from "@/components/coupon/views/BundleBuilderView";
import { StoreReputationView } from "@/components/coupon/views/StoreReputationView";
import { PriceHistoryView } from "@/components/coupon/views/PriceHistoryView";
import { NegotiationBotView } from "@/components/coupon/views/NegotiationBotView";
import { WishlistAlertsView } from "@/components/coupon/views/WishlistAlertsView";
import { BuyerOrderCard } from "@/components/coupon/BuyerOrderCard";
import { Checkbox } from "@/components/ui/checkbox";
import { useCouponWishlist } from "@/hooks/useCouponWishlist";
import { CouponEngagementPanel } from "@/components/coupon/CouponEngagementPanel";
import { CouponVerifyButtons } from "@/components/coupon/CouponVerifyButtons";
import { CouponComments } from "@/components/coupon/CouponComments";
import { CouponExpiryHeatmap } from "@/components/coupon/CouponExpiryHeatmap";
import { VerifiedSellerBadge } from "@/components/coupon/VerifiedSellerBadge";
import { CouponVoteWidget } from "@/components/coupon/CouponVoteWidget";
import { DailyDealCountdown } from "@/components/coupon/DailyDealCountdown";
import { TrendingStoresLeaderboard } from "@/components/coupon/TrendingStoresLeaderboard";
import { CouponFilterChips, type CouponFilterChip } from "@/components/coupon/CouponFilterChips";
import { CouponBattleWidget } from "@/components/coupon/CouponBattleWidget";
import { CouponCompareWidget } from "@/components/coupon/CouponCompareWidget";
import { CouponReferralBanner } from "@/components/coupon/CouponReferralBanner";
import { SeasonalHubBanner } from "@/components/coupon/SeasonalHubBanner";
import { CouponScalePanel } from "@/components/coupon/CouponScalePanel";
import { CouponStackingCalculator } from "@/components/coupon/CouponStackingCalculator";
import { CouponReceiptCashback } from "@/components/coupon/CouponReceiptCashback";
import { CouponGeoDeals } from "@/components/coupon/CouponGeoDeals";
import { CouponExtensionTeaser } from "@/components/coupon/CouponExtensionTeaser";
import { CouponApiKeysPanel } from "@/components/coupon/CouponApiKeysPanel";
import { CouponSellerDashboard } from "@/components/coupon/CouponSellerDashboard";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { Link } from "react-router-dom";
import { SellerConnectGate } from "@/components/commerce/SellerConnectGate";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const brandSlug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
interface CouponListing {
  id: string; title: string; description: string | null; store_name: string;
  original_value: number; selling_price: number; discount_code: string | null;
  expiry_date: string | null; category: string; coupon_type: string;
  is_digital: boolean; image_url: string | null; terms_conditions: string | null;
  is_sold: boolean; created_at: string; user_id: string;
  balance_confirmed?: boolean | null;
  tags?: string[] | null;
  profiles?: { full_name: string | null } | null;
}

interface SellerStat { seller_id: string; avg_rating: number; review_count: number; }


interface CouponOrder {
  id: string; coupon_id: string; amount: number; status: string;
  paid_at: string | null; delivered_at: string | null; created_at: string;
  coupon_listings?: CouponListing;
}

const categories = [
  { id: "all", name: "All Coupons", icon: Tag }, { id: "food", name: "Food & Dining", icon: Store },
  { id: "shopping", name: "Shopping", icon: Gift }, { id: "entertainment", name: "Entertainment", icon: Sparkles },
  { id: "travel", name: "Travel", icon: Zap }, { id: "beauty", name: "Beauty & Spa", icon: Star },
  { id: "tech", name: "Tech & Electronics", icon: Package }, { id: "general", name: "General", icon: Ticket },
];

const couponTypes = [
  { id: "discount_code", name: "Discount Code" }, { id: "gift_card", name: "Gift Card" },
  { id: "voucher", name: "Voucher" }, { id: "cashback", name: "Cashback Offer" }, { id: "bogo", name: "Buy One Get One" },
];

const aiTools = [
  { id: "coupon-valuator", title: "AI Coupon Valuator", description: "Get fair market price & expiry risk analysis for any coupon", icon: DollarSign, badge: "3 CR", gradient: "bg-gradient-to-r from-purple-600 to-amber-500", features: ["Fair market value range", "Expiry risk score", "Demand level analysis"] },
  { id: "fraud-scanner", title: "AI Fraud Scanner", description: "Detect fake coupons, expired codes & scam patterns", icon: ShieldAlert, badge: "4 CR", gradient: "bg-gradient-to-r from-red-500 to-orange-600", features: ["Trust score 0-100", "Red flag detection", "Safety recommendation"] },
  { id: "deal-matcher", title: "AI Deal Matcher", description: "Find best deals matching your shopping preferences", icon: Target, badge: "3 CR", gradient: "bg-gradient-to-r from-emerald-500 to-teal-600", features: ["Personalized recommendations", "Savings estimates", "Store rankings"] },
  { id: "listing-writer", title: "AI Listing Writer", description: "Write compelling coupon listing descriptions that sell", icon: Wand2, badge: "3 CR", gradient: "bg-gradient-to-r from-violet-500 to-pink-600", features: ["SEO-optimized titles", "Trust-building copy", "Urgency triggers"] },
  { id: "expiry-alert", title: "AI Expiry Alert System", description: "Smart expiry tracking & usage recommendations before coupons expire", icon: Bell, badge: "3 CR", gradient: "bg-gradient-to-r from-red-500 to-yellow-500", features: ["Expiry priority ranking", "Usage schedules", "Value-at-risk analysis"] },
  { id: "bundle-builder", title: "Coupon Bundle Builder", description: "AI-optimized bundle deals for maximum savings & resale value", icon: Package, badge: "4 CR", gradient: "bg-gradient-to-r from-blue-500 to-cyan-500", features: ["Bundle pricing optimizer", "Cross-sell matching", "Marketing copy"] },
  { id: "store-reputation", title: "Store Reputation Score", description: "AI trust & reliability analysis for any retail store", icon: Building2, badge: "3 CR", gradient: "bg-gradient-to-r from-amber-500 to-orange-600", features: ["Trust score 0-100", "Fraud risk level", "Redemption ease rating"] },
  { id: "price-history", title: "Price History Charts", description: "Market price trends & optimal buy/sell timing analysis", icon: TrendingUp, badge: "3 CR", gradient: "bg-gradient-to-r from-green-500 to-emerald-600", features: ["Seasonal patterns", "Price predictions", "Investment grading"] },
  { id: "negotiation-bot", title: "AI Negotiation Bot", description: "Smart price negotiation strategies & ready-to-use scripts", icon: MessageSquare, badge: "4 CR", gradient: "bg-gradient-to-r from-indigo-500 to-purple-600", features: ["Opening scripts", "Counter-offer strategy", "Psychology tactics"] },
  { id: "wishlist-alerts", title: "Wishlist & Price Drops", description: "Smart tracking & deal alert strategies for your favorite stores", icon: Heart, badge: "3 CR", gradient: "bg-gradient-to-r from-pink-500 to-rose-600", features: ["Price drop patterns", "Smart budget allocation", "Savings projections"] },
];

const CouponMarketplace = () => {
  const [activeView, setActiveView] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState<CouponListing | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<CouponListing[]>([]);
  const [sellerStats, setSellerStats] = useState<Record<string, SellerStat>>({});
  const [myOrders, setMyOrders] = useState<CouponOrder[]>([]);
  const [activeTab, setActiveTab] = useState("browse");
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [activeChips, setActiveChips] = useState<Set<CouponFilterChip>>(new Set());
  const [verifiedSellerIds, setVerifiedSellerIds] = useState<Set<string>>(new Set());
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isPurchasingAccess, setIsPurchasingAccess] = useState(false);
  const [balanceConfirmed, setBalanceConfirmed] = useState(false);
  const [minDiscount, setMinDiscount] = useState<string>("0");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [hideExpired, setHideExpired] = useState(true);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [formData, setFormData] = useState({
    title: "", description: "", store_name: "", original_value: "", selling_price: "",
    discount_code: "", expiry_date: "", category: "general", coupon_type: "discount_code", terms_conditions: "",
  });
  const { toast } = useToast();
  const wishlist = useCouponWishlist(currentUserId);

  useEffect(() => { checkCurrentUser(); checkAccessStatus(); }, []);
  useEffect(() => { if (hasAccess) { loadCoupons(); checkPaymentStatus(); } }, [hasAccess]);
  useEffect(() => { if (currentUserId && activeTab === "my-orders") loadMyOrders(); }, [currentUserId, activeTab]);

  const checkAccessStatus = async () => {
    setIsCheckingAccess(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setHasAccess(false); setIsCheckingAccess(false); return; }
      const urlParams = new URLSearchParams(window.location.search);
      const accessStatus = urlParams.get('access');
      const sessionId = urlParams.get('session_id');
      if (accessStatus === 'success' && sessionId) {
        const { data, error } = await supabase.functions.invoke('coupon-marketplace-access', { body: { action: 'verify', sessionId }, headers: { Authorization: `Bearer ${session.access_token}` } });
        if (!error && data?.hasAccess) { setHasAccess(true); toast({ title: "Welcome! 🎉", description: "You now have access to the Coupon Marketplace!" }); window.history.replaceState({}, '', window.location.pathname); setIsCheckingAccess(false); return; }
      } else if (accessStatus === 'cancelled') { toast({ title: "Payment cancelled", description: "Access purchase was cancelled.", variant: "destructive" }); window.history.replaceState({}, '', window.location.pathname); }
      const { data, error } = await supabase.functions.invoke('coupon-marketplace-access', { body: { action: 'check' }, headers: { Authorization: `Bearer ${session.access_token}` } });
      if (error) throw error;
      setHasAccess(data?.hasAccess || false);
    } catch (error) { console.error('Error checking access:', error); setHasAccess(false); }
    finally { setIsCheckingAccess(false); }
  };

  const handlePurchaseAccess = async () => {
    setIsPurchasingAccess(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Login Required", description: "Please log in to purchase access", variant: "destructive" }); return; }
      const { data, error } = await supabase.functions.invoke('coupon-marketplace-access', { body: { action: 'purchase' }, headers: { Authorization: `Bearer ${session.access_token}` } });
      if (error) throw error;
      if (data?.url) { const win = window.open(data.url, "_blank", "noopener,noreferrer"); if (!win) { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = data.url; } } }
    } catch (error) { console.error('Error purchasing access:', error); toast({ title: "Error", description: "Failed to initiate payment.", variant: "destructive" }); }
    finally { setIsPurchasingAccess(false); }
  };

  const checkPaymentStatus = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment'); const sessionId = urlParams.get('session_id'); const orderId = urlParams.get('order_id');
    if (paymentStatus === 'success' && sessionId && orderId) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { error } = await supabase.functions.invoke('verify-coupon-payment', { body: { sessionId, orderId }, headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined });
        if (error) throw error;
        toast({ title: "Purchase Complete! 🎉", description: "Check your email for the coupon details." });
        window.history.replaceState({}, '', window.location.pathname); loadCoupons(); if (currentUserId) loadMyOrders();
      } catch (error) { toast({ title: "Error", description: "Failed to verify payment.", variant: "destructive" }); }
    } else if (paymentStatus === 'cancelled') { toast({ title: "Payment cancelled", variant: "destructive" }); window.history.replaceState({}, '', window.location.pathname); }
  };

  const checkCurrentUser = async () => { const { data: { user } } = await supabase.auth.getUser(); setCurrentUserId(user?.id || null); };

  const loadCoupons = async () => {
    // Use SECURITY DEFINER function so discount_code is never exposed to non-buyers
    const { data, error } = await supabase.rpc('get_public_coupon_listings');
    if (!error) {
      const list = ((data as any) || []) as CouponListing[];
      setCoupons(list);
      // Fetch seller stats for visible sellers
      const sellerIds = Array.from(new Set(list.map((c) => c.user_id)));
      if (sellerIds.length) {
        const { data: stats } = await supabase
          .from("coupon_seller_stats" as any)
          .select("*")
          .in("seller_id", sellerIds);
        if (stats) {
          const map: Record<string, SellerStat> = {};
          (stats as any[]).forEach((s) => { map[s.seller_id] = s; });
          setSellerStats(map);
        }
        // Verified sellers (≥10 orders, <2% disputes, ≥4.5★)
        const { data: analytics } = await supabase.from("coupon_seller_analytics" as any).select("*").in("seller_id", sellerIds);
        const verified = new Set<string>();
        ((analytics as any[]) || []).forEach((s) => {
          if ((s.orders_completed ?? 0) >= 10 && (s.dispute_rate_pct ?? 0) < 2 && (s.avg_rating ?? 0) >= 4.5) verified.add(s.seller_id);
        });
        setVerifiedSellerIds(verified);
      }
    }
  };

  const loadMyOrders = async () => {
    const { data, error } = await supabase.from('coupon_orders').select('*, coupon_listings(*)').eq('buyer_id', currentUserId).order('created_at', { ascending: false });
    if (!error) setMyOrders((data as any) || []);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { if (file.size > 5 * 1024 * 1024) { toast({ title: "File too large", description: "Max 5MB", variant: "destructive" }); return; }
      setImageFile(file); const reader = new FileReader(); reader.onloadend = () => setImagePreview(reader.result as string); reader.readAsDataURL(file); }
  };
  const removeImage = () => { setImageFile(null); setImagePreview(""); };

  const filteredCoupons = (() => {
    const md = parseFloat(minDiscount) || 0;
    const mp = parseFloat(maxPrice);
    const now = Date.now();
    let arr = coupons.filter(c => {
      if (c.is_sold) return false;
      const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.store_name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (selectedCategory !== "all" && c.category !== selectedCategory) return false;
      const disc = ((c.original_value - c.selling_price) / c.original_value) * 100;
      if (disc < md) return false;
      if (!isNaN(mp) && c.selling_price > mp) return false;
      if (hideExpired && c.expiry_date && new Date(c.expiry_date).getTime() < now) return false;
      const tags = (c.tags || []) as string[];
      if (activeChips.has("free_shipping") && !tags.includes("free_shipping")) return false;
      if (activeChips.has("bogo") && !(tags.includes("bogo") || c.coupon_type === "bogo")) return false;
      if (activeChips.has("percent_off") && !(tags.includes("percent_off") || /%/.test(c.title))) return false;
      if (activeChips.has("amount_off") && !(tags.includes("amount_off") || /€/.test(c.title))) return false;
      if (activeChips.has("verified_only") && !verifiedSellerIds.has(c.user_id)) return false;
      return true;
    });
    const discPct = (c: CouponListing) => ((c.original_value - c.selling_price) / c.original_value) * 100;
    switch (sortBy) {
      case "discount_desc": arr = [...arr].sort((a, b) => discPct(b) - discPct(a)); break;
      case "price_asc": arr = [...arr].sort((a, b) => a.selling_price - b.selling_price); break;
      case "price_desc": arr = [...arr].sort((a, b) => b.selling_price - a.selling_price); break;
      case "expiry_asc": arr = [...arr].sort((a, b) => {
        const ax = a.expiry_date ? new Date(a.expiry_date).getTime() : Infinity;
        const bx = b.expiry_date ? new Date(b.expiry_date).getTime() : Infinity;
        return ax - bx;
      }); break;
      case "rating_desc": arr = [...arr].sort((a, b) => (sellerStats[b.user_id]?.avg_rating || 0) - (sellerStats[a.user_id]?.avg_rating || 0)); break;
      default: arr = [...arr].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return arr;
  })();

  const getTimeAgo = (d: string) => { const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000); if (h < 1) return "just now"; if (h < 24) return `${h}h ago`; const days = Math.floor(h / 24); return days < 7 ? `${days}d ago` : `${Math.floor(days / 7)}w ago`; };
  const getSavingsPercent = (o: number, s: number) => Math.round(((o - s) / o) * 100);

  const handleSubmit = async () => {
    if (!formData.title || !formData.store_name || !formData.original_value || !formData.selling_price) { toast({ title: "Error", description: "Fill in all required fields", variant: "destructive" }); return; }
    if (parseFloat(formData.selling_price) >= parseFloat(formData.original_value)) { toast({ title: "Error", description: "Selling price must be lower than original value", variant: "destructive" }); return; }
    if (!balanceConfirmed) { toast({ title: "Confirm balance", description: "Please confirm the coupon's balance/value is accurate.", variant: "destructive" }); return; }
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Error", description: "You must be logged in", variant: "destructive" }); setUploading(false); return; }
      let imageUrl = null;
      if (imageFile) { const fileName = `${user.id}/${Date.now()}.${imageFile.name.split('.').pop()}`; const { error: ue } = await supabase.storage.from('coupon_images').upload(fileName, imageFile); if (ue) throw ue; imageUrl = supabase.storage.from('coupon_images').getPublicUrl(fileName).data.publicUrl; }
      const { error } = await supabase.from('coupon_listings').insert({ user_id: user.id, title: formData.title, description: formData.description || null, store_name: formData.store_name, original_value: parseFloat(formData.original_value), selling_price: parseFloat(formData.selling_price), discount_code: formData.discount_code || null, expiry_date: formData.expiry_date || null, category: formData.category, coupon_type: formData.coupon_type, terms_conditions: formData.terms_conditions || null, image_url: imageUrl, balance_confirmed: true, balance_confirmed_value: parseFloat(formData.original_value) } as any);
      if (error) throw error;
      toast({ title: "Success! 🎉", description: "Your coupon has been listed for sale" });
      setFormData({ title: "", description: "", store_name: "", original_value: "", selling_price: "", discount_code: "", expiry_date: "", category: "general", coupon_type: "discount_code", terms_conditions: "" });
      setBalanceConfirmed(false);
      setImageFile(null); setImagePreview(""); setIsDialogOpen(false); loadCoupons();
    } catch (error) { toast({ title: "Error", description: "Failed to add listing", variant: "destructive" }); }
    finally { setUploading(false); }
  };

  const handlePurchase = async (coupon: CouponListing) => {
    if (!currentUserId) { toast({ title: "Login Required", variant: "destructive" }); return; }
    if (coupon.user_id === currentUserId) { toast({ title: "Error", description: "You cannot purchase your own coupon", variant: "destructive" }); return; }
    setIsPurchasing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('create-coupon-checkout', { body: { couponId: coupon.id }, headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined });
      if (error) throw error;
      if (data?.url) { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = data.url; } }
    } catch (error) { toast({ title: "Error", description: "Failed to initiate purchase.", variant: "destructive" }); }
    finally { setIsPurchasing(false); }
  };

  const handleContact = (coupon: CouponListing) => {
    if (!currentUserId) { toast({ title: "Error", description: "You must be logged in", variant: "destructive" }); return; }
    if (currentUserId === coupon.user_id) { toast({ title: "Warning", description: "You cannot contact yourself", variant: "destructive" }); return; }
    setSelectedCoupon(coupon); setIsContactDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!selectedCoupon || !currentUserId || !contactMessage.trim()) return;
    try {
      const { error } = await supabase.from('coupon_messages').insert({ coupon_id: selectedCoupon.id, sender_id: currentUserId, receiver_id: selectedCoupon.user_id, message: contactMessage });
      if (error) throw error;
      toast({ title: "Success", description: "Message sent" }); setContactMessage(""); setIsContactDialogOpen(false);
    } catch (error) { toast({ title: "Error", description: "Failed to send message", variant: "destructive" }); }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCoupon) return;
    try { const { error } = await supabase.from('coupon_listings').delete().eq('id', selectedCoupon.id); if (error) throw error; toast({ title: "Success", description: "Listing deleted" }); setIsDeleteDialogOpen(false); setIsDetailOpen(false); loadCoupons(); }
    catch (error) { toast({ title: "Error", description: "Failed to delete", variant: "destructive" }); }
  };

  // Loading state
  if (isCheckingAccess) return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div><p className="text-muted-foreground">Checking access...</p></div></div>;

  // Paywall
  if (!hasAccess) {
    return (
      <>
        <FloatingHowItWorks title="How Coupon Marketplace works" steps={[
          { title: 'Browse listings', desc: 'Explore items, services or offers.' },
          { title: 'Open a detail', desc: 'Review price, seller and terms.' },
          { title: 'Buy / order / bid', desc: 'Complete secure Stripe checkout in EUR. Fees follow platform splits.' },
          { title: 'Track & review', desc: 'Manage orders, leave reviews, get notifications.' },
        ]} />
        <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12">
        <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
          <CouponHero couponCount={156} />

          <HeroRewardedAd sectionKey="page_couponmarketplace" />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 mb-8">
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-2xl">
              <CardContent className="p-5 sm:p-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-primary mb-5">
                  <Ticket className="w-4 h-4" />
                  <span className="text-sm font-semibold">Exclusive Marketplace Access</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-4">
                  Coupon <span className="bg-gradient-to-r from-primary via-primary to-foreground bg-clip-text text-transparent">Marketplace</span>
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-4">
                  Unlock a premium coupon exchange where members buy and sell unused gift cards, discount codes, and promotional vouchers with secure checkout and buyer protection.
                </p>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mb-6">
                  Flip unused offers into cash, discover underpriced deals before they expire, and use AI tools to price, verify, match, and optimize every listing.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Shield className="w-5 h-5" /></div>
                      <p className="font-bold">Protected buying</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Escrow-backed purchases, instant delivery flows, and safer transactions on every order.</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles className="w-5 h-5" /></div>
                      <p className="font-bold">AI selling edge</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Estimate value, scan for fraud, generate higher-converting copy, and find best-fit buyers faster.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {aiTools.map((tool) => (
                    <div key={tool.id} className="rounded-2xl border border-border/60 bg-background/70 p-2.5 text-left">
                      <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <tool.icon className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold leading-snug">{tool.title.replace("AI ", "")}</p>
                      <p className="text-[10px] text-primary mt-0.5">{tool.badge}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="sticky top-24 overflow-hidden border-2 border-primary/20 bg-gradient-to-b from-card to-primary/5 shadow-2xl">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-lg">
                    <Crown className="w-10 h-10" />
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary mb-2">Premium Access</p>
                  <h2 className="text-2xl sm:text-3xl font-black mb-2">Monthly Subscription</h2>
                  <div className="mb-6 flex items-end justify-center gap-2">
                    <span className="text-5xl font-black text-primary">€1</span>
                    <span className="text-muted-foreground mb-1">/ month</span>
                  </div>
                  <div className="space-y-3 text-left mb-6">
                    {[
                      "Full marketplace access for buyers and sellers",
                      "10 premium AI coupon tools with credit-based usage",
                      "Discount discovery, secure chat, and safer deal flow",
                      "Cancel anytime with no long-term lock-in",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/60 px-3 py-3">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground/90">{item}</span>
                      </div>
                    ))}
                  </div>
                  {!currentUserId ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">You need to be logged in to purchase access.</p>
                      <Button asChild size="lg" className="w-full gap-2">
                        <a href="/auth"><Ticket className="w-4 h-4" />Log In to Continue</a>
                      </Button>
                    </div>
                  ) : (
                    <Button size="lg" className="w-full gap-2" onClick={handlePurchaseAccess} disabled={isPurchasingAccess}>
                      {isPurchasingAccess ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Processing...</> : <><Crown className="w-4 h-4" />Subscribe for €1/month</>}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid sm:grid-cols-3 gap-4">
            <Card className="bg-card/80 backdrop-blur-xl border-border/50 text-center p-4"><Percent className="w-8 h-8 text-primary mx-auto mb-2" /><h3 className="font-semibold">Save More</h3><p className="text-sm text-muted-foreground">Buy verified coupons below face value.</p></Card>
            <Card className="bg-card/80 backdrop-blur-xl border-border/50 text-center p-4"><Tag className="w-8 h-8 text-primary mx-auto mb-2" /><h3 className="font-semibold">Sell Faster</h3><p className="text-sm text-muted-foreground">Turn unused codes and gift cards into cash.</p></Card>
            <Card className="bg-card/80 backdrop-blur-xl border-border/50 text-center p-4"><Shield className="w-8 h-8 text-primary mx-auto mb-2" /><h3 className="font-semibold">Trade Safer</h3><p className="text-sm text-muted-foreground">Escrow, chat, and AI fraud screening in one flow.</p></Card>
          </motion.div>
        </div>
      </div>
      </>
      );
  }

  // AI Tool Views
  if (activeView === "coupon-valuator") return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12"><div className="container mx-auto px-3 sm:px-4 max-w-7xl"><CouponValuatorView onBack={() => setActiveView(null)} /></div></div>;
  if (activeView === "fraud-scanner") return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12"><div className="container mx-auto px-3 sm:px-4 max-w-7xl"><FraudScannerView onBack={() => setActiveView(null)} /></div></div>;
  if (activeView === "deal-matcher") return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12"><div className="container mx-auto px-3 sm:px-4 max-w-7xl"><DealMatcherView onBack={() => setActiveView(null)} /></div></div>;
  if (activeView === "listing-writer") return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12"><div className="container mx-auto px-3 sm:px-4 max-w-7xl"><ListingWriterView onBack={() => setActiveView(null)} /></div></div>;
  if (activeView === "expiry-alert") return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12"><div className="container mx-auto px-3 sm:px-4 max-w-7xl"><ExpiryAlertView onBack={() => setActiveView(null)} /></div></div>;
  if (activeView === "bundle-builder") return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12"><div className="container mx-auto px-3 sm:px-4 max-w-7xl"><BundleBuilderView onBack={() => setActiveView(null)} /></div></div>;
  if (activeView === "store-reputation") return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12"><div className="container mx-auto px-3 sm:px-4 max-w-7xl"><StoreReputationView onBack={() => setActiveView(null)} /></div></div>;
  if (activeView === "price-history") return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12"><div className="container mx-auto px-3 sm:px-4 max-w-7xl"><PriceHistoryView onBack={() => setActiveView(null)} /></div></div>;
  if (activeView === "negotiation-bot") return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12"><div className="container mx-auto px-3 sm:px-4 max-w-7xl"><NegotiationBotView onBack={() => setActiveView(null)} /></div></div>;
  if (activeView === "wishlist-alerts") return <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12"><div className="container mx-auto px-3 sm:px-4 max-w-7xl"><WishlistAlertsView onBack={() => setActiveView(null)} /></div></div>;

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        {/* Cinematic Hero */}
        <CouponHero couponCount={coupons.length} />

        {/* 3-Column Engagement Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card/80 backdrop-blur-xl border-border/50"><CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center"><Flame className="w-5 h-5 text-white" /></div>
              <div><p className="text-xs text-muted-foreground">Deal Streak</p><p className="font-black text-lg">🔥 Active</p></div>
            </CardContent></Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-card/80 backdrop-blur-xl border-border/50"><CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-white" /></div>
              <div><p className="text-xs text-muted-foreground">Top Categories</p><p className="font-black text-lg">Shopping · Tech</p></div>
            </CardContent></Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-card/80 backdrop-blur-xl border-border/50"><CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"><Award className="w-5 h-5 text-white" /></div>
              <div><p className="text-xs text-muted-foreground">Platform Benefits</p><p className="font-black text-lg">Escrow · Buyer Protection</p></div>
            </CardContent></Card>
          </motion.div>
        </div>

        {/* AI Tools */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
          <h2 className="text-xl font-black mb-4">🤖 AI-Powered Coupon Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {aiTools.map((tool, i) => <MarketplaceToolCard key={tool.id} tool={tool} onSelect={() => setActiveView(tool.id)} index={i} />)}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />How It Works</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-primary flex items-center gap-2"><Crown className="w-4 h-4" />For Sellers</h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">1.</span><span><strong>List Your Coupon:</strong> Add store name, original value, and selling price.</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">2.</span><span><strong>Set Your Price:</strong> Sell below face value. You keep 90% (10% platform fee).</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">3.</span><span><strong>Instant Delivery:</strong> Code sent automatically to buyer via email.</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">4.</span><span><strong>Get Paid:</strong> Payout within 24h via Stripe Connect.</span></li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-primary flex items-center gap-2"><Gift className="w-4 h-4" />For Buyers</h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">1.</span><span><strong>Browse Deals:</strong> Search coupons from your favorite stores at discount.</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">2.</span><span><strong>Verify & Purchase:</strong> Check expiry dates. Pay securely via Stripe.</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">3.</span><span><strong>Instant Access:</strong> Receive coupon code immediately after payment.</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary font-bold">4.</span><span><strong>Buyer Protection:</strong> Full refund if coupon doesn't work.</span></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Engagement panel: cashback, alerts, saved searches */}
        <div className="mb-6">
          <CouponEngagementPanel
            userId={currentUserId}
            currentFilters={{ searchTerm, category: selectedCategory, minDiscount, maxPrice, sortBy }}
            onApplySearch={(p) => {
              setSearchTerm(p?.searchTerm ?? "");
              setSelectedCategory(p?.category ?? "all");
              setMinDiscount(p?.minDiscount ?? "0");
              setMaxPrice(p?.maxPrice ?? "");
              setSortBy(p?.sortBy ?? "newest");
              setActiveTab("browse");
            }}
          />
        </div>

        {/* Scale: loyalty, affiliate, gift-card, sell calc, extension, crypto */}
        <div className="mb-6">
          <CouponScalePanel
            userId={currentUserId}
            wishlistCount={wishlist.items.length}
            onBulkBuy={async () => {
              if (!wishlist.items.length) return;
              const wishedCoupons = coupons.filter(c => wishlist.isWishlisted(c.id) && !c.is_sold && c.user_id !== currentUserId);
              if (!wishedCoupons.length) { toast({ title: "Nothing to buy", description: "Your wishlist is empty or items are unavailable." }); return; }
              toast({ title: `Opening ${wishedCoupons.length} checkout(s)...`, description: "We'll open each in a new tab." });
              for (const c of wishedCoupons) {
                await handlePurchase(c);
                await new Promise(r => setTimeout(r, 600));
              }
            }}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="my-listings">My Listings</TabsTrigger>
            <TabsTrigger value="my-orders">My Purchases</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            <SeasonalHubBanner />
            <CouponReferralBanner userId={currentUserId} />
            <DailyDealCountdown onOpenCoupon={(id) => {
              const c = coupons.find(x => x.id === id);
              if (c) { setSelectedCoupon(c); setIsDetailOpen(true); }
            }} />
            <CouponExtensionTeaser />
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <CouponGeoDeals />
              <CouponStackingCalculator />
              <CouponReceiptCashback />
              <CouponApiKeysPanel />
            </div>
            <CouponBattleWidget userId={currentUserId} />
            <CouponCompareWidget userId={currentUserId} />
            <TrendingStoresLeaderboard />
            <CouponFilterChips active={activeChips} onToggle={(id) => {
              const next = new Set(activeChips);
              if (next.has(id)) next.delete(id); else next.add(id);
              setActiveChips(next);
            }} />
            <div className="space-y-3 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search coupons or stores..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" /></div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}><div className="flex items-center gap-2"><c.icon className="w-4 h-4" />{c.name}</div></SelectItem>)}</SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Sort" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="discount_desc">Highest discount</SelectItem>
                    <SelectItem value="price_asc">Price: low → high</SelectItem>
                    <SelectItem value="price_desc">Price: high → low</SelectItem>
                    <SelectItem value="expiry_asc">Expiring soon</SelectItem>
                    <SelectItem value="rating_desc">Top-rated sellers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-card/40 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Min discount</span>
                  <Select value={minDiscount} onValueChange={setMinDiscount}>
                    <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["0","10","20","30","40","50","60","70"].map(v => <SelectItem key={v} value={v}>{v}%+</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Max price</span>
                  <Input type="number" placeholder="€ any" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="h-8 w-24" />
                </div>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox checked={hideExpired} onCheckedChange={(v) => setHideExpired(Boolean(v))} />
                  Hide expired
                </label>
                {(minDiscount !== "0" || maxPrice || !hideExpired || sortBy !== "newest" || selectedCategory !== "all") && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs ml-auto" onClick={() => { setMinDiscount("0"); setMaxPrice(""); setHideExpired(true); setSortBy("newest"); setSelectedCategory("all"); }}>Reset</Button>
                )}
                <span className="ml-auto text-xs text-muted-foreground">{filteredCoupons.length} results</span>
              </div>
              <div className="flex justify-end">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Sell Coupon</Button></DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>List Your Coupon</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <SellerConnectGate compact />
                    <div><label className="text-sm font-medium">Title *</label><Input placeholder="e.g., 20% off at Nike" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
                    <div><label className="text-sm font-medium">Store Name *</label><Input placeholder="e.g., Nike, Amazon" value={formData.store_name} onChange={e => setFormData({ ...formData, store_name: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-sm font-medium">Original Value (€) *</label><Input type="number" placeholder="50" value={formData.original_value} onChange={e => setFormData({ ...formData, original_value: e.target.value })} /></div>
                      <div><label className="text-sm font-medium">Selling Price (€) *</label><Input type="number" placeholder="35" value={formData.selling_price} onChange={e => setFormData({ ...formData, selling_price: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-sm font-medium">Category</label><Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.filter(c => c.id !== "all").map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                      <div><label className="text-sm font-medium">Coupon Type</label><Select value={formData.coupon_type} onValueChange={v => setFormData({ ...formData, coupon_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{couponTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <div><label className="text-sm font-medium">Discount Code (optional)</label><Input placeholder="e.g., SAVE20" value={formData.discount_code} onChange={e => setFormData({ ...formData, discount_code: e.target.value })} /><p className="text-xs text-muted-foreground mt-1">Revealed to buyer after purchase</p></div>
                    <div><label className="text-sm font-medium">Expiry Date</label><Input type="date" value={formData.expiry_date} onChange={e => setFormData({ ...formData, expiry_date: e.target.value })} /></div>
                    <div><label className="text-sm font-medium">Description</label><Textarea placeholder="Describe the coupon..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                    <div><label className="text-sm font-medium">Terms & Conditions</label><Textarea placeholder="Any specific terms..." value={formData.terms_conditions} onChange={e => setFormData({ ...formData, terms_conditions: e.target.value })} /></div>
                    <div><label className="text-sm font-medium">Image (optional)</label>
                      {imagePreview ? <div className="relative w-full h-32 mt-2"><img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" /><Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={removeImage}><X className="h-4 w-4" /></Button></div>
                      : <label className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 mt-2"><div className="flex flex-col items-center"><Upload className="h-6 w-6 text-muted-foreground" /><span className="text-sm text-muted-foreground">Upload image</span></div><input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" /></label>}
                    </div>
                    <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                      <Checkbox id="balance-confirm" checked={balanceConfirmed} onCheckedChange={(v) => setBalanceConfirmed(Boolean(v))} className="mt-0.5" />
                      <label htmlFor="balance-confirm" className="text-xs leading-snug cursor-pointer">
                        <strong className="text-emerald-600">I confirm the coupon balance/value is accurate.</strong> False listings are removed and may result in account suspension. Buyers are protected by a 7-day Buyer Guarantee.
                      </label>
                    </div>
                    <Button onClick={handleSubmit} className="w-full" disabled={uploading}>{uploading ? "Listing..." : "List Coupon"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCoupons.map((coupon, i) => (
                <motion.div key={coupon.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden bg-card/80 backdrop-blur-xl border-border/50 hover:scale-[1.02]" onClick={() => { setSelectedCoupon(coupon); setIsDetailOpen(true); }}>
                    <div className="relative">
                      {coupon.image_url ? <img src={coupon.image_url} alt={coupon.title} className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center"><Ticket className="w-12 h-12 text-primary/50" /></div>}
                      <Badge className="absolute top-2 right-2 bg-success text-success-foreground">Save {getSavingsPercent(coupon.original_value, coupon.selling_price)}%</Badge>
                      <button
                        onClick={(e) => { e.stopPropagation(); wishlist.toggle(coupon.id); }}
                        aria-label={wishlist.isWishlisted(coupon.id) ? "Remove from wishlist" : "Add to wishlist"}
                        className="absolute top-2 left-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Heart className={`w-4 h-4 ${wishlist.isWishlisted(coupon.id) ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
                      </button>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <Link to={`/coupons/${brandSlug(coupon.store_name)}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 hover:text-primary transition-colors"><Store className="w-3 h-3 text-muted-foreground" /><span className="text-xs font-medium text-muted-foreground hover:text-primary underline-offset-2 hover:underline">{coupon.store_name}</span></Link>
                        {sellerStats[coupon.user_id] ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-500 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {sellerStats[coupon.user_id].avg_rating} <span className="text-muted-foreground">({sellerStats[coupon.user_id].review_count})</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">New seller</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2">{coupon.title}</h3>
                      <div className="flex items-center justify-between mb-2">
                        <div><span className="text-lg font-black text-primary">€{coupon.selling_price.toFixed(2)}</span><span className="text-xs text-muted-foreground line-through ml-1">€{coupon.original_value.toFixed(2)}</span></div>
                      </div>
                      <Badge variant="outline" className="gap-1 mb-2 border-emerald-500/40 text-emerald-600 text-[10px] px-1.5 py-0">
                        <Shield className="w-3 h-3" />7-day Buyer Guarantee
                      </Badge>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <CouponExpiryHeatmap expiry={coupon.expiry_date} />
                        <VerifiedSellerBadge sellerId={coupon.user_id} />
                      </div>
                      <div className="flex items-center gap-2">
                        <CouponVoteWidget couponId={coupon.id} userId={currentUserId} />
                        <Button size="sm" className="flex-1" onClick={e => { e.stopPropagation(); handlePurchase(coupon); }} disabled={isPurchasing}>Buy Now</Button>
                        <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); handleContact(coupon); }}><MessageCircle className="w-3 h-3" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            {filteredCoupons.length === 0 && <div className="text-center py-12"><Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">No coupons found</h3><p className="text-muted-foreground">Be the first to list a coupon!</p></div>}
          </TabsContent>

          <TabsContent value="wishlist" className="mt-6">
            {(() => {
              const wished = coupons.filter(c => wishlist.isWishlisted(c.id) && !c.is_sold);
              if (wished.length === 0) return <div className="text-center py-12"><Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3><p className="text-muted-foreground">Tap the heart on any coupon to save it here.</p></div>;
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {wished.map(coupon => (
                    <Card key={coupon.id} className="overflow-hidden bg-card/80 backdrop-blur-xl border-border/50 cursor-pointer hover:scale-[1.02] transition-all" onClick={() => { setSelectedCoupon(coupon); setIsDetailOpen(true); }}>
                      <div className="relative">
                        {coupon.image_url ? <img src={coupon.image_url} alt={coupon.title} className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center"><Ticket className="w-12 h-12 text-primary/50" /></div>}
                        <Badge className="absolute top-2 right-2 bg-success text-success-foreground">Save {getSavingsPercent(coupon.original_value, coupon.selling_price)}%</Badge>
                        <button onClick={(e) => { e.stopPropagation(); wishlist.toggle(coupon.id); }} className="absolute top-2 left-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"><Heart className="w-4 h-4 fill-rose-500 text-rose-500" /></button>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">{coupon.store_name}</p>
                        <h3 className="font-semibold text-sm line-clamp-2 mb-2">{coupon.title}</h3>
                        <div className="flex items-center justify-between"><span className="text-lg font-black text-primary">€{coupon.selling_price.toFixed(2)}</span><Button size="sm" onClick={(e) => { e.stopPropagation(); handlePurchase(coupon); }}>Buy</Button></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="my-listings" className="mt-6">
            <CouponSellerDashboard userId={currentUserId} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {coupons.filter(c => c.user_id === currentUserId).map(coupon => (
                <Card key={coupon.id} className="overflow-hidden bg-card/80 backdrop-blur-xl border-border/50">
                  <div className="relative">{coupon.image_url ? <img src={coupon.image_url} alt={coupon.title} className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center"><Ticket className="w-12 h-12 text-primary/50" /></div>}{coupon.is_sold && <Badge className="absolute top-2 right-2 bg-destructive">Sold</Badge>}</div>
                  <CardContent className="p-4"><h3 className="font-semibold text-sm line-clamp-2 mb-2">{coupon.title}</h3><p className="text-lg font-black text-primary">€{coupon.selling_price.toFixed(2)}</p><div className="flex gap-2 mt-3"><Button size="sm" variant="destructive" onClick={() => { setSelectedCoupon(coupon); setIsDeleteDialogOpen(true); }}><Trash2 className="w-4 h-4" /></Button></div></CardContent>
                </Card>
              ))}
            </div>
            {coupons.filter(c => c.user_id === currentUserId).length === 0 && <div className="text-center py-12"><Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">No listings yet</h3><p className="text-muted-foreground mb-4">Start selling your unused coupons!</p><Button onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Sell Coupon</Button></div>}
          </TabsContent>

          <TabsContent value="my-orders" className="mt-6">
            <div className="space-y-4">
              {myOrders.map(order => (
                <BuyerOrderCard key={order.id} order={order as any} onChanged={loadMyOrders} />
              ))}
              {myOrders.length === 0 && <div className="text-center py-12"><Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">No purchases yet</h3><p className="text-muted-foreground">Browse coupons to find great deals!</p></div>}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center bg-card/80 backdrop-blur-xl border-border/50"><CardContent className="p-5"><h3 className="font-bold mb-1">🛡️ Escrow Protection</h3><p className="text-xs text-muted-foreground">Payment held until delivery confirmed</p></CardContent></Card>
          <Card className="text-center bg-card/80 backdrop-blur-xl border-border/50"><CardContent className="p-5"><h3 className="font-bold mb-1">💰 Save Up to 50%</h3><p className="text-xs text-muted-foreground">Get coupons below face value</p></CardContent></Card>
          <Card className="text-center bg-card/80 backdrop-blur-xl border-border/50"><CardContent className="p-5"><h3 className="font-bold mb-1">⚡ Instant Delivery</h3><p className="text-xs text-muted-foreground">Codes delivered immediately after purchase</p></CardContent></Card>
        </div>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{selectedCoupon?.title}</DialogTitle></DialogHeader>
            {selectedCoupon && <div className="space-y-4">
              {selectedCoupon.image_url && <img src={selectedCoupon.image_url} alt={selectedCoupon.title} className="w-full h-48 object-cover rounded-lg" />}
              <div className="flex items-center gap-2"><Store className="w-4 h-4" /><span className="font-medium">{selectedCoupon.store_name}</span></div>
              <div className="flex items-center justify-between"><div><span className="text-2xl font-bold text-primary">€{selectedCoupon.selling_price.toFixed(2)}</span><span className="text-lg text-muted-foreground line-through ml-2">€{selectedCoupon.original_value.toFixed(2)}</span></div><Badge className="bg-success text-success-foreground">Save {getSavingsPercent(selectedCoupon.original_value, selectedCoupon.selling_price)}%</Badge></div>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedCoupon.expiry_date && <CouponExpiryHeatmap expiry={selectedCoupon.expiry_date} />}
                <VerifiedSellerBadge sellerId={selectedCoupon.user_id} />
              </div>
              <CouponVerifyButtons couponId={selectedCoupon.id} userId={currentUserId} />
              {selectedCoupon.description && <p className="text-muted-foreground">{selectedCoupon.description}</p>}
              {selectedCoupon.terms_conditions && <div className="bg-muted p-3 rounded-lg text-sm"><p className="font-medium mb-1">Terms & Conditions:</p><p className="text-muted-foreground">{selectedCoupon.terms_conditions}</p></div>}
              <CouponComments couponId={selectedCoupon.id} userId={currentUserId} />
              <div className="flex gap-2">
                {selectedCoupon.user_id !== currentUserId && <><Button className="flex-1" onClick={() => handlePurchase(selectedCoupon)} disabled={isPurchasing}>{isPurchasing ? "Processing..." : "Buy Now"}</Button><Button variant="outline" onClick={() => handleContact(selectedCoupon)}><MessageCircle className="w-4 h-4 mr-2" />Contact</Button></>}
                {selectedCoupon.user_id === currentUserId && <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>}
              </div>
            </div>}
          </DialogContent>
        </Dialog>

        {/* Contact Dialog */}
        <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
          <DialogContent><DialogHeader><DialogTitle>Contact Seller</DialogTitle></DialogHeader>
            <div className="space-y-4"><Textarea placeholder="Write your message..." value={contactMessage} onChange={e => setContactMessage(e.target.value)} rows={4} /><Button onClick={handleSendMessage} className="w-full">Send Message</Button></div>
          </DialogContent>
        </Dialog>

        {/* Delete */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Listing?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default CouponMarketplace;
