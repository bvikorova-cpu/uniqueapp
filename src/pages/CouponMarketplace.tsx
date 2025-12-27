import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Tag, Clock, User, MessageCircle, Upload, X, Trash2, Ticket, Store, Percent, Calendar, Gift, Sparkles, Shield, Zap, Star, Crown, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

interface CouponListing {
  id: string;
  title: string;
  description: string | null;
  store_name: string;
  original_value: number;
  selling_price: number;
  discount_code: string | null;
  expiry_date: string | null;
  category: string;
  coupon_type: string;
  is_digital: boolean;
  image_url: string | null;
  terms_conditions: string | null;
  is_sold: boolean;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
  } | null;
}

interface CouponOrder {
  id: string;
  coupon_id: string;
  amount: number;
  status: string;
  paid_at: string | null;
  delivered_at: string | null;
  created_at: string;
  coupon_listings?: CouponListing;
}

const categories = [
  { id: "all", name: "All Coupons", icon: Tag },
  { id: "food", name: "Food & Dining", icon: Store },
  { id: "shopping", name: "Shopping", icon: Gift },
  { id: "entertainment", name: "Entertainment", icon: Sparkles },
  { id: "travel", name: "Travel", icon: Zap },
  { id: "beauty", name: "Beauty & Spa", icon: Star },
  { id: "tech", name: "Tech & Electronics", icon: Package },
  { id: "general", name: "General", icon: Ticket },
];

const couponTypes = [
  { id: "discount_code", name: "Discount Code" },
  { id: "gift_card", name: "Gift Card" },
  { id: "voucher", name: "Voucher" },
  { id: "cashback", name: "Cashback Offer" },
  { id: "bogo", name: "Buy One Get One" },
];

