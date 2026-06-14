import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, MapPin, Clock, Euro, Upload, X, Send, Trash2, ShoppingBag, Store, Wand2, DollarSign, FileText, Target, Eye, BarChart3, Compass, Flag, Video, ShieldCheck, ScrollText, Gavel } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ServiceOrderDialog } from "@/components/marketplace/ServiceOrderDialog";
import { MyOrders } from "@/components/marketplace/MyOrders";
import { MarketplaceHero } from "@/components/marketplace/MarketplaceHero";
import { MarketplaceToolCard } from "@/components/marketplace/MarketplaceToolCard";
import { ServiceOptimizerView } from "@/components/marketplace/views/ServiceOptimizerView";
import { PricingAdvisorView } from "@/components/marketplace/views/PricingAdvisorView";
import { ProposalWriterView } from "@/components/marketplace/views/ProposalWriterView";
import { ClientMatcherView } from "@/components/marketplace/views/ClientMatcherView";
import { PortfolioReviewView } from "@/components/marketplace/views/PortfolioReviewView";
import { MarketAnalysisView } from "@/components/marketplace/views/MarketAnalysisView";
import { GigRecommendationView } from "@/components/marketplace/views/GigRecommendationView";
import { MilestonePlannerView } from "@/components/marketplace/views/MilestonePlannerView";
import { VideoPortfolioView } from "@/components/marketplace/views/VideoPortfolioView";
import { ProviderBadgeView } from "@/components/marketplace/views/ProviderBadgeView";
import { ContractTemplateView } from "@/components/marketplace/views/ContractTemplateView";
import { RealtimeBiddingView } from "@/components/marketplace/views/RealtimeBiddingView";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Flame, TrendingUp, Award, Check } from "lucide-react";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

interface SkillOffering {
  id: string;
  title: string;
  description: string;
  category: string;
  price_per_hour: number | null;
  location: string | null;
  image_url: string | null;
  user_id: string;
  created_at: string;
  profiles: Profile | null;
}

const CATEGORIES = {
  construction: "Construction",
  repairs: "Repairs",
  cleaning: "Cleaning",
  gardening: "Gardening",
  technology: "Technology",
  teaching: "Education",
  creative: "Creative",
  other: "Other"
};

const AI_TOOLS = [
  {
    id: "service-optimizer",
    title: "AI Service Optimizer",
    description: "Optimize listings for maximum visibility and conversions",
    icon: Wand2,
    badge: "4 CR",
    gradient: "bg-gradient-to-r from-violet-500 to-purple-500",
    features: ["SEO-optimized titles", "Compelling descriptions", "Keyword suggestions"],
  },
  {
    id: "pricing-advisor",
    title: "AI Pricing Advisor",
    description: "Data-driven pricing recommendations for your services",
    icon: DollarSign,
    badge: "3 CR",
    gradient: "bg-gradient-to-r from-emerald-500 to-teal-500",
    features: ["Market comparison", "Package pricing", "Value analysis"],
  },
  {
    id: "proposal-writer",
    title: "AI Proposal Writer",
    description: "Write winning proposals that get you hired",
    icon: FileText,
    badge: "4 CR",
    gradient: "bg-gradient-to-r from-blue-500 to-indigo-500",
    features: ["Personalized hooks", "Clear deliverables", "Call to action"],
  },
  {
    id: "client-matcher",
    title: "AI Client Matcher",
    description: "Discover ideal client types and niches for your skills",
    icon: Target,
    badge: "5 CR",
    gradient: "bg-gradient-to-r from-orange-500 to-red-500",
    features: ["Niche discovery", "Outreach templates", "Channel strategy"],
  },
  {
    id: "portfolio-review",
    title: "AI Portfolio Review",
    description: "Professional profile and personal branding feedback",
    icon: Eye,
    badge: "4 CR",
    gradient: "bg-gradient-to-r from-pink-500 to-rose-500",
    features: ["Bio rewriting", "Brand positioning", "Testimonial tips"],
  },
  {
    id: "market-analysis",
    title: "AI Market Analysis",
    description: "Comprehensive market insights, trends and forecasts",
    icon: BarChart3,
    badge: "5 CR",
    gradient: "bg-gradient-to-r from-cyan-500 to-blue-500",
    features: ["Demand trends", "Competition level", "Pricing benchmarks"],
  },
  {
    id: "gig-recommendation",
    title: "AI Gig Recommendation",
    description: "Personalized gig opportunities matched to your profile",
    icon: Compass,
    badge: "5 CR",
    gradient: "bg-gradient-to-r from-amber-500 to-orange-500",
    features: ["Gig matching", "Earning estimates", "30-day action plan"],
  },
  {
    id: "milestone-planner",
    title: "AI Milestone Planner",
    description: "Escrow-ready project milestones & payment schedules",
    icon: Flag,
    badge: "4 CR",
    gradient: "bg-gradient-to-r from-teal-500 to-emerald-500",
    features: ["Payment schedules", "Acceptance criteria", "Risk mitigation"],
  },
  {
    id: "video-portfolio",
    title: "AI Video Portfolio Script",
    description: "Professional video intro script for your portfolio",
    icon: Video,
    badge: "4 CR",
    gradient: "bg-gradient-to-r from-purple-500 to-fuchsia-500",
    features: ["60s intro script", "Elevator pitch", "Recording tips"],
  },
  {
    id: "provider-badge",
    title: "AI Provider Verification",
    description: "Get AI-verified badge & quality score for your profile",
    icon: ShieldCheck,
    badge: "5 CR",
    gradient: "bg-gradient-to-r from-yellow-500 to-amber-500",
    features: ["Quality score", "Badge levels", "Trust signals"],
  },
  {
    id: "contract-template",
    title: "AI Smart Contracts",
    description: "AI-generated service agreements & legal templates",
    icon: ScrollText,
    badge: "4 CR",
    gradient: "bg-gradient-to-r from-slate-600 to-zinc-700",
    features: ["Full contract", "IP rights", "Payment terms"],
  },
  {
    id: "realtime-bidding",
    title: "AI Bidding Strategy",
    description: "Smart bidding analysis & competitive pricing strategy",
    icon: Gavel,
    badge: "5 CR",
    gradient: "bg-gradient-to-r from-red-500 to-rose-500",
    features: ["Optimal bid price", "Competitor analysis", "Negotiation tactics"],
  },
];

