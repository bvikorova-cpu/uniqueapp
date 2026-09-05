import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Home, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { AIRoomDesigner } from "@/components/home-decor/AIRoomDesigner";
import { motion } from "framer-motion";
import heroVideo from "@/assets/home-designer-hero.mp4.asset.json";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type ActiveView = "hub" | "ai-designer";

const HomeDesigner = () => {
  const [activeView, setActiveView] = useState<ActiveView>("hub");
  const [stats, setStats] = useState({ designs: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const d = await supabase.from("ai_room_designs").select("*", { count: "exact", head: true });
    setStats({ designs: d.count || 0 });
  };

  const tools = [
    { id: "ai-designer" as const, icon: Sparkles, title: "AI Room Designer", desc: "Transform rooms with AI", cost: "30 Credits" },
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
                AI-powered interior design — pay with AI credits, no subscription needed
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Tool Grid */}
        <div>
          <h2 className="text-2xl font-black mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Design Tool
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <p className="font-semibold text-primary">📸 Shoot it right</p>
                <p className="text-muted-foreground">Take a wide photo in daylight with the whole room visible — AI results get much better.</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-primary">🎨 Commit to a style</p>
                <p className="text-muted-foreground">Pick one clear direction (modern, Scandi, boho, industrial) instead of mixing everything.</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-primary">💡 Lighting Matters</p>
                <p className="text-muted-foreground">Layer ambient, task, and accent lighting — it changes a room more than furniture does.</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-primary">✨ Credits, Not Plans</p>
                <p className="text-muted-foreground">Pay-per-use with AI credits — one room render costs 30 credits.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomeDesigner;
