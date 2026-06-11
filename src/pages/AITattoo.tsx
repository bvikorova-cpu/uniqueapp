import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, Download, Heart, Loader2, Eye, Blend, Clock, 
  Store, Palette, Image as ImageIcon, Grid3X3, Star, Crown,
  Gem, Zap, Award, BookOpen, RefreshCw, MapPin, ShieldCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TattooHero } from "@/components/tattoo/TattooHero";
import { TattooStyleMixer } from "@/components/tattoo/TattooStyleMixer";
import { TattooAgingSimulator } from "@/components/tattoo/TattooAgingSimulator";
import { TattooARPreview } from "@/components/tattoo/TattooARPreview";
import { TattooArtistMarketplace } from "@/components/tattoo/TattooArtistMarketplace";
import { TattooColorPalette } from "@/components/tattoo/TattooColorPalette";
import { TattooMeaningEncyclopedia } from "@/components/tattoo/TattooMeaningEncyclopedia";
import { TattooCoverUpGenerator } from "@/components/tattoo/TattooCoverUpGenerator";
import { TattooPainMap } from "@/components/tattoo/TattooPainMap";
import { TattooCareAssistant } from "@/components/tattoo/TattooCareAssistant";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
type ActiveView = "dashboard" | "generate" | "gallery" | "ar_preview" | "style_mixer" | "aging_sim" | "marketplace" | "color_palette" | "meaning" | "cover_up" | "pain_map" | "care";

interface TattooDesign {
  id: string;
  design_url: string;
  prompt: string;
  style: string;
  placement?: string;
  is_favorite: boolean;
  created_at: string;
}

const TOOLS: { id: ActiveView; icon: any; label: string; desc: string; cost: string; gradient: string }[] = [
  { id: "generate", icon: Sparkles, label: "AI Design Generator", desc: "Create bespoke tattoo artwork with AI", cost: "8 credits", gradient: "from-amber-500 to-yellow-600" },
  { id: "style_mixer", icon: Blend, label: "Style Mixer", desc: "Blend two styles into a unique fusion", cost: "12 credits", gradient: "from-purple-500 to-pink-500" },
  { id: "cover_up", icon: RefreshCw, label: "Cover-Up Generator", desc: "AI designs to overlay your old tattoo", cost: "15 credits", gradient: "from-teal-500 to-emerald-500" },
  { id: "ar_preview", icon: Eye, label: "AR Body Preview", desc: "See the design on your body in real-time", cost: "Free", gradient: "from-emerald-500 to-teal-500" },
  { id: "aging_sim", icon: Clock, label: "Aging Simulator", desc: "How your tattoo evolves over decades", cost: "10 credits", gradient: "from-blue-500 to-cyan-500" },
  { id: "color_palette", icon: Palette, label: "Color Palette AI", desc: "Perfect ink colors for your skin tone", cost: "6 credits", gradient: "from-pink-500 to-rose-500" },
  { id: "meaning", icon: BookOpen, label: "Meaning Encyclopedia", desc: "Symbolism & history of any motif", cost: "5 credits", gradient: "from-orange-500 to-red-500" },
  { id: "pain_map", icon: MapPin, label: "Pain Map", desc: "Detailed pain levels for every body part", cost: "3 credits", gradient: "from-red-500 to-orange-500" },
  { id: "care", icon: ShieldCheck, label: "Care Assistant", desc: "AI healing guide & aftercare checklist", cost: "5 credits", gradient: "from-green-500 to-lime-500" },
  { id: "gallery", icon: Grid3X3, label: "My Collection", desc: "Browse your personal design gallery", cost: "Free", gradient: "from-rose-500 to-orange-500" },
  { id: "marketplace", icon: Store, label: "Artist Marketplace", desc: "Connect with elite tattoo masters", cost: "Free", gradient: "from-indigo-500 to-violet-500" },
];

