import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Maximize2, BedDouble, DollarSign, Camera, Video, Megaphone, TrendingUp, Calculator, MessageSquare, Check, Plus, Sparkles, Loader2, Map, Brain, BarChart3, Wand2, Bell, ArrowLeft, Home, ImagePlus, GitCompare, Bot, FileText, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyDetailDialog } from "@/components/property/PropertyDetailDialog";
import { LeadBoostDialog } from "@/components/property/LeadBoostDialog";
import { PropertyHero } from "@/components/property/PropertyHero";
import { PropertyStreak } from "@/components/property/PropertyStreak";
import { PropertyProgress } from "@/components/property/PropertyProgress";
import { PropertyAchievements } from "@/components/property/PropertyAchievements";
import { PropertyMapView } from "@/components/property/PropertyMapView";
import { PropertyAIValuator } from "@/components/property/PropertyAIValuator";
import { PropertyMarketAnalytics } from "@/components/property/PropertyMarketAnalytics";
import { PropertyAIStaging } from "@/components/property/PropertyAIStaging";
import { PropertyMortgageCalc } from "@/components/property/PropertyMortgageCalc";
import { PropertyAlerts } from "@/components/property/PropertyAlerts";
import { PropertyNeighborhood } from "@/components/property/PropertyNeighborhood";
import { PropertyPhotoEnhancer } from "@/components/property/PropertyPhotoEnhancer";
import { PropertyComparison } from "@/components/property/PropertyComparison";
import { PropertyChatbot } from "@/components/property/PropertyChatbot";
import { PropertyDocManager } from "@/components/property/PropertyDocManager";
import { PropertyNegotiation } from "@/components/property/PropertyNegotiation";
import { PropertyParityPack } from "@/components/property/PropertyParityPack";
import { usePropertyExpiration } from "@/hooks/usePropertyExpiration";
import { motion } from "framer-motion";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
type ViewType = "hub" | "map" | "valuator" | "analytics" | "staging" | "mortgage" | "alerts" | "neighborhood" | "photos" | "compare" | "chatbot" | "documents" | "negotiate";

const LISTING_PACKAGES = [
  {
    id: "basic", name: "Basic Listing", price: 29, duration: "30 days",
    features: ["Photo gallery", "Property description", "Standard location on listings", "Email notifications"],
    icon: Camera, popular: false, gradient: "from-sky-500/10 to-blue-500/10", border: "border-sky-500/20"
  },
  {
    id: "premium", name: "Premium Listing", price: 79, duration: "60 days",
    features: ["Video tour upload support", "Top placement in search", "3D virtual walkthrough", "Priority support", "Featured badge"],
    icon: Video, popular: true, gradient: "from-primary/10 to-accent/10", border: "border-primary/20"
  },
  {
    id: "featured", name: "Featured Listing", price: 149, duration: "90 days",
    features: ["Homepage banner placement", "Social media sharing tools", "3D tour upload support", "Premium placement", "Priority customer support", "Advanced analytics dashboard"],
    icon: Megaphone, popular: false, gradient: "from-amber-500/10 to-yellow-500/10", border: "border-amber-500/20"
  }
];

const ADDITIONAL_SERVICES = [
  { id: "virtual_tour", name: "Virtual Tour Hosting", price: 99, description: "Add interactive 3D virtual tours to your property listings", icon: Video, active: true },
  { id: "lead_boost", name: "Lead Boost", price: 19, description: "Push listing to 1000+ potential buyers via email", icon: TrendingUp, active: true },
  { id: "home_decor", name: "Home Decor Marketplace", price: 7.99, description: "AI-powered room design + marketplace for decorations with AR preview", icon: Sparkles, isSubscription: true, link: "/home-decor" }
];

const FEATURE_CARDS = [
  { id: "map", icon: Map, label: "Property Map", desc: "Interactive map view", color: "from-sky-500 to-blue-600" },
  { id: "valuator", icon: Brain, label: "AI Valuator", desc: "Instant valuation", color: "from-purple-500 to-violet-600" },
  { id: "analytics", icon: BarChart3, label: "Market Analytics", desc: "Price trends", color: "from-emerald-500 to-green-600" },
  { id: "staging", icon: Wand2, label: "AI Staging", desc: "Virtual staging", color: "from-pink-500 to-rose-600" },
  { id: "mortgage", icon: Calculator, label: "Mortgage Calc", desc: "Payment calculator", color: "from-amber-500 to-orange-600" },
  { id: "alerts", icon: Bell, label: "Property Alerts", desc: "Smart notifications", color: "from-red-500 to-rose-600" },
  { id: "neighborhood", icon: Home, label: "Neighborhood", desc: "Area insights", color: "from-teal-500 to-emerald-600" },
  { id: "photos", icon: ImagePlus, label: "Photo Enhance", desc: "AI photo boost", color: "from-orange-500 to-pink-600" },
  { id: "compare", icon: GitCompare, label: "Compare", desc: "Side by side", color: "from-cyan-500 to-blue-600" },
  { id: "chatbot", icon: Bot, label: "AI Assistant", desc: "Ask anything", color: "from-violet-500 to-purple-600" },
  { id: "documents", icon: FileText, label: "Documents", desc: "Manage docs", color: "from-sky-500 to-blue-600" },
  { id: "negotiate", icon: Tag, label: "Negotiate", desc: "Price strategy", color: "from-amber-500 to-orange-600" },
];

