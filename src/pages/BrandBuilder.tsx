import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { useAICredits } from "@/hooks/useAICredits";
import BrandNameGenerator from "@/components/brand/BrandNameGenerator";
import CompetitorAnalyzer from "@/components/brand/CompetitorAnalyzer";
import SocialMediaKit from "@/components/brand/SocialMediaKit";
import BrandStyleGuidePDF from "@/components/brand/BrandStyleGuidePDF";
import heroVideo from "@/assets/brand-builder-hero.mp4.asset.json";
import {
  Loader2, Sparkles, Palette, Lightbulb, Share2, Target, TrendingUp,
  Download, Play, Pause, Volume2, VolumeX, Zap, Crown, Star,
  FileText, Globe, CheckCircle, ArrowLeft,
} from "lucide-react";

type ActiveView = "hub" | "create" | "history" | "name-generator" | "competitor-analyzer" | "social-kit" | "style-guide";

const BrandBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { credits, loading: creditsLoading, refresh: refreshCredits } = useAICredits();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [activeView, setActiveView] = useState<ActiveView>("hub");
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [brandValues, setBrandValues] = useState("");
  const [brandKits, setBrandKits] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const creditsNum = typeof credits === "number" ? credits : credits?.credits_remaining ?? 0;

  useEffect(() => {
    checkAuth();
    loadBrandKits();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) navigate("/auth");
  };

  const loadBrandKits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("brand_kits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setBrandKits(data);
  };

  const toggleMute = () => { if (videoRef.current) { videoRef.current.muted = !isMuted; setIsMuted(!isMuted); } };
  const togglePlay = () => { if (videoRef.current) { if (isPlaying) videoRef.current.pause(); else videoRef.current.play(); setIsPlaying(!isPlaying); } };

  const handleGenerateBrand = async () => {
    if (!businessName || !businessType) {
      toast({ title: "Missing Information", description: "Please fill in business name and type", variant: "destructive" });
      return;
    }
    if (creditsNum < 15) {
      toast({ title: "Insufficient Credits", description: "You need 15 credits.", variant: "destructive" });
      setTimeout(() => navigate("/ai-credits-store"), 2000);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("generate-brand-kit", {
        body: { businessName, businessType, targetAudience, brandValues },
      });
      if (error) throw error;
      toast({ title: "✨ Brand Kit Generated!", description: `Brand identity for ${businessName} is ready` });
      setBusinessName(""); setBusinessType(""); setTargetAudience(""); setBrandValues("");
      await loadBrandKits();
      await refreshCredits();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to generate brand kit", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (creditsLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const tools = [
    { id: "create" as const, icon: Sparkles, title: "Brand Kit Creator", desc: "Complete brand identity with logo, colors & strategy", cost: "15 Credits", color: "text-primary" },
    { id: "history" as const, icon: Crown, title: "My Brand Kits", desc: "View and manage all your generated brand kits", cost: "Free", color: "text-amber-500" },
    { id: "name-generator" as const, icon: Globe, title: "AI Name Generator", desc: "10 creative brand names with domains & taglines", cost: "8 Credits", color: "text-cyan-500" },
    { id: "competitor-analyzer" as const, icon: Target, title: "Competitor Analyzer", desc: "Map competitive landscape & find your positioning", cost: "12 Credits", color: "text-destructive" },
    { id: "social-kit" as const, icon: Share2, title: "Social Media Kit", desc: "Bios, hashtags, schedules for 5 platforms", cost: "10 Credits", color: "text-blue-500" },
    { id: "style-guide" as const, icon: FileText, title: "Brand Style Guide", desc: "Export professional brand guidelines document", cost: "Free", color: "text-emerald-500" },
  ];

  const stats = [
    { label: "Brand Kits", value: brandKits.length.toString(), color: "text-primary" },
    { label: "Credits", value: creditsNum.toLocaleString(), color: "text-amber-400" },
    { label: "Tools", value: "6", color: "text-cyan-400" },
    { label: "Platforms", value: "5", color: "text-emerald-400" },
  ];

  // ======== SUB-VIEWS ========
  if (activeView === "name-generator") return (
    <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 sm:px-4 pt-16 sm:pt-24 pb-8 max-w-5xl">
      <BrandNameGenerator credits={creditsNum} onBack={() => setActiveView("hub")} onCreditsUsed={refreshCredits} />
    </div></div>
  );
  if (activeView === "competitor-analyzer") return (
    <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 sm:px-4 pt-16 sm:pt-24 pb-8 max-w-5xl">
      <CompetitorAnalyzer credits={creditsNum} onBack={() => setActiveView("hub")} onCreditsUsed={refreshCredits} />
    </div></div>
  );
  if (activeView === "social-kit") return (
    <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 sm:px-4 pt-16 sm:pt-24 pb-8 max-w-5xl">
      <SocialMediaKit credits={creditsNum} onBack={() => setActiveView("hub")} onCreditsUsed={refreshCredits} />
    </div></div>
  );
  if (activeView === "style-guide") return (
    <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 sm:px-4 pt-16 sm:pt-24 pb-8 max-w-5xl">
      <BrandStyleGuidePDF credits={creditsNum} onBack={() => setActiveView("hub")} />
    </div></div>
  );

  // ======== CREATE / HISTORY ========
  if (activeView === "create" || activeView === "history") return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-3 sm:px-4 pt-16 sm:pt-24 pb-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" onClick={() => setActiveView("hub")} className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Hub
          </Button>
        </motion.div>

        <Tabs defaultValue={activeView} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="create"><Lightbulb className="h-4 w-4 mr-2" /> Create Brand Kit</TabsTrigger>
            <TabsTrigger value="history"><TrendingUp className="h-4 w-4 mr-2" /> My Brand Kits</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Build Your Brand Identity</CardTitle>
                <CardDescription>Tell us about your business and we'll create a complete brand kit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Business Name *</Label>
                    <Input placeholder="e.g., TechStart Solutions" value={businessName} onChange={e => setBusinessName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Type *</Label>
                    <Input placeholder="e.g., Digital Marketing Agency" value={businessType} onChange={e => setBusinessType(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Input placeholder="e.g., Small business owners, entrepreneurs" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Brand Values</Label>
                  <Textarea placeholder="e.g., Innovation, Trust, Transparency" value={brandValues} onChange={e => setBrandValues(e.target.value)} rows={3} />
                </div>
                <Button onClick={handleGenerateBrand} disabled={loading || !businessName || !businessType} className="w-full" size="lg">
                  {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-5 w-5" /> Generate Brand Kit (15 Credits)</>}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-6">
              {brandKits.length === 0 ? (
                <Card><CardContent className="pt-6 text-center text-muted-foreground">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No brand kits yet. Create your first one!</p>
                </CardContent></Card>
              ) : brandKits.map((kit) => (
                <Card key={kit.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">{kit.business_name}</CardTitle>
                        <CardDescription className="text-base mt-1">{kit.business_type}</CardDescription>
                      </div>
                      <Badge variant="secondary">{new Date(kit.created_at).toLocaleDateString()}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {kit.logo_url && (
                      <div className="flex justify-center">
                        <img src={kit.logo_url} alt={`${kit.business_name} logo`} className="w-48 h-48 object-contain rounded-lg border p-4" />
                      </div>
                    )}
                    <div className="text-center space-y-2">
                      <p className="text-2xl font-bold text-primary">"{kit.slogan}"</p>
                      <p className="text-muted-foreground italic">{kit.tagline}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2"><Palette className="h-5 w-5" /> Brand Colors</h3>
                      <div className="flex flex-wrap gap-4">
                        {kit.color_palette?.map((color: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-12 h-12 rounded-lg border shadow-sm" style={{ backgroundColor: color.hex }} />
                            <div className="text-sm"><p className="font-medium">{color.name}</p><p className="text-muted-foreground">{color.hex}</p></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2"><Share2 className="h-5 w-5" /> Social Strategy</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(kit.social_media_strategy || {}).map(([p, s]) => (
                          <Card key={p}><CardContent className="pt-4">
                            <p className="font-medium capitalize mb-2">{p}</p>
                            <p className="text-sm text-muted-foreground">{s as string}</p>
                          </CardContent></Card>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Visual Identity</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {["typography", "imagery", "tone"].map(key => (
                          <Card key={key}><CardContent className="pt-4">
                            <p className="font-medium mb-2 capitalize">{key}</p>
                            <p className="text-sm text-muted-foreground">{kit.visual_identity?.[key] || "Not specified"}</p>
                          </CardContent></Card>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => {
                      const content = `BRAND KIT: ${kit.business_name}\n\nSLOGAN: ${kit.slogan}\nTAGLINE: ${kit.tagline}\nMISSION: ${kit.mission_statement || "N/A"}\nCOLORS: ${JSON.stringify(kit.color_palette, null, 2)}`;
                      const blob = new Blob([content], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = `${kit.business_name?.replace(/\s+/g, "_")}_brand_kit.txt`;
                      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                      toast({ title: "Downloaded!", description: "Brand kit exported." });
                    }}>
                      <Download className="mr-2 h-4 w-4" /> Download Brand Kit
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  // ======== HUB VIEW ========
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-3 sm:px-4 pt-16 sm:pt-20 pb-8 max-w-7xl">

        {/* ====== CINEMATIC VIDEO HERO ====== */}
        <div
          className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden mb-8 border border-border/40 bg-black"
          style={{ aspectRatio: "16/10", maxHeight: "76svh", minHeight: "500px" }}
        >
          <video
            ref={videoRef}
            src={heroVideo.url}
            autoPlay loop muted={isMuted} playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover brightness-[1.4] saturate-[1.15] contrast-[1.05]"
            style={{ willChange: "transform" }}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

          {/* Controls */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-2 z-20">
            <Button size="icon" variant="ghost" onClick={togglePlay} className="bg-black/40 hover:bg-black/60 text-white rounded-full h-9 w-9">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={toggleMute} className="bg-black/40 hover:bg-black/60 text-white rounded-full h-9 w-9">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Hero Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-5 pt-20 sm:p-6 md:p-10 z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 mb-4 px-5 py-1.5 bg-primary/25 backdrop-blur-sm rounded-full border border-primary/40">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-white font-semibold text-sm uppercase tracking-wider">Brand Builder</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15 }}
              className="text-[clamp(2.2rem,11vw,3.5rem)] md:text-6xl lg:text-7xl font-black mb-3 leading-[1.02] max-w-[14ch]"
              style={{
                WebkitTextStroke: "1.5px rgba(0,0,0,0.5)",
                textShadow: "0 0 40px rgba(168,85,247,0.3), 0 4px 15px rgba(0,0,0,0.8)",
                background: "linear-gradient(135deg, #fff 0%, #c084fc 40%, #a855f7 70%, #7c3aed 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}
            >
              Build Your Brand Empire
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="text-white/90 text-sm sm:text-base md:text-lg max-w-[38ch] mb-5 sm:mb-6 leading-relaxed"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
            >
              AI-powered brand identity creation — logos, colors, names, competitor analysis & social media strategy in seconds.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.45 }}
              className="grid grid-cols-4 gap-2.5 w-full max-w-md"
            >
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center px-3 py-2 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className={`text-lg font-bold text-white`}>{stat.value}</div>
                  <div className="text-white/60 text-[10px] sm:text-xs">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ====== TOOL GRID ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Brand Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.06 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
              >
                <Card
                  className="cursor-pointer h-full hover:shadow-xl transition-all border-border/50 hover:border-primary/40 bg-card/80 backdrop-blur-sm"
                  onClick={() => setActiveView(tool.id)}
                >
                  <CardContent className="pt-5 pb-4 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br from-${tool.color.replace("text-", "")}/20 to-transparent`}>
                        <tool.icon className={`h-5 w-5 ${tool.color}`} />
                      </div>
                      <Badge variant="outline" className="text-[10px]">{tool.cost}</Badge>
                    </div>
                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-1">{tool.title}</h3>
                    <p className="text-xs text-muted-foreground flex-1">{tool.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ====== WHAT YOU GET ====== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> What You Get</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["AI Logo Design", "Color Palette", "Slogan & Tagline", "Social Strategy", "Typography Guide", "Imagery Style", "Brand Tone", "Visual Identity"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BrandBuilder;