const Marketplace = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [offerings, setOfferings] = useState<SkillOffering[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState<SkillOffering | null>(null);
  const [orderOffering, setOrderOffering] = useState<SkillOffering | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [isSendingResponse, setIsSendingResponse] = useState(false);
  const [offeringToDelete, setOfferingToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("browse");
  const [activeView, setActiveView] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price_per_hour: "",
    location: ""
  });

  useEffect(() => {
    checkAuth();
    loadOfferings();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data: subscription } = await supabase
        .from("marketplace_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();
      setIsSubscribed(!!subscription);
    }
  };

  const loadOfferings = async () => {
    const { data: offeringsData, error } = await supabase
      .from("skill_offerings")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) { console.error("Error loading offerings:", error); return; }
    if (!offeringsData || offeringsData.length === 0) { setOfferings([]); return; }
    const userIds = [...new Set(offeringsData.map(o => o.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);
    const offeringsWithProfiles = offeringsData.map(offering => ({
      ...offering,
      profiles: profilesData?.find(p => p.id === offering.user_id) || null
    }));
    setOfferings(offeringsWithProfiles);
  };

  const handleSubscribe = async () => {
    if (!user) { toast({ title: "Login Required", description: "You must log in to subscribe", variant: "destructive" }); return; }
    const { error } = await supabase.from("marketplace_subscriptions").insert({ user_id: user.id, status: "active" });
    if (error) { toast({ title: "Error", description: "Failed to create subscription", variant: "destructive" }); return; }
    setIsSubscribed(true);
    toast({ title: "Success!", description: "Subscription activated" });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast({ title: "File too large", description: "Maximum image size is 5 MB", variant: "destructive" }); return; }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => { setImageFile(null); setImagePreview(null); };

  const handleSendResponse = async () => {
    if (!responseMessage.trim() || !selectedOffering || !user) return;
    setIsSendingResponse(true);
    const { error } = await supabase.from("marketplace_responses").insert({
      offering_id: selectedOffering.id, sender_id: user.id, receiver_id: selectedOffering.user_id, message: responseMessage.trim()
    });
    if (error) { toast({ title: "Error", description: "Failed to send message", variant: "destructive" }); setIsSendingResponse(false); return; }
    toast({ title: "Message sent", description: "Your interest has been sent to the service provider" });
    setResponseMessage(""); setSelectedOffering(null); setIsSendingResponse(false);
  };

  const handleDeleteOffering = async () => {
    if (!offeringToDelete) return;
    const { error } = await supabase.from("skill_offerings").delete().eq("id", offeringToDelete);
    if (error) { toast({ title: "Error", description: "Failed to delete offer", variant: "destructive" }); return; }
    toast({ title: "Success!", description: "Offer deleted" });
    setOfferingToDelete(null); setSelectedOffering(null); loadOfferings();
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user) return null;
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('marketplace-images').upload(fileName, imageFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('marketplace-images').getPublicUrl(fileName);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: "Upload error", description: "Failed to upload image", variant: "destructive" });
      return null;
    }
  };

  const handleCreateOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast({ title: "Login Required", description: "You must log in to create an offer", variant: "destructive" }); return; }
    setIsUploading(true);
    let imageUrl: string | null = null;
    if (imageFile) imageUrl = await uploadImage();
    const { error } = await supabase.from("skill_offerings").insert([{
      user_id: user.id, title: formData.title, description: formData.description,
      category: formData.category as any, price_per_hour: formData.price_per_hour ? parseFloat(formData.price_per_hour) : null,
      location: formData.location || null, image_url: imageUrl
    }]);
    setIsUploading(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Success!", description: "Your offer has been created" });
    setFormData({ title: "", description: "", category: "", price_per_hour: "", location: "" });
    setImageFile(null); setImagePreview(null); setShowCreateForm(false); loadOfferings();
  };

  // View routing for AI tools
  if (activeView) {
    const viewMap: Record<string, JSX.Element> = {
      "service-optimizer": <ServiceOptimizerView onBack={() => setActiveView(null)} />,
      "pricing-advisor": <PricingAdvisorView onBack={() => setActiveView(null)} />,
      "proposal-writer": <ProposalWriterView onBack={() => setActiveView(null)} />,
      "client-matcher": <ClientMatcherView onBack={() => setActiveView(null)} />,
      "portfolio-review": <PortfolioReviewView onBack={() => setActiveView(null)} />,
      "market-analysis": <MarketAnalysisView onBack={() => setActiveView(null)} />,
      "gig-recommendation": <GigRecommendationView onBack={() => setActiveView(null)} />,
      "milestone-planner": <MilestonePlannerView onBack={() => setActiveView(null)} />,
      "video-portfolio": <VideoPortfolioView onBack={() => setActiveView(null)} />,
      "provider-badge": <ProviderBadgeView onBack={() => setActiveView(null)} />,
      "contract-template": <ContractTemplateView onBack={() => setActiveView(null)} />,
      "realtime-bidding": <RealtimeBiddingView onBack={() => setActiveView(null)} />,
    };
    return (
      <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">{viewMap[activeView]}</div>
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <MarketplaceHero />


          <HeroRewardedAd sectionKey="page_marketplace" />

          {/* AI Tools Grid */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-12">
            <h2 className="text-xl sm:text-2xl font-black mb-1">🤖 AI-Powered Tools</h2>
            <p className="text-muted-foreground text-sm mb-6">Supercharge your marketplace presence with AI</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {AI_TOOLS.map((tool, i) => (
                <MarketplaceToolCard key={tool.id} tool={tool} onSelect={() => setActiveView(tool.id)} index={i} />
              ))}
            </div>
          </motion.div>

          {/* Engagement Row */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-5 w-5 text-orange-500" />
                <h3 className="font-bold text-sm">Platform Activity</h3>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {["M","T","W","T","F","S","S"].map((d, i) => (
                  <div key={i} className="text-center">
                    <span className="text-[10px] text-muted-foreground">{d}</span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center mt-1 text-xs font-medium ${
                      [true,true,false,true,true,true,false][i]
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-muted/30 text-muted-foreground"
                    }`}>
                      {[true,true,false,true,true,true,false][i] ? "✓" : "·"}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <h3 className="font-bold text-sm">Top Categories</h3>
              </div>
              <div className="space-y-2">
                {[{ name: "Technology", pct: 85 }, { name: "Creative", pct: 72 }, { name: "Education", pct: 58 }].map(c => (
                  <div key={c.name} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20">{c.name}</span>
                    <div className="flex-1 bg-muted/30 rounded-full h-2">
                      <div className="bg-primary/60 rounded-full h-2" style={{ width: `${c.pct}%` }} />
                    </div>
                    <span className="text-xs font-medium">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-violet-500" />
                <h3 className="font-bold text-sm">Key Benefits</h3>
              </div>
              <div className="space-y-2">
                {["Secure Stripe payments", "Only 15% commission", "Built-in chat & orders", "AI-powered tools"].map(b => (
                  <div key={b} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary flex-shrink-0" />
                    {b}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* How It Works */}
          <div className="mb-12">
            <h2 className="text-xl sm:text-2xl font-black mb-6 text-center">How It Works</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card/80 backdrop-blur-xl border-border/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">For Service Providers</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    { n: "1", t: "Create Your Offering", d: "Describe your service, set pricing, upload portfolio." },
                    { n: "2", t: "Receive Orders", d: "Get notified instantly when clients order." },
                    { n: "3", t: "Deliver & Get Paid", d: "Complete work, get approval, receive 85% payment." },
                  ].map(s => (
                    <li key={s.n} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">{s.n}</span>
                      <div>
                        <p className="font-medium text-sm">{s.t}</p>
                        <p className="text-xs text-muted-foreground">{s.d}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="bg-card/80 backdrop-blur-xl border-border/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">For Clients</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    { n: "1", t: "Browse Services", d: "Find verified professionals across categories." },
                    { n: "2", t: "Order & Pay Securely", d: "Pay through Stripe — funds held until approved." },
                    { n: "3", t: "Collaborate & Approve", d: "Chat with providers, review work, confirm." },
                  ].map(s => (
                    <li key={s.n} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-medium shrink-0">{s.n}</span>
                      <div>
                        <p className="font-medium text-sm">{s.t}</p>
                        <p className="text-xs text-muted-foreground">{s.d}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          {/* Featured Services Preview */}
          {offerings.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl sm:text-2xl font-black mb-2 text-center">Featured Services</h2>
              <p className="text-muted-foreground text-center text-sm mb-6">Browse available services from our community</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {offerings.slice(0, 6).map((offering) => (
                  <Card key={offering.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-card/80 backdrop-blur-xl border-border/50">
                    {offering.image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img src={offering.image_url} alt={offering.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {CATEGORIES[offering.category as keyof typeof CATEGORIES] || offering.category}
                      </Badge>
                      <h3 className="font-semibold line-clamp-1">{offering.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{offering.description}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium">{offering.profiles?.full_name?.[0] || "?"}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{offering.profiles?.full_name || "Provider"}</span>
                        </div>
                        {offering.price_per_hour && (
                          <span className="text-sm font-semibold text-primary">€{offering.price_per_hour}/hr</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Subscription CTA */}
          <div className="max-w-xl mx-auto mb-12">
            <Card className="border-primary/20 overflow-hidden bg-card/80 backdrop-blur-xl">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-1" />
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Start Selling Your Services</CardTitle>
                <CardDescription>Join our marketplace for just €2/month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {["Create unlimited service offerings", "Reach thousands of potential customers", "Secure payments with only 15% commission", "Built-in chat and order management", "AI-powered tools for optimization"].map(f => (
                    <li key={f} className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary text-xs">✓</span>
                      </span>
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-center pt-4">
                  <p className="text-4xl font-bold text-primary mb-4">€2<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                  <Button onClick={handleSubscribe} size="lg" className="w-full">Activate Subscription</Button>
                  <p className="text-xs text-muted-foreground mt-3">Cancel anytime • Secure payment via Stripe</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // SUBSCRIBED VIEW
  return (
    <>
      <SEO
        title="Skills Marketplace - Hire freelancers & sell services"
        description="Hire trusted freelancers or offer your services on Unique Marketplace. AI-powered pricing, proposals, contracts and matching."
        canonical="/marketplace"
      />
    <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <MarketplaceHero />

        <HeroRewardedAd sectionKey="page_marketplace" />

        {/* AI Tools Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
          <h2 className="text-xl sm:text-2xl font-black mb-1">🤖 AI-Powered Tools</h2>
          <p className="text-muted-foreground text-sm mb-4">Supercharge your marketplace presence</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_TOOLS.map((tool, i) => (
              <MarketplaceToolCard key={tool.id} tool={tool} onSelect={() => setActiveView(tool.id)} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <h2 className="text-xl font-black flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" /> Service Listings
            </h2>
            <p className="text-muted-foreground text-sm">Browse and manage service offerings</p>
          </div>
          <div className="flex gap-2">
            {user && (
              <Button variant="outline" onClick={() => setActiveTab("orders")}>
                <ShoppingBag className="h-4 w-4 mr-2" />My Orders
              </Button>
            )}
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? "Cancel" : "Add Offering"}
            </Button>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="mb-8 bg-card/80 backdrop-blur-xl border-border/50">
            <CardHeader><CardTitle>Create New Offering</CardTitle></CardHeader>
            <CardContent>
              <SellerConnectGate compact />
              <form onSubmit={handleCreateOffering} className="space-y-4 mt-4">
                <Input placeholder="Service Name" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                <Textarea placeholder="Service Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={4} />
                <div className="space-y-2">
                  <Label>Offer Image (optional)</Label>
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                      <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={removeImage}><X className="w-4 h-4" /></Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <Input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to select image</p>
                        <p className="text-xs text-muted-foreground mt-1">Maximum size: 5 MB</p>
                      </label>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORIES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="number" step="0.01" placeholder="Price per hour (€)" value={formData.price_per_hour} onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })} />
                  <Input placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                </div>
                <Button type="submit" className="w-full" disabled={isUploading}>{isUploading ? "Creating..." : "Create Offering"}</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Offerings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offerings.map((offering) => (
            <Card key={offering.id} className="hover:shadow-lg transition-shadow overflow-hidden bg-card/80 backdrop-blur-xl border-border/50">
              {offering.image_url && (
                <div className="w-full h-48 overflow-hidden">
                  <img src={offering.image_url} alt={offering.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-xl cursor-pointer hover:text-primary transition-colors flex-1" onClick={() => setSelectedOffering(offering)}>{offering.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{CATEGORIES[offering.category as keyof typeof CATEGORIES]}</Badge>
                    {user && offering.user_id === user.id && (
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setOfferingToDelete(offering.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <CardDescription>{offering.profiles?.full_name || "Anonymous user"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">{offering.description}</p>
                <div className="space-y-2 text-sm">
                  {offering.price_per_hour && (
                    <div className="flex items-center gap-2 text-primary"><Euro className="w-4 h-4" /><span className="font-semibold">{offering.price_per_hour}€/hr</span></div>
                  )}
                  {offering.location && (
                    <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" /><span>{offering.location}</span></div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4" /><span>{new Date(offering.created_at).toLocaleDateString('en-US')}</span></div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button className="flex-1" onClick={() => setSelectedOffering(offering)} variant="outline"><Send className="w-4 h-4 mr-2" />Message</Button>
                  {user && offering.user_id !== user.id && (
                    <Button className="flex-1" onClick={() => setOrderOffering(offering)}><ShoppingBag className="w-4 h-4 mr-2" />Order</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {offerings.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No offers yet</h3>
            <p className="text-muted-foreground">Be the first to offer your services!</p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={!!selectedOffering} onOpenChange={(open) => !open && setSelectedOffering(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOffering && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{selectedOffering.title}</DialogTitle>
                    <DialogDescription>
                      <Badge variant="secondary" className="mt-2">{CATEGORIES[selectedOffering.category as keyof typeof CATEGORIES]}</Badge>
                    </DialogDescription>
                  </div>
                  {user && selectedOffering.user_id === user.id && (
                    <Button variant="destructive" size="sm" onClick={() => setOfferingToDelete(selectedOffering.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />Delete
                    </Button>
                  )}
                </div>
              </DialogHeader>
              {selectedOffering.image_url && (
                <div className="w-full h-64 overflow-hidden rounded-lg">
                  <img src={selectedOffering.image_url} alt={selectedOffering.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="space-y-4">
                <div><h3 className="font-semibold mb-2">Description</h3><p className="text-muted-foreground whitespace-pre-wrap">{selectedOffering.description}</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedOffering.price_per_hour && <div className="flex items-center gap-2 text-primary"><Euro className="w-5 h-5" /><span className="font-semibold text-lg">{selectedOffering.price_per_hour}€/hr</span></div>}
                  {selectedOffering.location && <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-muted-foreground" /><span>{selectedOffering.location}</span></div>}
                  <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-5 h-5" /><span>{new Date(selectedOffering.created_at).toLocaleDateString('en-US')}</span></div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Respond to Offer</h3>
                  <div className="space-y-3">
                    <Textarea placeholder="Write a message to the service provider..." value={responseMessage} onChange={(e) => setResponseMessage(e.target.value)} rows={4} />
                    <Button onClick={handleSendResponse} disabled={!responseMessage.trim() || isSendingResponse} className="w-full">
                      <Send className="w-4 h-4 mr-2" />{isSendingResponse ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!offeringToDelete} onOpenChange={(open) => !open && setOfferingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Do you really want to delete this offer?</AlertDialogTitle>
            <AlertDialogDescription>This action is irreversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOffering} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {orderOffering && (
        <ServiceOrderDialog open={!!orderOffering} onOpenChange={(open) => !open && setOrderOffering(null)} offering={orderOffering} />
      )}

      {user && activeTab === "orders" && (
        <Dialog open={activeTab === "orders"} onOpenChange={() => setActiveTab("browse")}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>My Orders</DialogTitle></DialogHeader>
            <MyOrders userId={user.id} />
          </DialogContent>
        </Dialog>
      )}
    </div>
    </>
  );
};

export default Marketplace;