export default function PropertyMarketplace() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [leadBoostDialogOpen, setLeadBoostDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>("hub");
  const [searchFilters, setSearchFilters] = useState({
    priceMin: "", priceMax: "", location: "", area: "", rooms: "", propertyType: "any", listingType: "any", availability: "active"
  });

  usePropertyExpiration();

  useEffect(() => {
    checkAuth();
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      toast({ title: "Payment Successful!", description: "Your listing has been activated." });
    } else if (payment === 'cancelled' || payment === 'canceled') {
      toast({ title: "Payment Canceled", description: "You can complete the payment later.", variant: "destructive" });
    }
  }, [searchParams]);

  // Debounced real-time filter search
  useEffect(() => {
    const t = setTimeout(() => { runSearch(); }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilters]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const runSearch = async () => {
    try {
      setLoading(true);
      let query = supabase.from('properties').select(`*, property_images(image_url, is_primary)`);
      const f = searchFilters;
      query = f.availability === 'any' ? query : query.eq('status', f.availability);
      if (f.location) query = query.or(`city.ilike.%${f.location}%,location.ilike.%${f.location}%,address.ilike.%${f.location}%`);
      if (f.priceMin) query = query.gte('price', parseFloat(f.priceMin));
      if (f.priceMax) query = query.lte('price', parseFloat(f.priceMax));
      if (f.area) query = query.gte('area_sqm', parseInt(f.area));
      if (f.rooms) query = query.gte('rooms', parseInt(f.rooms));
      if (f.propertyType && f.propertyType !== 'any') query = query.eq('property_type', f.propertyType);
      if (f.listingType && f.listingType !== 'any') query = query.eq('listing_type', f.listingType);
      const { data, error } = await query.order('is_featured', { ascending: false }).order('created_at', { ascending: false }).limit(60);
      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProperty = async (id: string) => {
    const { data, error } = await supabase
      .from('properties')
      .select(`*, property_images (image_url, is_primary), property_videos (video_url)`)
      .eq('id', id)
      .single();
    if (error) { toast({ title: "Error", description: "Failed to load property details", variant: "destructive" }); return; }
    setSelectedProperty(data);
    setShowDetailDialog(true);
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      let query = supabase.from('properties').select(`*, property_images(image_url, is_primary)`).eq('status', 'active');
      if (searchFilters.location) query = query.or(`city.ilike.%${searchFilters.location}%,location.ilike.%${searchFilters.location}%`);
      if (searchFilters.priceMin) query = query.gte('price', parseFloat(searchFilters.priceMin));
      if (searchFilters.priceMax) query = query.lte('price', parseFloat(searchFilters.priceMax));
      if (searchFilters.area) query = query.gte('area_sqm', parseInt(searchFilters.area));
      if (searchFilters.rooms) query = query.gte('rooms', parseInt(searchFilters.rooms));
      const { data, error } = await query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = () => {
    if (!isAuthenticated) {
      toast({ title: "Login Required", description: "Please sign in to create a listing", variant: "destructive" });
      navigate("/auth");
      return;
    }
    navigate("/property-submission");
  };

  const handlePurchaseService = async (serviceId: string, price: number, link?: string) => {
    if (link) { navigate(link); return; }
    if (serviceId === "lead_boost") { setLeadBoostDialogOpen(true); return; }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Sign in required", description: "Please sign in to continue with the purchase.", variant: "destructive" });
        navigate("/auth");
        return;
      }
      // Map UI service id → backend product key (+ optional package).
      const isPackage = ["basic", "premium", "featured"].includes(serviceId);
      const body: Record<string, unknown> = isPackage
        ? { product: "property_listing", packageType: serviceId }
        : serviceId === "virtual_tour"
        ? { product: "virtual_tour" }
        : { product: serviceId };

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          ...body,
          successUrl: `${window.location.origin}/property-marketplace?payment=success`,
          cancelUrl: `${window.location.origin}/property-marketplace?payment=canceled`,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        toast({ title: "Payment", description: "Checkout is being set up. Please try again.", variant: "destructive" });
      }
    } catch (err) {
      console.error("Property checkout error:", err);
      toast({ title: "Payment unavailable", description: "Could not start checkout. Please try again.", variant: "destructive" });
    }
  };

  // Sub-view rendering
  const wrap = (Component: React.FC<{ onBack: () => void }>) => (
    <div className="min-h-screen bg-background"><div className="container mx-auto px-4 py-24"><Component onBack={() => setActiveView("hub")} /></div></div>
  );
  if (activeView === "map") return wrap(PropertyMapView);
  if (activeView === "valuator") return wrap(PropertyAIValuator);
  if (activeView === "analytics") return wrap(PropertyMarketAnalytics);
  if (activeView === "staging") return wrap(PropertyAIStaging);
  if (activeView === "mortgage") return wrap(PropertyMortgageCalc);
  if (activeView === "alerts") return wrap(PropertyAlerts);
  if (activeView === "neighborhood") return wrap(PropertyNeighborhood);
  if (activeView === "photos") return wrap(PropertyPhotoEnhancer);
  if (activeView === "compare") return wrap(PropertyComparison);
  if (activeView === "chatbot") return wrap(PropertyChatbot);
  if (activeView === "documents") return wrap(PropertyDocManager);
  if (activeView === "negotiate") return wrap(PropertyNegotiation);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-24">
        {/* Hero */}
        <PropertyHero />

        <HeroRewardedAd sectionKey="page_propertymarketplace" />

        {/* Engagement Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <PropertyStreak />
          <PropertyProgress />
          <PropertyAchievements />
        </div>

        {/* Parity Pack — 8 advanced AI tools */}
        <div className="mb-8">
          <PropertyParityPack />
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {FEATURE_CARDS.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveView(card.id as ViewType)}
              className="cursor-pointer"
            >
              <Card className="bg-card/60 backdrop-blur-xl border-border/30 hover:border-primary/30 transition-all h-full">
                <CardContent className="p-4 text-center">
                  <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-2`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-bold">{card.label}</p>
                  <p className="text-[10px] text-muted-foreground">{card.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Add Listing CTA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Button size="lg" onClick={handleCreateListing} className="bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-90 text-white">
            <Plus className="mr-2 h-5 w-5" /> Add Listing
          </Button>
        </motion.div>

        {/* About Section */}
        <Card className="mb-8 backdrop-blur-xl bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              What is Property Marketplace?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Property Marketplace is a comprehensive real estate platform designed for both professional agents and private sellers.
              Whether you're looking to buy your dream home, sell a property, or expand your real estate portfolio, our platform
              provides all the tools you need for a successful transaction.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-sky-500" /> How to List Your Property
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li><strong>Sign in</strong> to your account or create a new one</li>
                  <li>Click <strong>"Add Listing"</strong> button above</li>
                  <li>Fill in property details: location, price, area, rooms, and description</li>
                  <li>Upload <strong>high-quality photos</strong> of your property</li>
                  <li>Choose a <strong>listing package</strong> (Basic, Premium, or Featured)</li>
                  <li>Complete payment and your listing goes live immediately</li>
                </ol>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-sky-500" /> How to Find a Property
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Use the <strong>search filters</strong> below to narrow your search</li>
                  <li>Filter by <strong>location, price range, area, and number of rooms</strong></li>
                  <li>Browse through available listings in the <strong>property grid</strong></li>
                  <li>Click on any property to view <strong>full details and photos</strong></li>
                  <li>Contact the seller directly through the <strong>built-in messaging system</strong></li>
                  <li>Save favorite properties to your <strong>wishlist</strong> for later</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Search */}
        <Card className="mb-8 backdrop-blur-xl bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Find Your Perfect Property</CardTitle>
            <CardDescription>Use advanced filters to search properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="City, district..." className="pl-9" value={searchFilters.location} onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price Range</label>
                <div className="flex gap-2">
                  <Input placeholder="Min €" type="number" value={searchFilters.priceMin} onChange={(e) => setSearchFilters({...searchFilters, priceMin: e.target.value})} />
                  <Input placeholder="Max €" type="number" value={searchFilters.priceMax} onChange={(e) => setSearchFilters({...searchFilters, priceMax: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Area (m²)</label>
                <div className="relative">
                  <Maximize2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Min area..." type="number" className="pl-9" value={searchFilters.area} onChange={(e) => setSearchFilters({...searchFilters, area: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rooms</label>
                <Select value={searchFilters.rooms} onValueChange={(value) => setSearchFilters({...searchFilters, rooms: value})}>
                  <SelectTrigger><SelectValue placeholder="Number of rooms" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 room</SelectItem>
                    <SelectItem value="2">2 rooms</SelectItem>
                    <SelectItem value="3">3 rooms</SelectItem>
                    <SelectItem value="4">4+ rooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium invisible">Search</label>
                <Button className="w-full bg-gradient-to-r from-sky-500 to-blue-600" onClick={handleSearch}>Search Properties</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-black mb-8 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Available Properties</h2>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} onViewDetails={handleViewProperty} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center backdrop-blur-xl bg-card/80">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">No properties found</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search filters</p>
            </Card>
          )}
        </div>

        {/* Listing Packages */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-center mb-8 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Listing Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LISTING_PACKAGES.map((pkg) => {
              const Icon = pkg.icon;
              return (
                <Card key={pkg.id} className={`relative backdrop-blur-xl bg-card/80 ${pkg.popular ? 'border-primary shadow-lg scale-105' : `border-border/50`} bg-gradient-to-br ${pkg.gradient} ${pkg.border}`}>
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-black">{pkg.name}</CardTitle>
                    <div className="text-4xl font-black bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent mt-4">€{pkg.price}</div>
                    <CardDescription className="text-base">{pkg.duration}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${pkg.popular ? "bg-gradient-to-r from-primary to-accent text-primary-foreground" : ""}`} 
                      variant={pkg.popular ? "default" : "outline"}
                      onClick={() => handlePurchaseService(pkg.id, pkg.price)}
                    >
                      Choose Plan
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Additional Services */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-center mb-8 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Additional Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ADDITIONAL_SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.id} className="backdrop-blur-xl bg-card/80 border-border/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="p-3 bg-sky-500/10 rounded-lg">
                          <Icon className="h-6 w-6 text-sky-500" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-black">{service.name}</CardTitle>
                          <CardDescription className="mt-2">{service.description}</CardDescription>
                          {service.isSubscription && <Badge variant="secondary" className="mt-2">€{service.price}/month</Badge>}
                        </div>
                      </div>
                      <div className="text-2xl font-black text-sky-500">
                        {service.isSubscription ? '' : `€${service.price}`}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => handlePurchaseService(service.id, service.price, service.link)} className="w-full" variant="outline" disabled={!service.link && !service.active}>
                      {service.link ? "Explore" : service.active ? "Learn More" : "Currently Unavailable"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Commission & Mortgage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="backdrop-blur-xl bg-card/80 border-border/50 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div>
                  <CardTitle className="font-black">Commission Rate</CardTitle>
                  <CardDescription>Fair and transparent pricing</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-background/50 rounded-lg border border-border/30">
                  <p className="text-2xl font-black text-green-500">1% Commission</p>
                  <p className="text-sm text-muted-foreground mt-1">or minimum €500 per sale</p>
                </div>
                <p className="text-sm">Only pay when your property sells successfully. No hidden fees, complete transparency.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-card/80 border-border/50 bg-gradient-to-br from-sky-500/10 to-blue-500/10 border-sky-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Calculator className="h-8 w-8 text-sky-500" />
                <div>
                  <CardTitle className="font-black">Quick Mortgage Calc</CardTitle>
                  <CardDescription>Estimate monthly payments</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input placeholder="Property price" type="number" />
                <Input placeholder="Down payment" type="number" />
                <Input placeholder="Interest rate %" type="number" step="0.1" />
                <Button variant="outline" className="w-full" onClick={() => setActiveView("mortgage")}>
                  <Calculator className="w-4 h-4 mr-2" /> Open Full Calculator
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Features */}
        <Card className="backdrop-blur-xl bg-card/80 border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Platform Features</CardTitle>
            <CardDescription>Everything you need for successful property sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Video, title: "Virtual Tours & 360°", desc: "Immersive property viewing experience", color: "text-sky-500", bg: "bg-sky-500/10" },
                { icon: MessageSquare, title: "Direct Messaging", desc: "Connect directly with agents and buyers", color: "text-blue-500", bg: "bg-blue-500/10" },
                { icon: Calculator, title: "Financial Tools", desc: "Built-in mortgage and ROI calculators", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { icon: TrendingUp, title: "Market Analytics", desc: "Real-time market trends and insights", color: "text-amber-500", bg: "bg-amber-500/10" },
              ].map((feature, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="text-center space-y-3">
                  <div className={`mx-auto p-3 ${feature.bg} rounded-full w-fit`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <PropertyDetailDialog property={selectedProperty} open={showDetailDialog} onOpenChange={setShowDetailDialog} />
      <LeadBoostDialog open={leadBoostDialogOpen} onOpenChange={setLeadBoostDialogOpen} />
    </div>
  );
}
