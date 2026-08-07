import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Building2, MapPin, Maximize2, Plus, Loader2, MessageSquare, Heart, Globe2,
  ShieldCheck, Sparkles, Coins, Search, KeyRound,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyDetailDialog } from "@/components/property/PropertyDetailDialog";
import { PropertyConversationsDialog } from "@/components/property/PropertyConversationsDialog";
import { usePropertyUnread } from "@/hooks/usePropertyUnread";
import { usePropertyExpiration } from "@/hooks/usePropertyExpiration";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const LISTING_CREDIT_COST = 25;

const HERO_VIDEO_URL = "/__l5e/assets-v1/876c9b9b-6ab6-49e9-82ea-b3995239c475/property-homepage-hero.mp4";
const HERO_VIDEO_SECONDS = 5;

const TRUST_POINTS = [
  { icon: Globe2, title: "Worldwide reach", desc: "One listing, buyers on every continent — no borders, no agencies." },
  { icon: Coins, title: "One flat fee", desc: `${LISTING_CREDIT_COST} credits (€10) per listing. No commission on your sale.` },
  { icon: ShieldCheck, title: "Direct & private", desc: "Talk to buyers yourself through encrypted in-app messages." },
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
  const [conversationsOpen, setConversationsOpen] = useState(false);
  const { totalUnread } = usePropertyUnread();
  const [searchFilters, setSearchFilters] = useState({
    priceMin: "", priceMax: "", location: "", area: "", rooms: "", propertyType: "any", availability: "active",
  });

  usePropertyExpiration();

  useEffect(() => {
    checkAuth();
    const payment = searchParams.get("payment");
    if (payment === "success") {
      toast({ title: "Listing published", description: "Your property is now live on the exchange." });
    }
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => { runSearch(); }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilters]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthenticated(!!session);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const runSearch = async () => {
    try {
      setLoading(true);
      let query = supabase.from("properties").select(`*, property_images(image_url, is_primary)`);
      const f = searchFilters;
      query = f.availability === "any" ? query : query.eq("status", f.availability);
      if (f.location) {
        const safe = f.location.replace(/[,()'"*]/g, " ").trim().slice(0, 100);
        if (safe) query = query.or(`city.ilike.%${safe}%,location.ilike.%${safe}%,address.ilike.%${safe}%`);
      }
      if (f.priceMin) query = query.gte("price", parseFloat(f.priceMin));
      if (f.priceMax) query = query.lte("price", parseFloat(f.priceMax));
      if (f.area) query = query.gte("area_sqm", parseInt(f.area));
      if (f.rooms) query = query.gte("rooms", parseInt(f.rooms));
      if (f.propertyType && f.propertyType !== "any") query = query.eq("property_type", f.propertyType);
      const { data, error } = await query
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProperty = async (id: string) => {
    if (!id) return;
    const { data, error } = await supabase
      .from("properties")
      .select(`*, property_images (image_url, is_primary), property_videos (video_url)`)
      .eq("id", id)
      .maybeSingle();
    if (error || !data) {
      toast({ title: "Error", description: "Failed to load property details", variant: "destructive" });
      return;
    }
    setSelectedProperty(data);
    setShowDetailDialog(true);
  };

  const handleCreateListing = () => {
    if (!isAuthenticated) {
      toast({ title: "Login Required", description: "Please sign in to create a listing", variant: "destructive" });
      navigate("/auth");
      return;
    }
    navigate("/property-submission");
  };

  return (
    <>
      <FloatingHowItWorks
        title="How the Property Exchange works"
        steps={[
          { title: "Search", desc: "Filter by location, price, size or type — results update live." },
          { title: "Open a listing", desc: "See full gallery, description and seller details." },
          { title: "Contact the seller", desc: "Message the owner directly inside the app. No middlemen." },
          { title: "Sell your own", desc: `Publish a listing for ${LISTING_CREDIT_COST} credits (€10) — no sale commission.` },
        ]}
      />
      <div className="min-h-screen bg-background">
        {/* Luxury hero */}
        <section className="relative overflow-hidden border-b border-border/40">
          <video
            src={HERO_VIDEO_URL}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.currentTime >= HERO_VIDEO_SECONDS) v.currentTime = 0;
            }}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/75 to-accent/20" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
          <div className="container relative mx-auto px-4 pt-28 pb-14 text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="outline" className="mb-5 border-primary/40 bg-background/60 backdrop-blur px-4 py-1.5 text-xs tracking-[0.2em] uppercase">
                <Sparkles className="w-3.5 h-3.5 mr-2" /> Private property exchange
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black leading-[1.05] bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                Buy &amp; sell property,<br className="hidden sm:block" /> anywhere in the world
              </h1>
              <p className="mt-5 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground">
                A clean, elegant classifieds portal for homes, villas, land and commercial
                space. Owners publish directly, buyers reach out directly — no agents,
                no commission, no noise.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Button size="lg" onClick={handleCreateListing} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                  <Plus className="mr-2 h-5 w-5" /> Post a listing · {LISTING_CREDIT_COST} credits
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/my-properties")}>
                  <KeyRound className="mr-2 h-5 w-5" /> My listings
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/property-favorites")}>
                  <Heart className="mr-2 h-5 w-5" /> Favorites
                </Button>
                <Button size="lg" variant="outline" onClick={() => setConversationsOpen(true)} className="relative">
                  <MessageSquare className="mr-2 h-5 w-5" /> Messages
                  {totalUnread > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center shadow-md">
                      {totalUnread > 9 ? "9+" : totalUnread}
                    </span>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <PropertyConversationsDialog open={conversationsOpen} onOpenChange={setConversationsOpen} />

          {/* Trust strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {TRUST_POINTS.map((p, i) => (
              <motion.div key={p.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                <Card className="h-full bg-card/70 backdrop-blur-xl border-border/40">
                  <CardContent className="p-6">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                      <p.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h3 className="font-bold mb-1">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">{p.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Search */}
          <Card className="mb-10 backdrop-blur-xl bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="font-black flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" /> Find your property
              </CardTitle>
              <CardDescription>Results update live as you type or select.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="City, district, address…" className="pl-9" value={searchFilters.location} onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price range (€)</label>
                  <div className="flex gap-2">
                    <Input placeholder="Min" type="number" value={searchFilters.priceMin} onChange={(e) => setSearchFilters({ ...searchFilters, priceMin: e.target.value })} />
                    <Input placeholder="Max" type="number" value={searchFilters.priceMax} onChange={(e) => setSearchFilters({ ...searchFilters, priceMax: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min area (m²)</label>
                  <div className="relative">
                    <Maximize2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Min area…" type="number" className="pl-9" value={searchFilters.area} onChange={(e) => setSearchFilters({ ...searchFilters, area: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Property type</label>
                  <Select value={searchFilters.propertyType} onValueChange={(v) => setSearchFilters({ ...searchFilters, propertyType: v })}>
                    <SelectTrigger><SelectValue placeholder="Any type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any type</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rooms (min)</label>
                  <Select value={searchFilters.rooms || "any"} onValueChange={(v) => setSearchFilters({ ...searchFilters, rooms: v === "any" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Availability</label>
                  <Select value={searchFilters.availability} onValueChange={(v) => setSearchFilters({ ...searchFilters, availability: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Available now</SelectItem>
                      <SelectItem value="pending">Reserved</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="any">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <Button variant="outline" className="w-full" onClick={() => setSearchFilters({ priceMin: "", priceMax: "", location: "", area: "", rooms: "", propertyType: "any", availability: "active" })}>
                    Reset filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Listings */}
          <div className="mb-14">
            <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
              <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                Properties for sale
              </h2>
              {!loading && (
                <p className="text-sm text-muted-foreground">{properties.length} listing{properties.length === 1 ? "" : "s"}</p>
              )}
            </div>
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

          {/* Seller CTA */}
          <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-card/80 to-accent/10 backdrop-blur-xl">
            <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
            <CardContent className="relative p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-black mb-3">Selling? One listing. One flat fee.</h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-2">
                Publish your property to a global audience for{" "}
                <strong className="text-foreground">{LISTING_CREDIT_COST} credits (€10)</strong>.
                Photos, full description, direct buyer messages — and{" "}
                <strong className="text-foreground">0% commission</strong> when you sell.
              </p>
              <p className="text-xs text-muted-foreground mb-7">Your listing stays online for 60 days and can be edited anytime.</p>
              <Button size="lg" onClick={handleCreateListing} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                <Plus className="mr-2 h-5 w-5" /> Post your listing
              </Button>
            </CardContent>
          </Card>
        </div>

        <PropertyDetailDialog
          property={selectedProperty}
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
        />
      </div>
    </>
  );
}