const styles = [
  { value: "realistic", label: "Realistic" }, { value: "tribal", label: "Tribal" },
  { value: "watercolor", label: "Watercolor" }, { value: "geometric", label: "Geometric" },
  { value: "blackwork", label: "Blackwork" }, { value: "traditional", label: "Traditional" },
  { value: "japanese", label: "Japanese" }, { value: "minimalist", label: "Minimalist" },
  { value: "neo-traditional", label: "Neo-Traditional" }, { value: "dotwork", label: "Dotwork" },
];

const placements = [
  { value: "arm", label: "Arm" }, { value: "shoulder", label: "Shoulder" },
  { value: "back", label: "Back" }, { value: "chest", label: "Chest" },
  { value: "leg", label: "Leg" }, { value: "wrist", label: "Wrist" },
  { value: "ankle", label: "Ankle" }, { value: "neck", label: "Neck" },
  { value: "ribcage", label: "Ribcage" }, { value: "forearm", label: "Forearm" },
];

const AITattoo = () => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [colorScheme, setColorScheme] = useState("blackgrey");
  const [placement, setPlacement] = useState("");
  const [size, setSize] = useState("medium");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [designs, setDesigns] = useState<TattooDesign[]>([]);

  const checkCredits = (required: number) => {
    if (credits.credits_remaining < required) {
      toast.error(`You need ${required} credits. Redirecting...`);
      setTimeout(() => navigate('/ai-credits'), 1500);
      return false;
    }
    return true;
  };

  const generateTattoo = async () => {
    if (!prompt) { toast.error("Please describe your tattoo design"); return; }
    if (!checkCredits(8)) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('tattoo-ai-tools', {
        body: { type: 'design', prompt, style, colorScheme, placement, size }
      });
      if (error) {
        const ctx: any = (error as any).context;
        if (ctx?.status === 402) {
          toast.error("Insufficient credits. Redirecting...");
          setTimeout(() => navigate('/ai-credits'), 1500);
          return;
        }
        if (ctx?.status === 429) { toast.error("Rate limit. Try again shortly."); return; }
        throw error;
      }
      setGeneratedImage(data.imageUrl);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('ai_tattoo_designs').insert({
          user_id: user.id, prompt, style, placement, size,
          color_scheme: colorScheme, design_url: data.imageUrl, credits_used: 8
        });
      }
      await refresh();
      toast.success("Tattoo design generated!");
    } catch (error: any) {
      toast.error(error.message || "Error generating tattoo");
    } finally {
      setLoading(false);
    }
  };

  const loadDesigns = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('ai_tattoo_designs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    setDesigns(data || []);
  };

  useEffect(() => {
    if (activeView === "gallery") loadDesigns();
  }, [activeView]);

  const toggleFavorite = async (id: string, current: boolean) => {
    await supabase.from('ai_tattoo_designs').update({ is_favorite: !current }).eq('id', id);
    loadDesigns();
    toast.success(!current ? "Added to favorites" : "Removed from favorites");
  };

  const downloadImage = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url; link.download = name;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const goBack = () => setActiveView("dashboard");

  const wrapView = (children: React.ReactNode) => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-20">{children}</main>
    </div>
  );

  if (activeView === "style_mixer") return wrapView(<TattooStyleMixer onBack={goBack} />);
  if (activeView === "aging_sim") return wrapView(<TattooAgingSimulator onBack={goBack} />);
  if (activeView === "ar_preview") return wrapView(<TattooARPreview onBack={goBack} />);
  if (activeView === "marketplace") return wrapView(<TattooArtistMarketplace onBack={goBack} />);
  if (activeView === "color_palette") return wrapView(<TattooColorPalette onBack={goBack} />);
  if (activeView === "meaning") return wrapView(<TattooMeaningEncyclopedia onBack={goBack} />);
  if (activeView === "cover_up") return wrapView(<TattooCoverUpGenerator onBack={goBack} />);
  if (activeView === "pain_map") return wrapView(<TattooPainMap onBack={goBack} />);
  if (activeView === "care") return wrapView(<TattooCareAssistant onBack={goBack} />);

  if (activeView === "generate") {
    return wrapView(
      <div className="animate-fade-in">
        <Button variant="ghost" onClick={goBack} className="gap-2 mb-4 text-amber-400 hover:text-amber-300">← Back to Atelier</Button>
        <Card className="p-6 max-w-2xl mx-auto bg-card/80 backdrop-blur-xl border-amber-500/20 shadow-[0_0_30px_rgba(212,175,55,0.08)]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">AI Design Generator</h2>
              <p className="text-muted-foreground text-sm">Bespoke tattoo creation powered by AI</p>
            </div>
            <span className="ml-auto text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">8 Credits</span>
          </motion.div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-amber-400/80 font-semibold">Describe Your Tattoo</Label>
              <Textarea placeholder="e.g., A phoenix rising from flames with detailed feathers, dark ink style..." value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className="mt-1 border-amber-500/20 focus:border-amber-500/50 bg-background/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-400/80 font-semibold text-xs">Style</Label>
                <Select value={style} onValueChange={setStyle}><SelectTrigger className="border-amber-500/20"><SelectValue /></SelectTrigger><SelectContent>{styles.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>
              </div>
              <div>
                <Label className="text-amber-400/80 font-semibold text-xs">Color Scheme</Label>
                <Select value={colorScheme} onValueChange={setColorScheme}><SelectTrigger className="border-amber-500/20"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="blackgrey">Black & Grey</SelectItem><SelectItem value="color">Full Color</SelectItem></SelectContent></Select>
              </div>
              <div>
                <Label className="text-amber-400/80 font-semibold text-xs">Placement</Label>
                <Select value={placement} onValueChange={setPlacement}><SelectTrigger className="border-amber-500/20"><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent>{placements.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent></Select>
              </div>
              <div>
                <Label className="text-amber-400/80 font-semibold text-xs">Size</Label>
                <Select value={size} onValueChange={setSize}><SelectTrigger className="border-amber-500/20"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="small">Small</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="large">Large</SelectItem></SelectContent></Select>
              </div>
            </div>
            <Button onClick={generateTattoo} disabled={loading} className="w-full gap-2 h-12 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold text-base shadow-lg shadow-amber-500/20">
              {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Generating...</> : <><Sparkles className="h-5 w-5" /> Generate Tattoo — 8 Credits</>}
            </Button>
            {generatedImage && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 space-y-4">
                <img src={generatedImage} alt="Generated tattoo" className="w-full rounded-xl border-2 border-amber-500/30 shadow-2xl shadow-amber-500/10" />
                <Button onClick={() => downloadImage(generatedImage, `tattoo-${Date.now()}.png`)} variant="outline" className="w-full gap-2 border-amber-500/30 hover:bg-amber-500/10"><Download className="h-4 w-4" /> Download High-Res</Button>
              </motion.div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (activeView === "gallery") {
    return wrapView(
      <div className="animate-fade-in">
        <Button variant="ghost" onClick={goBack} className="gap-2 mb-4 text-amber-400 hover:text-amber-300">← Back to Atelier</Button>
        <div className="flex items-center gap-3 mb-6">
          <Crown className="h-6 w-6 text-amber-400" />
          <h2 className="text-3xl font-black" style={{
            background: "linear-gradient(135deg, #D4AF37, #F5E6C8, #D4AF37)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>My Collection</h2>
        </div>
        {designs.length === 0 ? (
          <Card className="p-16 text-center bg-card/80 backdrop-blur-xl border-amber-500/10">
            <ImageIcon className="h-14 w-14 mx-auto text-amber-500/30 mb-4" />
            <p className="text-muted-foreground font-medium">No designs yet. Generate your first tattoo!</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {designs.map((design, i) => (
              <motion.div key={design.id} initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.05, type: "spring" }}>
                <Card className="overflow-hidden bg-card/80 backdrop-blur-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.12)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] border-amber-500/10 hover:border-amber-500/30">
                  <img src={design.design_url} alt={design.prompt} className="w-full h-64 object-cover" />
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{design.prompt}</p>
                    <div className="flex gap-2 text-xs mb-3">
                      <span className="bg-amber-500/10 text-amber-400 px-2 py-1 rounded-full border border-amber-500/20">{design.style}</span>
                      {design.placement && <span className="bg-secondary/50 px-2 py-1 rounded-full">{design.placement}</span>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleFavorite(design.id, design.is_favorite)} className="flex-1 border-amber-500/20 hover:bg-amber-500/10"><Heart className={`h-4 w-4 ${design.is_favorite ? 'fill-red-500 text-red-500' : ''}`} /></Button>
                      <Button size="sm" variant="outline" onClick={() => downloadImage(design.design_url, `tattoo-${design.id}.png`)} className="flex-1 border-amber-500/20 hover:bg-amber-500/10"><Download className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-20">
        <TattooHero />

        <HeroRewardedAd sectionKey="page_aitattoo" />

        {/* Engagement Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-5 bg-gradient-to-br from-amber-500/10 to-yellow-600/5 border-amber-500/20 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Gem className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-amber-400/60 uppercase tracking-wider">Available Credits</p>
                  <p className="text-3xl font-black">{credits.credits_remaining}</p>
                </div>
                <Button size="sm" onClick={() => navigate("/ai-credits")} className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-yellow-700">Buy More</Button>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-5 bg-card/80 backdrop-blur-xl border-amber-500/10 hover:shadow-[0_0_20px_rgba(212,175,55,0.08)] transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Studio Tools</p>
                  <p className="text-2xl font-black">11 Tools</p>
                  <p className="text-xs text-muted-foreground">Full creative suite</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-5 bg-card/80 backdrop-blur-xl border-amber-500/10 hover:shadow-[0_0_20px_rgba(212,175,55,0.08)] transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">AI Quality</p>
                  <p className="text-2xl font-black">Ultra HD</p>
                  <p className="text-xs text-muted-foreground">Professional grade output</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Tool Grid */}
        <div className="flex items-center gap-3 mb-5">
          <Crown className="h-5 w-5 text-amber-400" />
          <h2 className="text-2xl font-black" style={{
            background: "linear-gradient(135deg, #D4AF37, #F5E6C8, #D4AF37)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>Atelier Studio Tools</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {TOOLS.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.96 }}
            >
              <Card
                className="p-5 cursor-pointer bg-card/80 backdrop-blur-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.12)] transition-all duration-300 border-amber-500/10 hover:border-amber-500/30 h-full relative overflow-hidden group"
                onClick={() => setActiveView(tool.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                  <tool.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-black text-sm mb-1">{tool.label}</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{tool.desc}</p>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  tool.cost === "Free" 
                    ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" 
                    : "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                }`}>{tool.cost}</span>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <Card className="p-6 mb-8 bg-card/80 backdrop-blur-xl border-amber-500/10">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="h-5 w-5 text-amber-400" />
            <h2 className="text-xl font-black">How AI Tattoo Atelier Works</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Describe", desc: "Tell AI your dream tattoo in vivid detail", icon: "✍️" },
              { step: "2", title: "Customize", desc: "Choose style, colors, placement & size", icon: "🎨" },
              { step: "3", title: "Generate", desc: "AI creates your bespoke tattoo artwork", icon: "⚡" },
              { step: "4", title: "Preview", desc: "Use AR to visualize it on your body", icon: "👁️" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center p-4 rounded-xl bg-amber-500/[0.03] border border-amber-500/10"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 flex items-center justify-center mx-auto mb-2 text-black font-black text-sm shadow-lg shadow-amber-500/20">
                  {item.step}
                </div>
                <h4 className="font-black text-sm text-amber-400">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AITattoo;