const CouponMarketplace = () => {
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
  const [myOrders, setMyOrders] = useState<CouponOrder[]>([]);
  const [activeTab, setActiveTab] = useState("browse");
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isPurchasingAccess, setIsPurchasingAccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    store_name: "",
    original_value: "",
    selling_price: "",
    discount_code: "",
    expiry_date: "",
    category: "general",
    coupon_type: "discount_code",
    terms_conditions: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    checkCurrentUser();
    checkAccessStatus();
  }, []);

  useEffect(() => {
    if (hasAccess) {
      loadCoupons();
      checkPaymentStatus();
    }
  }, [hasAccess]);

  useEffect(() => {
    if (currentUserId && activeTab === "my-orders") {
      loadMyOrders();
    }
  }, [currentUserId, activeTab]);

  const checkAccessStatus = async () => {
    setIsCheckingAccess(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setHasAccess(false);
        setIsCheckingAccess(false);
        return;
      }

      // Check URL for access payment success
      const urlParams = new URLSearchParams(window.location.search);
      const accessStatus = urlParams.get('access');
      const sessionId = urlParams.get('session_id');

      if (accessStatus === 'success' && sessionId) {
        const { data, error } = await supabase.functions.invoke('coupon-marketplace-access', {
          body: { action: 'verify', sessionId },
          headers: { Authorization: `Bearer ${session.access_token}` }
        });

        if (!error && data?.hasAccess) {
          setHasAccess(true);
          toast({
            title: "Welcome! 🎉",
            description: "You now have lifetime access to the Coupon Marketplace!",
          });
          window.history.replaceState({}, '', window.location.pathname);
          setIsCheckingAccess(false);
          return;
        }
      } else if (accessStatus === 'cancelled') {
        toast({
          title: "Payment cancelled",
          description: "Access purchase was cancelled.",
          variant: "destructive",
        });
        window.history.replaceState({}, '', window.location.pathname);
      }

      // Check existing access
      const { data, error } = await supabase.functions.invoke('coupon-marketplace-access', {
        body: { action: 'check' },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;
      setHasAccess(data?.hasAccess || false);
    } catch (error) {
      console.error('Error checking access:', error);
      setHasAccess(false);
    } finally {
      setIsCheckingAccess(false);
    }
  };

  const handlePurchaseAccess = async () => {
    setIsPurchasingAccess(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Login Required",
          description: "Please log in to purchase access",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('coupon-marketplace-access', {
        body: { action: 'purchase' },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      if (data?.url) {
        // Prefer opening in a new tab (mobile browsers / in-app webviews can block redirects)
        const win = window.open(data.url, "_blank", "noopener,noreferrer");
        if (!win) window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error purchasing access:', error);
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPurchasingAccess(false);
    }
  };

  const checkPaymentStatus = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');
    const orderId = urlParams.get('order_id');

    if (paymentStatus === 'success' && sessionId && orderId) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const { data, error } = await supabase.functions.invoke('verify-coupon-payment', {
          body: { sessionId, orderId },
          headers: session?.access_token ? {
            Authorization: `Bearer ${session.access_token}`
          } : undefined
        });

        if (error) throw error;

        toast({
          title: "Purchase Complete! 🎉",
          description: "Check your email for the coupon details.",
        });

        window.history.replaceState({}, '', window.location.pathname);
        loadCoupons();
        if (currentUserId) loadMyOrders();
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast({
          title: "Error",
          description: "Failed to verify payment. Please contact support.",
          variant: "destructive",
        });
      }
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Payment cancelled",
        description: "The payment was cancelled.",
        variant: "destructive",
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadCoupons = async () => {
    const { data, error } = await supabase
      .from('coupon_listings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading coupons:', error);
      return;
    }

    setCoupons(data || []);
  };

  const loadMyOrders = async () => {
    const { data, error } = await supabase
      .from('coupon_orders')
      .select('*, coupon_listings(*)')
      .eq('buyer_id', currentUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading orders:', error);
      return;
    }

    setMyOrders(data || []);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum image size is 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = 
      coupon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.store_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || coupon.category === selectedCategory;
    return matchesSearch && matchesCategory && !coupon.is_sold;
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  const getSavingsPercent = (original: number, selling: number) => {
    return Math.round(((original - selling) / original) * 100);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.store_name || !formData.original_value || !formData.selling_price) {
      toast({
        title: "Error",
        description: "Fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.selling_price) >= parseFloat(formData.original_value)) {
      toast({
        title: "Error",
        description: "Selling price must be lower than original value",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('coupon_images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('coupon_images')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('coupon_listings')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          store_name: formData.store_name,
          original_value: parseFloat(formData.original_value),
          selling_price: parseFloat(formData.selling_price),
          discount_code: formData.discount_code || null,
          expiry_date: formData.expiry_date || null,
          category: formData.category,
          coupon_type: formData.coupon_type,
          terms_conditions: formData.terms_conditions || null,
          image_url: imageUrl,
        });

      if (insertError) throw insertError;

      toast({
        title: "Success! 🎉",
        description: "Your coupon has been listed for sale",
      });

      setFormData({
        title: "",
        description: "",
        store_name: "",
        original_value: "",
        selling_price: "",
        discount_code: "",
        expiry_date: "",
        category: "general",
        coupon_type: "discount_code",
        terms_conditions: "",
      });
      setImageFile(null);
      setImagePreview("");
      setIsDialogOpen(false);
      loadCoupons();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to add listing",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePurchase = async (coupon: CouponListing) => {
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase coupons",
        variant: "destructive",
      });
      return;
    }

    if (coupon.user_id === currentUserId) {
      toast({
        title: "Error",
        description: "You cannot purchase your own coupon",
        variant: "destructive",
      });
      return;
    }

    setIsPurchasing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('create-coupon-checkout', {
        body: { couponId: coupon.id },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : undefined
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to initiate purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleContact = (coupon: CouponListing) => {
    if (!currentUserId) {
      toast({
        title: "Error",
        description: "You must be logged in",
        variant: "destructive",
      });
      return;
    }
    
    if (currentUserId === coupon.user_id) {
      toast({
        title: "Warning",
        description: "You cannot contact yourself",
        variant: "destructive",
      });
      return;
    }

    setSelectedCoupon(coupon);
    setIsContactDialogOpen(true);
  };

  const openDetail = (coupon: CouponListing) => {
    setSelectedCoupon(coupon);
    setIsDetailOpen(true);
  };

  const handleSendMessage = async () => {
    if (!selectedCoupon || !currentUserId || !contactMessage.trim()) {
      toast({
        title: "Error",
        description: "Fill in message",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('coupon_messages')
        .insert({
          coupon_id: selectedCoupon.id,
          sender_id: currentUserId,
          receiver_id: selectedCoupon.user_id,
          message: contactMessage,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message sent to seller",
      });

      setContactMessage("");
      setIsContactDialogOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCoupon) return;

    try {
      const { error } = await supabase
        .from('coupon_listings')
        .delete()
        .eq('id', selectedCoupon.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Listing deleted",
      });

      setIsDeleteDialogOpen(false);
      setIsDetailOpen(false);
      loadCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // Paywall - No access
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12">
        <div className="container mx-auto px-3 sm:px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Ticket className="w-4 h-4" />
              <span className="text-sm font-medium">Exclusive Marketplace</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4">
              Coupon{" "}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Marketplace
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              Join our exclusive marketplace where members buy and sell unused coupons, gift cards, and promotional vouchers at discounted prices.
            </p>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8">
              Have a coupon you won't use? Sell it and earn money! Looking for deals? Buy coupons from others at 10-50% off face value. 
              Our secure escrow system protects both buyers and sellers on every transaction. Perfect for shoppers who want to save 
              and for anyone with unused gift cards, store credits, or promotional codes gathering dust.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Monthly Subscription</h2>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-5xl font-bold text-primary">€1</span>
                  <span className="text-muted-foreground">per month</span>
                </div>
                
                <ul className="text-left space-y-3 mb-8 max-w-sm mx-auto">
                  <li className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Buy coupons at discounted prices</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Store className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Sell your unused coupons & gift cards</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <span>Save up to 50% on purchases</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <span>Escrow protection on all transactions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-pink-500 flex-shrink-0" />
                    <span>Cancel anytime - no long-term commitment</span>
                  </li>
                </ul>

                {!currentUserId ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">You need to be logged in to purchase access</p>
                    <Button asChild size="lg" className="w-full max-w-xs">
                      <a href="/auth">Log In to Continue</a>
                    </Button>
                  </div>
                ) : (
                  <Button 
                    size="lg" 
                    className="w-full max-w-xs gap-2"
                    onClick={handlePurchaseAccess}
                    disabled={isPurchasingAccess}
                  >
                    {isPurchasingAccess ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Ticket className="w-5 h-5" />
                        Subscribe for €1/month
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview of features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 grid sm:grid-cols-3 gap-4"
          >
            <div className="bg-card border rounded-xl p-4 text-center">
              <Percent className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold">Save Money</h3>
              <p className="text-sm text-muted-foreground">Get coupons below face value</p>
            </div>
            <div className="bg-card border rounded-xl p-4 text-center">
              <Tag className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold">Earn Cash</h3>
              <p className="text-sm text-muted-foreground">Sell your unused coupons</p>
            </div>
            <div className="bg-card border rounded-xl p-4 text-center">
              <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold">100% Secure</h3>
              <p className="text-sm text-muted-foreground">Protected transactions</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Ticket className="w-4 h-4" />
            <span className="text-sm font-medium">Save Big on Every Purchase</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4">
            Coupon{" "}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Marketplace
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Buy and sell unused coupons, gift cards, and vouchers. Save money or earn from coupons you won't use!
          </p>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-card via-card/80 to-card border rounded-2xl p-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* For Sellers */}
            <div className="space-y-3">
              <h3 className="font-semibold text-primary flex items-center gap-2">
                <Crown className="w-4 h-4" />
                For Sellers
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span><strong>List Your Coupon:</strong> Have an unused coupon, gift card, or voucher? List it with the store name, original value, and your selling price.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span><strong>Set Your Price:</strong> Sell for less than face value to attract buyers. You keep 90% of the sale price (10% platform fee).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span><strong>Instant Delivery:</strong> Once purchased, the coupon code is automatically sent to the buyer via email.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span><strong>Get Paid:</strong> Receive your payout within 24 hours via Stripe Connect.</span>
                </li>
              </ul>
            </div>

            {/* For Buyers */}
            <div className="space-y-3">
              <h3 className="font-semibold text-primary flex items-center gap-2">
                <Gift className="w-4 h-4" />
                For Buyers
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span><strong>Browse Deals:</strong> Search for coupons from your favorite stores at discounted prices.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span><strong>Verify & Purchase:</strong> Check expiry dates and terms. Pay securely via Stripe.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span><strong>Instant Access:</strong> Receive the coupon code immediately after payment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span><strong>Buyer Protection:</strong> Full refund if the coupon doesn't work as described.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Special Features */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Special Features
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Escrow Protection</p>
                  <p className="text-xs text-muted-foreground">Payment held until delivery confirmed</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Percent className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Save Up to 50%</p>
                  <p className="text-xs text-muted-foreground">Get coupons below face value</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Star className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Verified Sellers</p>
                  <p className="text-xs text-muted-foreground">All sellers are ID verified</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="my-listings">My Listings</TabsTrigger>
            <TabsTrigger value="my-orders">My Purchases</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search coupons or stores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4" />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Sell Coupon
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>List Your Coupon</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Title *</label>
                      <Input
                        placeholder="e.g., 20% off at Nike"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Store Name *</label>
                      <Input
                        placeholder="e.g., Nike, Amazon, Starbucks"
                        value={formData.store_name}
                        onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Original Value (€) *</label>
                        <Input
                          type="number"
                          placeholder="50.00"
                          value={formData.original_value}
                          onChange={(e) => setFormData({ ...formData, original_value: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Selling Price (€) *</label>
                        <Input
                          type="number"
                          placeholder="35.00"
                          value={formData.selling_price}
                          onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.filter(c => c.id !== "all").map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Coupon Type</label>
                        <Select value={formData.coupon_type} onValueChange={(v) => setFormData({ ...formData, coupon_type: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {couponTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Discount Code (optional)</label>
                      <Input
                        placeholder="e.g., SAVE20"
                        value={formData.discount_code}
                        onChange={(e) => setFormData({ ...formData, discount_code: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Will be revealed to buyer after purchase</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Expiry Date (optional)</label>
                      <Input
                        type="date"
                        value={formData.expiry_date}
                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        placeholder="Describe the coupon, any restrictions, etc."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Terms & Conditions</label>
                      <Textarea
                        placeholder="Any specific terms or conditions"
                        value={formData.terms_conditions}
                        onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Image (optional)</label>
                      {imagePreview ? (
                        <div className="relative w-full h-32 mt-2">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 mt-2">
                          <div className="flex flex-col items-center">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Upload image</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    <Button onClick={handleSubmit} className="w-full" disabled={uploading}>
                      {uploading ? "Listing..." : "List Coupon"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCoupons.map((coupon, index) => (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
                    onClick={() => openDetail(coupon)}
                  >
                    <div className="relative">
                      {coupon.image_url ? (
                        <img
                          src={coupon.image_url}
                          alt={coupon.title}
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                          <Ticket className="w-12 h-12 text-primary/50" />
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                        Save {getSavingsPercent(coupon.original_value, coupon.selling_price)}%
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Store className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">{coupon.store_name}</span>
                      </div>
                      <h3 className="font-semibold line-clamp-2 mb-2">{coupon.title}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-lg font-bold text-primary">€{coupon.selling_price.toFixed(2)}</span>
                          <span className="text-sm text-muted-foreground line-through ml-2">€{coupon.original_value.toFixed(2)}</span>
                        </div>
                      </div>
                      {coupon.expiry_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <Calendar className="w-3 h-3" />
                          <span>Expires: {new Date(coupon.expiry_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePurchase(coupon);
                          }}
                          disabled={isPurchasing}
                        >
                          Buy Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContact(coupon);
                          }}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredCoupons.length === 0 && (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No coupons found</h3>
                <p className="text-muted-foreground">Be the first to list a coupon!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-listings" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {coupons.filter(c => c.user_id === currentUserId).map((coupon) => (
                <Card key={coupon.id} className="overflow-hidden">
                  <div className="relative">
                    {coupon.image_url ? (
                      <img src={coupon.image_url} alt={coupon.title} className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                        <Ticket className="w-12 h-12 text-primary/50" />
                      </div>
                    )}
                    {coupon.is_sold && (
                      <Badge className="absolute top-2 right-2 bg-red-500">Sold</Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-2">{coupon.title}</h3>
                    <p className="text-lg font-bold text-primary">€{coupon.selling_price.toFixed(2)}</p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedCoupon(coupon);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {coupons.filter(c => c.user_id === currentUserId).length === 0 && (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                <p className="text-muted-foreground mb-4">Start selling your unused coupons!</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Sell Coupon
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-orders" className="mt-6">
            <div className="space-y-4">
              {myOrders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                      <Ticket className="w-8 h-8 text-primary/50" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{order.coupon_listings?.title}</h3>
                      <p className="text-sm text-muted-foreground">{order.coupon_listings?.store_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {getTimeAgo(order.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">€{order.amount.toFixed(2)}</p>
                    </div>
                  </div>
                </Card>
              ))}
              {myOrders.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
                  <p className="text-muted-foreground">Browse coupons to find great deals!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedCoupon?.title}</DialogTitle>
            </DialogHeader>
            {selectedCoupon && (
              <div className="space-y-4">
                {selectedCoupon.image_url && (
                  <img src={selectedCoupon.image_url} alt={selectedCoupon.title} className="w-full h-48 object-cover rounded-lg" />
                )}
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  <span className="font-medium">{selectedCoupon.store_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">€{selectedCoupon.selling_price.toFixed(2)}</span>
                    <span className="text-lg text-muted-foreground line-through ml-2">€{selectedCoupon.original_value.toFixed(2)}</span>
                  </div>
                  <Badge className="bg-green-500">
                    Save {getSavingsPercent(selectedCoupon.original_value, selectedCoupon.selling_price)}%
                  </Badge>
                </div>
                {selectedCoupon.expiry_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Expires: {new Date(selectedCoupon.expiry_date).toLocaleDateString()}</span>
                  </div>
                )}
                {selectedCoupon.description && (
                  <p className="text-muted-foreground">{selectedCoupon.description}</p>
                )}
                {selectedCoupon.terms_conditions && (
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    <p className="font-medium mb-1">Terms & Conditions:</p>
                    <p className="text-muted-foreground">{selectedCoupon.terms_conditions}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  {selectedCoupon.user_id !== currentUserId && (
                    <>
                      <Button className="flex-1" onClick={() => handlePurchase(selectedCoupon)} disabled={isPurchasing}>
                        {isPurchasing ? "Processing..." : "Buy Now"}
                      </Button>
                      <Button variant="outline" onClick={() => handleContact(selectedCoupon)}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                    </>
                  )}
                  {selectedCoupon.user_id === currentUserId && (
                    <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Contact Dialog */}
        <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contact Seller</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Write your message..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={4}
              />
              <Button onClick={handleSendMessage} className="w-full">
                Send Message
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The coupon listing will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default CouponMarketplace;
