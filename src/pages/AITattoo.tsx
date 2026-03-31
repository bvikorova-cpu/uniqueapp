import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, Download, Heart, Loader2, Eye, Blend, Clock, 
  Store, Palette, Image as ImageIcon, Grid3X3, Star, Flame
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

type ActiveView = "dashboard" | "generate" | "gallery" | "ar_preview" | "style_mixer" | "aging_sim" | "marketplace";

interface TattooDesign {
  id: string;
  design_url: string;
  prompt: string;
  style: string;
  placement?: string;
  is_favorite: boolean;
  created_at: string;
}

const TOOLS = [
  { id: "generate" as ActiveView, icon: Sparkles, label: "Generate Design", desc: "AI-powered tattoo creation", cost: "8 credits", color: "from-amber-500 to-yellow-600" },
  { id: "style_mixer" as ActiveView, icon: Blend, label: "Style Mixer", desc: "Blend two styles into one", cost: "12 credits", color: "from-purple-500 to-pink-500" },
  { id: "ar_preview" as ActiveView, icon: Eye, label: "AR Preview", desc: "See tattoo on your body", cost: "Free", color: "from-emerald-500 to-teal-500" },
  { id: "aging_sim" as ActiveView, icon: Clock, label: "Aging Simulator", desc: "How it looks in 20 years", cost: "10 credits", color: "from-blue-500 to-cyan-500" },
  { id: "gallery" as ActiveView, icon: Grid3X3, label: "My Designs", desc: "Your design collection", cost: "Free", color: "from-rose-500 to-orange-500" },
  { id: "marketplace" as ActiveView, icon: Store, label: "Artist Marketplace", desc: "Find top tattoo artists", cost: "Free", color: "from-indigo-500 to-violet-500" },
];

const styles = [
  { value: "realistic", label: "Realistic" },
  { value: "tribal", label: "Tribal" },
  { value: "watercolor", label: "Watercolor" },
  { value: "geometric", label: "Geometric" },
  { value: "blackwork", label: "Blackwork" },
  { value: "traditional", label: "Traditional" },
  { value: "japanese", label: "Japanese" },
  { value: "minimalist", label: "Minimalist" },
  { value: "neo-traditional", label: "Neo-Traditional" },
  { value: "dotwork", label: "Dotwork" },
];

