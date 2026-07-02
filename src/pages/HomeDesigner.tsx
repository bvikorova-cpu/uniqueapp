import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Sparkles, Home, ShoppingCart, Search, Store, ShoppingBag, Palette, Armchair, Building, Image, Eye, Video, Crown, Settings, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { AIRoomDesigner } from "@/components/home-decor/AIRoomDesigner";
import { ColorPaletteGenerator } from "@/components/home-decor/ColorPaletteGenerator";
import { FurnitureRecommender } from "@/components/home-decor/FurnitureRecommender";
import { VirtualRoomStaging } from "@/components/home-decor/VirtualRoomStaging";
import { BeforeAfterGallery } from "@/components/home-decor/BeforeAfterGallery";
import { DesignConsultations } from "@/components/home-decor/DesignConsultations";
import { useDecorSubscription } from "@/hooks/useDecorSubscription";
import { motion } from "framer-motion";
import heroVideo from "@/assets/home-designer-hero.mp4.asset.json";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type ActiveView = "hub" | "ai-designer" | "marketplace" | "sell" | "color-palette" | "furniture-recommender" | "virtual-staging" | "before-after" | "consultations" | "subscription" | "ar-preview";

interface DecorItem {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  condition: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
}

const HomeDesigner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, manageSubscription } = useDecorSubscription();
  const [activeView, setActiveView] = useState<ActiveView>("hub");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [marketplaceImagePreview, setMarketplaceImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [items, setItems] = useState<DecorItem[]>([]);
  const [formData, setFormData] = useState({
    title: "", price: "", description: "", category: "furniture", condition: "Like New",
  });

  // Stats
  const [stats, setStats] = useState({ designs: 0, items: 0, transformations: 0, palettes: 0 });

  useEffect(() => {
    checkAuth();
    loadItems();
    loadStats();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const loadStats = async () => {
    const [d, i, t, p] = await Promise.all([
      supabase.from("ai_room_designs").select("*", { count: "exact", head: true }),
      supabase.from("home_decor_items").select("*", { count: "exact", head: true }),
      supabase.from("home_transformations").select("*", { count: "exact", head: true }),
      supabase.from("home_color_palettes").select("*", { count: "exact", head: true }),
    ]);
    setStats({
      designs: d.count || 0,
      items: i.count || 0,
      transformations: t.count || 0,
      palettes: p.count || 0,
    });
  };

  const loadItems = async () => {
    const { data } = await supabase.from('home_decor_items').select('*').order('created_at', { ascending: false });
    setItems(data || []);
  };

  const handleMarketplaceImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setMarketplaceImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadMarketplaceImage = async () => {
    if (!imageFile || !currentUserId) return null;
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('home-decor-items').upload(fileName, imageFile);
    if (error) throw error;
    return supabase.storage.from('home-decor-items').getPublicUrl(fileName).data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!currentUserId) { navigate("/auth"); return; }
    if (!formData.title || !formData.price || !formData.description) {
      toast({ title: "Missing Information", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    try {
      setUploading(true);
      const imageUrl = await uploadMarketplaceImage();
      const { error } = await supabase.from('home_decor_items').insert({
        ...formData, price: parseFloat(formData.price), image_url: imageUrl, user_id: currentUserId,
      });
      if (error) throw error;
      toast({ title: "Success", description: "Item listed successfully" });
      setFormData({ title: "", price: "", description: "", category: "furniture", condition: "Like New" });
      setImageFile(null); setMarketplaceImagePreview("");
      loadItems();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handlePurchase = async (itemId: string) => {
    if (!currentUserId) { navigate("/auth"); return; }
    try {
      const { data, error } = await supabase.functions.invoke('create-marketplace-item-checkout', { body: { item_id: itemId } });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: "all", label: "All" }, { value: "furniture", label: "Furniture" },
    { value: "decor", label: "Decor" }, { value: "lighting", label: "Lighting" },
    { value: "textiles", label: "Textiles" }, { value: "art", label: "Art" },
    { value: "other", label: "Other" },
  ];

  const tools = [
    { id: "ai-designer" as const, icon: Sparkles, title: "AI Room Designer", desc: "Transform rooms with AI", cost: "Pro Sub" },
    { id: "color-palette" as const, icon: Palette, title: "Color Palette Generator", desc: "AI-analyzed color schemes", cost: "8 Credits" },
    { id: "furniture-recommender" as const, icon: Armchair, title: "Furniture Recommender", desc: "Personalized furniture picks", cost: "10 Credits" },
    { id: "virtual-staging" as const, icon: Building, title: "Virtual Room Staging", desc: "Stage rooms for real estate", cost: "12 Credits" },
    { id: "before-after" as const, icon: Image, title: "Before & After Gallery", desc: "Community transformations", cost: "Free" },
    { id: "marketplace" as const, icon: Store, title: "Decor Marketplace", desc: "Buy & sell unique decor", cost: "15% Commission" },
    { id: "sell" as const, icon: ShoppingBag, title: "Sell Your Items", desc: "List decor for sale", cost: "Free Listing" },
    { id: "ar-preview" as const, icon: Eye, title: "AR Try-Before-Buy", desc: "See items in your space", cost: "€0.99/preview" },
    { id: "consultations" as const, icon: Video, title: "Design Consultations", desc: "Video calls with designers", cost: "€29-€49" },
    { id: "subscription" as const, icon: Crown, title: "Pro Designer Plans", desc: "Unlock all AI features", cost: "€9.99/mo" },
  ];

  const statItems = [
    { label: "AI Designs", value: stats.designs },
    { label: "Items Listed", value: stats.items },
    { label: "Transformations", value: stats.transformations },
    { label: "Palettes", value: stats.palettes },
  ];

  // Sub-view renders
  if (activeView === "ai-designer") return (
    <div className="min-h-screen bg-background">
      <FloatingHowItWorks
        title="Home Designer"
        intro="AI interior designer \u2014 redesign any room from a photo."
        steps={[
          { title: "Photograph the room", desc: "Wide shot with good lighting." },
          { title: "Pick a style", desc: "Modern, Scandi, boho, luxury, industrial\u2026" },
          { title: "Generate designs", desc: "Multiple variants per run, 3\u20135 credits." },
          { title: "Get a shopping list", desc: "Real product suggestions with links." },
          { title: "Save projects", desc: "Compare before/after and share." }
        ]}
      /><Navbar />
      <div className="container mx-auto px-4 pt-20 pb-8">
        <Button variant="ghost" onClick={() => setActiveView("hub")} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Button>
        <AIRoomDesigner subscription={subscription} onDesignComplete={loadItems} />
      </div>
    </div>
  );

  if (activeView === "color-palette") return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container mx-auto px-4 pt-20 pb-8">
        <ColorPaletteGenerator subscription={subscription} onBack={() => setActiveView("hub")} />
      </div>
    </div>
  );

  if (activeView === "furniture-recommender") return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container mx-auto px-4 pt-20 pb-8">
        <FurnitureRecommender subscription={subscription} onBack={() => setActiveView("hub")} />
      </div>
    </div>
  );

  if (activeView === "virtual-staging") return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container mx-auto px-4 pt-20 pb-8">
        <VirtualRoomStaging subscription={subscription} onBack={() => setActiveView("hub")} />
      </div>
    </div>
  );

  if (activeView === "before-after") return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container mx-auto px-4 pt-20 pb-8">
        <BeforeAfterGallery onBack={() => setActiveView("hub")} />
      </div>
    </div>
  );

  if (activeView === "consultations") return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container mx-auto px-4 pt-20 pb-8">
        <Button variant="ghost" onClick={() => setActiveView("hub")} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Button>
        <DesignConsultations />
      </div>
    </div>
  );

  if (activeView === "subscription") {
    navigate("/home-decor-subscription");
    return null;
  }

  // Marketplace view
  if (activeView === "marketplace") return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container mx-auto px-4 pt-20 pb-8">
        <Button variant="ghost" onClick={() => setActiveView("hub")} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Button>
        <Card><CardHeader><CardTitle>Decor Marketplace</CardTitle><CardDescription>Browse and purchase unique home decor</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {filteredItems.length === 0 ? (
              <div className="text-center py-12"><ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No items found</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {item.image_url && <div className="aspect-video overflow-hidden"><img src={item.image_url} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform" /></div>}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div><CardTitle className="text-lg">{item.title}</CardTitle><Badge variant="secondary" className="mt-1">{item.category}</Badge></div>
                        <span className="text-2xl font-bold text-primary">€{item.price}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                      <p className="text-xs text-muted-foreground mb-4">Condition: {item.condition}</p>
                      <Button onClick={() => handlePurchase(item.id)} className="w-full" disabled={item.user_id === currentUserId}>
                        <ShoppingCart className="mr-2 h-4 w-4" />{item.user_id === currentUserId ? "Your Item" : "Purchase"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Sell view
  if (activeView === "sell") return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container mx-auto px-4 pt-20 pb-8">
        <Button variant="ghost" onClick={() => setActiveView("hub")} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Button>
        <Card><CardHeader><CardTitle>List Your Item</CardTitle><CardDescription>Add your home decor items to the marketplace</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Item title" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Price (€) *</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" /></div>
              <div className="space-y-2"><Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.filter(c => c.value !== "all").map((cat) => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Condition</Label>
              <Select value={formData.condition} onValueChange={(v) => setFormData({ ...formData, condition: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem><SelectItem value="Like New">Like New</SelectItem>
                  <SelectItem value="Good">Good</SelectItem><SelectItem value="Fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Description *</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your item..." rows={4} />
            </div>
            <div className="space-y-2"><Label>Photo</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {marketplaceImagePreview ? (
                  <div className="space-y-3">
                    <img src={marketplaceImagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                    <Button variant="outline" size="sm" onClick={() => { setImageFile(null); setMarketplaceImagePreview(""); }}>Change</Button>
                  </div>
                ) : (
                  <label className="cursor-pointer"><Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground">Click to upload</p>
                    <input type="file" accept="image/*" onChange={handleMarketplaceImageSelect} className="hidden" />
                  </label>
                )}
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={uploading} className="w-full">
              {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Listing...</> : <><ShoppingBag className="mr-2 h-4 w-4" /> List Item</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (activeView === "ar-preview") return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container mx-auto px-4 pt-20 pb-8">
        <Button variant="ghost" onClick={() => setActiveView("hub")} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Button>
        <Card className="backdrop-blur-xl bg-card/80"><CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5 text-primary" /> AR Try-Before-Buy</CardTitle></CardHeader>
          <CardContent className="text-center py-12">
            <Eye className="h-16 w-16 mx-auto mb-4 text-primary/50" />
            <h3 className="text-xl font-semibold mb-2">Augmented Reality Preview</h3>
            <p className="text-muted-foreground mb-4">See furniture and decor items in your room before buying. Available on individual product pages for €0.99 per preview.</p>
            <Button onClick={() => setActiveView("marketplace")}>Browse Marketplace</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Hub view
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Cinematic Video Hero */}
      <section className="relative w-full h-[60vh] min-h-[400px] overflow-hidden bg-black">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover brightness-[1.3] saturate-[1.2]">
          <source src={heroVideo.url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8 pb-6 sm:pb-10">
          <div className="container mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-2 mb-2">
                <Home className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-md" />
                <span className="text-white/80 text-sm drop-shadow-md">Dashboard</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white drop-shadow-lg"
                style={{ textShadow: "0 0 30px rgba(0,0,0,0.5)" }}>
                Home Designer & Marketplace
              </h1>
              <p className="text-white/80 text-sm sm:text-lg mt-2 max-w-2xl drop-shadow-md">
                AI-powered interior design tools, decor marketplace, and professional consultations
              </p>
            </motion.div>

            {/* 4-stat glassmorphic overlay */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-6">
              {statItems.map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.1 }}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-3 sm:p-4 text-center">
                  <p className="text-2xl sm:text-3xl font-black text-white">{stat.value || "—"}</p>
                  <p className="text-white/70 text-xs sm:text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Subscription badge */}
        {subscription.subscribed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
            <Badge variant="default" className="flex items-center gap-1">
              <Crown className="h-3 w-3" /> Pro Subscriber ({subscription.designs_used}/{subscription.designs_limit})
            </Badge>
            <Button onClick={manageSubscription} variant="outline" size="sm">
              <Settings className="mr-2 h-3 w-3" /> Manage
            </Button>
          </motion.div>
        )}

        {/* Tool Grid */}
        <div>
          <h2 className="text-2xl font-black mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Design Tools & Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools.map((tool, idx) => (
              <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Card className="cursor-pointer backdrop-blur-xl bg-card/80 border-primary/10 hover:border-primary/40 hover:shadow-xl transition-all h-full"
                  onClick={() => setActiveView(tool.id)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <tool.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{tool.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
                        <Badge variant="secondary" className="mt-2 text-xs">{tool.cost}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Enhancement Tips */}
        <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">💡 Tips to Make Your Space Amazing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="font-semibold text-primary">🎨 Color Theory</p>
                <p className="text-muted-foreground">Use the Color Palette Generator to find colors that create the right mood. The 60-30-10 rule works wonders.</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-primary">🪑 Smart Furniture</p>
                <p className="text-muted-foreground">Let AI recommend pieces that fit your space perfectly. Consider multi-functional furniture for small rooms.</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-primary">🏠 Staging for Sale</p>
                <p className="text-muted-foreground">Staged homes sell 73% faster. Use Virtual Staging to maximize your property's appeal.</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-primary">📸 Before & After</p>
                <p className="text-muted-foreground">Share your transformations with the community. Get inspired by others and earn recognition for your designs.</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-primary">💡 Lighting Matters</p>
                <p className="text-muted-foreground">Layer your lighting: ambient, task, and accent. AI can analyze your room and suggest the perfect setup.</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-primary">🛒 Marketplace Deals</p>
                <p className="text-muted-foreground">Find unique pre-owned decor at great prices or sell items you no longer need to fund your redesign.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomeDesigner;
