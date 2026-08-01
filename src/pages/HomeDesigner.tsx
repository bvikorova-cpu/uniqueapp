import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Home, Palette, Armchair, Building, Image, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { AIRoomDesigner } from "@/components/home-decor/AIRoomDesigner";
import { ColorPaletteGenerator } from "@/components/home-decor/ColorPaletteGenerator";
import { FurnitureRecommender } from "@/components/home-decor/FurnitureRecommender";
import { VirtualRoomStaging } from "@/components/home-decor/VirtualRoomStaging";
import { BeforeAfterGallery } from "@/components/home-decor/BeforeAfterGallery";
import { motion } from "framer-motion";
import heroVideo from "@/assets/home-designer-hero.mp4.asset.json";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type ActiveView = "hub" | "ai-designer" | "color-palette" | "furniture-recommender" | "virtual-staging" | "before-after";

const HomeDesigner = () => {
  const [activeView, setActiveView] = useState<ActiveView>("hub");

  // Stats
  const [stats, setStats] = useState({ designs: 0, transformations: 0, palettes: 0, furniture: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [d, t, p, f] = await Promise.all([
      supabase.from("ai_room_designs").select("*", { count: "exact", head: true }),
      supabase.from("home_transformations").select("*", { count: "exact", head: true }),
      supabase.from("home_color_palettes").select("*", { count: "exact", head: true }),
      supabase.from("home_furniture_recommendations").select("*", { count: "exact", head: true }),
    ]);
    setStats({ designs: d.count || 0,
      transformations: t.count || 0,
      palettes: p.count || 0,
      furniture: f.count || 0 });
  };

  const tools = [
    { id: "ai-designer" as const, icon: Sparkles, title: "AI Room Designer", desc: "Transform rooms with AI", cost: "30 Credits" },
    { id: "color-palette" as const, icon: Palette, title: "Color Palette Generator", desc: "AI-analyzed color schemes", cost: "8 Credits" },
    { id: "furniture-recommender" as const, icon: Armchair, title: "Furniture Recommender", desc: "Personalized furniture picks", cost: "10 Credits" },
    { id: "virtual-staging" as const, icon: Building, title: "Virtual Room Staging", desc: "Stage rooms for real estate", cost: "12 Credits" },
    { id: "before-after" as const, icon: Image, title: "Before & After Gallery", desc: "Community transformations", cost: "Free" },
  ];

  const statItems = [
    { label: "AI Designs", value: stats.designs },
    { label: "Transformations", value: stats.transformations },
    { label: "Palettes", value: stats.palettes },
    { label: "Furniture Picks", value: stats.furniture },
  ];

  // Sub-view renders
  if (activeView === "ai-designer") return (
    <div className="min-h-screen bg-background">
      <FloatingHowItWorks
        title="Home Designer"
        intro="AI interior designer — redesign any room from a photo."
        steps={[
          { title: "Photograph the room", desc: "Wide shot with good lighting." },
          { title: "Pick a style", desc: "Modern, Scandi, boho, luxury, industrial…" },
          { title: "Generate the design", desc: "Each render costs 30 AI credits." },
          { title: "Download & save", desc: "Keep your redesign and compare before/after." }
        ]}
      /><Navbar />
      <div className="container mx-auto px-4 pt-20 pb-8">
        <Button variant="ghost" onClick={() => setActiveView("hub")} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Button>
        <AIRoomDesigner onDesignComplete={loadStats} />
      </div>
    </div>
  );

  if (activeView === "color-palette") return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container mx-auto px-4 pt-20 pb-8">
        <ColorPaletteGenerator subscription={null} onBack={() => setActiveView("hub")} />
      </div>
    </div>
  );

  if (activeView === "furniture-recommender") return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container mx-auto px-4 pt-20 pb-8">
        <FurnitureRecommender subscription={null} onBack={() => setActiveView("hub")} />
      </div>
    </div>
  );

  if (activeView === "virtual-staging") return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container mx-auto px-4 pt-20 pb-8">
        <VirtualRoomStaging subscription={null} onBack={() => setActiveView("hub")} />
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
                Home Designer
              </h1>
              <p className="text-white/80 text-sm sm:text-lg mt-2 max-w-2xl drop-shadow-md">
                AI-powered interior design tools — pay with AI credits, no subscription needed
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
                <p className="font-semibold text-primary">✨ Credits, Not Plans</p>
                <p className="text-muted-foreground">Every AI tool here is pay-per-use with AI credits — one room render costs 30 credits.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomeDesigner;