const placements = [
  { value: "arm", label: "Arm" },
  { value: "shoulder", label: "Shoulder" },
  { value: "back", label: "Back" },
  { value: "chest", label: "Chest" },
  { value: "leg", label: "Leg" },
  { value: "wrist", label: "Wrist" },
  { value: "ankle", label: "Ankle" },
  { value: "neck", label: "Neck" },
  { value: "ribcage", label: "Ribcage" },
  { value: "forearm", label: "Forearm" },
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
      const { data, error } = await supabase.functions.invoke('generate-tattoo', {
        body: { prompt, style, colorScheme, placement, size }
      });
      if (error) throw error;
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

  // Sub-views
  if (activeView === "style_mixer") return <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto px-4 py-8 mt-20"><TattooStyleMixer onBack={goBack} /></main></div>;
  if (activeView === "aging_sim") return <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto px-4 py-8 mt-20"><TattooAgingSimulator onBack={goBack} /></main></div>;
  if (activeView === "ar_preview") return <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto px-4 py-8 mt-20"><TattooARPreview onBack={goBack} /></main></div>;
  if (activeView === "marketplace") return <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto px-4 py-8 mt-20"><TattooArtistMarketplace onBack={goBack} /></main></div>;

  if (activeView === "generate") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 mt-20 animate-fade-in">
          <Button variant="ghost" onClick={goBack} className="gap-2 mb-4">← Back to Hub</Button>
          <Card className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-8 w-8 text-amber-500" />
              <div>
                <h2 className="text-2xl font-black">Generate Tattoo Design</h2>
                <p className="text-muted-foreground text-sm">AI-powered custom tattoo creation (8 credits)</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Describe Your Tattoo</Label>
                <Textarea placeholder="e.g., A phoenix rising from flames with detailed feathers" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Style</Label>
                  <Select value={style} onValueChange={setStyle}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{styles.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>
                </div>
                <div>
                  <Label>Color Scheme</Label>
                  <Select value={colorScheme} onValueChange={setColorScheme}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="blackgrey">Black & Grey</SelectItem><SelectItem value="color">Color</SelectItem></SelectContent></Select>
                </div>
                <div>
                  <Label>Placement</Label>
                  <Select value={placement} onValueChange={setPlacement}><SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent>{placements.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent></Select>
                </div>
                <div>
                  <Label>Size</Label>
                  <Select value={size} onValueChange={setSize}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="small">Small</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="large">Large</SelectItem></SelectContent></Select>
                </div>
              </div>
              <Button onClick={generateTattoo} disabled={loading} className="w-full gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Tattoo (8 credits)</>}
              </Button>
              {generatedImage && (
                <div className="mt-6 space-y-4">
                  <img src={generatedImage} alt="Generated tattoo" className="w-full rounded-xl border-2 border-amber-500/50" />
                  <Button onClick={() => downloadImage(generatedImage, `tattoo-${Date.now()}.png`)} variant="outline" className="w-full gap-2"><Download className="h-4 w-4" /> Download High-Res</Button>
                </div>
              )}
            </div>
          </Card>
        </main>
      </div>
    );
  }

  if (activeView === "gallery") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 mt-20 animate-fade-in">
          <Button variant="ghost" onClick={goBack} className="gap-2 mb-4">← Back to Hub</Button>
          <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">My Designs</h2>
          {designs.length === 0 ? (
            <Card className="p-12 text-center"><ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">No designs yet. Generate your first tattoo!</p></Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {designs.map((design, i) => (
                <motion.div key={design.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.97]">
                    <img src={design.design_url} alt={design.prompt} className="w-full h-64 object-cover" />
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{design.prompt}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                        <span className="bg-amber-500/10 px-2 py-1 rounded">{design.style}</span>
                        {design.placement && <span className="bg-secondary/50 px-2 py-1 rounded">{design.placement}</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => toggleFavorite(design.id, design.is_favorite)} className="flex-1"><Heart className={`h-4 w-4 ${design.is_favorite ? 'fill-red-500 text-red-500' : ''}`} /></Button>
                        <Button size="sm" variant="outline" onClick={() => downloadImage(design.design_url, `tattoo-${design.id}.png`)} className="flex-1"><Download className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-20">
        <TattooHero />

        {/* Credits & Engagement Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-r from-amber-500/10 to-yellow-600/10 border-amber-500/20">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Available Credits</p>
                <p className="text-3xl font-black">{credits.credits_remaining}</p>
              </div>
              <Button size="sm" variant="outline" className="ml-auto" onClick={() => navigate("/ai-credits")}>Buy More</Button>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Palette className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Design Styles</p>
                <p className="text-2xl font-black">10+ Styles</p>
                <p className="text-xs text-muted-foreground">Realistic to Geometric</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">AI Quality</p>
                <p className="text-2xl font-black">Ultra HD</p>
                <p className="text-xs text-muted-foreground">Professional grade</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tool Grid */}
        <h2 className="text-2xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Tattoo Studio Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {TOOLS.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                className="p-4 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.03] active:scale-[0.97] border-amber-500/10 h-full"
                onClick={() => setActiveView(tool.id)}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tool.color} flex items-center justify-center mb-3`}>
                  <tool.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-black text-sm mb-1">{tool.label}</h3>
                <p className="text-xs text-muted-foreground mb-2">{tool.desc}</p>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{tool.cost}</span>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <Card className="p-6 mb-8 border-amber-500/10">
          <h2 className="text-2xl font-black mb-4">How AI Tattoo Atelier Works</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Describe", desc: "Tell AI your dream tattoo design in detail" },
              { step: "2", title: "Customize", desc: "Choose style, colors, placement & size" },
              { step: "3", title: "Generate", desc: "AI creates your unique tattoo design" },
              { step: "4", title: "Preview", desc: "Use AR to see it on your body" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 flex items-center justify-center mx-auto mb-2 text-white font-black">
                  {item.step}
                </div>
                <h4 className="font-black text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AITattoo;
