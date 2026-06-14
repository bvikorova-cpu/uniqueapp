import { useState, useEffect } from "react";
import { getReadableUrl } from "@/lib/storageSigned";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Wand2, Image as ImageIcon, Upload, ArrowLeft, Flame, Trophy,
  TrendingUp, Search, Scissors, Camera, Star, Palette, ShoppingBag, Users,
  ScanLine, Layers, Move, Maximize
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { usePhotoCredits } from "@/hooks/usePhotoCredits";
import { toast } from "sonner";
import heroVideo from "@/assets/photo-restoration-hero.mp4.asset.json";

// Sub-modules
import { BackgroundRemoval } from "@/components/photo-restoration/BackgroundRemoval";
import { FaceEnhancement } from "@/components/photo-restoration/FaceEnhancement";
import { ColorizationPro } from "@/components/photo-restoration/ColorizationPro";
import { PhotoGallery } from "@/components/photo-restoration/PhotoGallery";
import { DamageDetection } from "@/components/photo-restoration/DamageDetection";
import { BatchProcessing } from "@/components/photo-restoration/BatchProcessing";
import { ComparisonSlider } from "@/components/photo-restoration/ComparisonSlider";
import { AIUpscaling } from "@/components/photo-restoration/AIUpscaling";

type ActiveView = "hub" | "colorize" | "repair" | "enhance" | "background-removal" | "face-enhancement" | "colorization-pro" | "gallery" | "credits" | "damage-detection" | "batch-processing" | "comparison-slider" | "ai-upscaling";

const PhotoRestoration = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>("hub");
  const [stats, setStats] = useState({ restorations: 0, colorizations: 0, enhancements: 0, removals: 0 });
  const { credits, purchaseCredits } = usePhotoCredits();

  // Classic restore states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [restoredUrl, setRestoredUrl] = useState("");
  const { restorePhoto, isRestoring } = usePhotoCredits();

  // Photo credits payment verification (after Stripe redirect)
  useEffect(() => {
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get("session_id");
    const productType = url.searchParams.get("product_type");
    const status = url.searchParams.get("payment");
    if (status === "success" && sessionId && productType === "photo_credits") {
      (async () => {
        try {
          const { data, error } = await supabase.functions.invoke("verify-payment", {
            body: { session_id: sessionId, product_type: "photo_credits" },
          });
          if (error) throw error;
          if ((data as any)?.success || (data as any)?.status === "paid") {
            toast.success("Photo credits added to your account!");
          }
        } catch (e: any) {
          console.error("verify-payment error", e);
          toast.error("Could not verify payment. Contact support if credits are missing.");
        } finally {
          ["session_id", "product_type", "payment"].forEach((k) => url.searchParams.delete(k));
          window.history.replaceState({}, "", url.toString());
        }
      })();
    }
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [r, c] = await Promise.all([
        supabase.from("old_photos").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        (supabase as any).from("photo_gallery").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      setStats({
        restorations: r.count || 0,
        colorizations: 0,
        enhancements: 0,
        removals: c.count || 0,
      });
    };
    loadStats();
  }, []);

  const tools = [
    { id: "damage-detection" as ActiveView, icon: ScanLine, title: "Damage Detection", desc: "AI scans for scratches & tears", cost: "4 Credits", color: "text-red-500" },
    { id: "colorize" as ActiveView, icon: Sparkles, title: "Colorization", desc: "Add colors to B&W photos", cost: "1 Credit", color: "text-amber-500" },
    { id: "repair" as ActiveView, icon: Wand2, title: "Photo Repair", desc: "Remove scratches & damage", cost: "1 Credit", color: "text-blue-500" },
    { id: "enhance" as ActiveView, icon: ImageIcon, title: "Enhancement", desc: "Improve quality & sharpness", cost: "1 Credit", color: "text-green-500" },
    { id: "background-removal" as ActiveView, icon: Scissors, title: "Background Removal", desc: "AI background removal", cost: "3 Credits", color: "text-purple-500" },
    { id: "face-enhancement" as ActiveView, icon: Users, title: "Face Enhancement", desc: "Upscale & enhance faces", cost: "5 Credits", color: "text-pink-500" },
    { id: "colorization-pro" as ActiveView, icon: Palette, title: "Colorization Pro", desc: "Era-accurate colorization", cost: "8 Credits", color: "text-rose-500" },
    { id: "ai-upscaling" as ActiveView, icon: Maximize, title: "AI Upscaling 4K", desc: "Ultra-high resolution output", cost: "5-10 Credits", color: "text-teal-500" },
    { id: "batch-processing" as ActiveView, icon: Layers, title: "Batch Processing", desc: "Restore up to 10 at once", cost: "Varies", color: "text-indigo-500" },
    { id: "comparison-slider" as ActiveView, icon: Move, title: "Comparison Slider", desc: "Side-by-side before/after", cost: "Free", color: "text-cyan-500" },
    { id: "gallery" as ActiveView, icon: Camera, title: "Before/After Gallery", desc: "Community restorations", cost: "Free", color: "text-orange-500" },
    { id: "credits" as ActiveView, icon: ShoppingBag, title: "Buy Credits", desc: "Get more restoration credits", cost: "From €10", color: "text-emerald-500" },
  ];

  const statItems = [
    { label: "Restorations", value: stats.restorations, icon: Wand2 },
    { label: "Gallery", value: stats.removals, icon: Camera },
    { label: "Credits", value: credits?.credits_remaining || 0, icon: Star },
    { label: "Tools", value: 12, icon: Sparkles },
  ];

  // Classic restore handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); setRestoredUrl(""); }
  };

  const handleRestore = async (type: 'colorize' | 'repair' | 'enhance') => {
    if (!selectedFile) { toast.error("Please select a photo"); return; }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('old-photos').upload(fileName, selectedFile);
      if (uploadError) throw uploadError;
      const publicUrl = await getReadableUrl('old-photos', fileName);
      restorePhoto({ imageUrl: publicUrl, restorationType: type }, {
        onSuccess: (data: any) => {
          setRestoredUrl(data.restoredImageUrl);
          toast.success("Photo restored successfully!");
          supabase.from('old_photos').insert({ user_id: user.id, original_url: publicUrl, restored_url: data.restoredImageUrl, restoration_type: type, credits_used: 1 });
        }
      });
    } catch (error) { console.error(error); toast.error("Error uploading photo"); }
  };

  // Classic restore view
  const renderClassicRestore = (type: 'colorize' | 'repair' | 'enhance', title: string, icon: any) => {
    const Icon = icon;
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-3 pt-20 pb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Icon className="h-6 w-6 text-primary" />
                {title}
              </h2>
              <p className="text-muted-foreground mb-6">Upload a photo and AI will {type === 'colorize' ? 'add realistic colors' : type === 'repair' ? 'remove damage and scratches' : 'enhance quality and sharpness'}. Cost: 1 credit</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Original Photo</h3>
                  <div className="aspect-square bg-muted rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
                    {previewUrl ? <img src={previewUrl} alt="Original" className="w-full h-full object-cover" /> : (
                      <div className="text-center p-8">
                        <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-muted-foreground mb-3 text-sm">Upload an old photo</p>
                        <label htmlFor="file-upload"><Button variant="outline" asChild><span>Select Photo</span></Button></label>
                        <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                      </div>
                    )}
                  </div>
                  {selectedFile && (
                    <Button className="w-full mt-4" onClick={() => handleRestore(type)} disabled={isRestoring || !credits || credits.credits_remaining < 1}>
                      {isRestoring ? "Restoring..." : `Restore Photo (1 credit)`}
                    </Button>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Restored Photo</h3>
                  <div className="aspect-square bg-muted rounded-xl flex items-center justify-center overflow-hidden">
                    {restoredUrl ? <img src={restoredUrl} alt="Restored" className="w-full h-full object-cover" /> : (
                      <div className="text-center p-8"><Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground text-sm">Result will appear here</p></div>
                    )}
                  </div>
                  {restoredUrl && <a href={restoredUrl} download><Button variant="outline" className="w-full mt-4">Download Restored Photo</Button></a>}
                </div>
              </div>
            </Card>
          </motion.div>
          <Button variant="ghost" onClick={() => { setActiveView("hub"); setSelectedFile(null); setPreviewUrl(""); setRestoredUrl(""); }} className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
        </div>
      </div>
    );
  };

  if (activeView === "colorize") return renderClassicRestore("colorize", "AI Colorization", Sparkles);
  if (activeView === "repair") return renderClassicRestore("repair", "AI Photo Repair", Wand2);
  if (activeView === "enhance") return renderClassicRestore("enhance", "AI Enhancement", ImageIcon);
  if (activeView === "background-removal") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><BackgroundRemoval onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "face-enhancement") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><FaceEnhancement onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "colorization-pro") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><ColorizationPro onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "gallery") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><PhotoGallery onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "damage-detection") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><DamageDetection onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "batch-processing") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><BatchProcessing onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "comparison-slider") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><ComparisonSlider onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "ai-upscaling") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><AIUpscaling onBack={() => setActiveView("hub")} /></div></div>;

  if (activeView === "credits") return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container mx-auto px-3 pt-20 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-2">Buy Restoration Credits</h2>
            <p className="text-muted-foreground mb-6">Choose the right package for your needs</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[{ c: 5, p: 10, label: "Starter" }, { c: 20, p: 30, label: "Popular", featured: true }, { c: 50, p: 60, label: "Pro" }].map(pkg => (
                <motion.div key={pkg.c} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Card className={`p-5 text-center ${pkg.featured ? 'border-primary ring-2 ring-primary/30' : ''}`}>
                    {pkg.featured && <Badge className="mb-2 bg-primary/20 text-primary border-primary/30">Most Popular</Badge>}
                    <p className="text-sm text-muted-foreground">{pkg.label}</p>
                    <p className="text-3xl font-black mt-1">{pkg.c}</p>
                    <p className="text-xs text-muted-foreground">credits</p>
                    <p className="text-2xl font-bold text-primary mt-2">€{pkg.p}</p>
                    <Button className="w-full mt-4" variant={pkg.featured ? "default" : "outline"} onClick={() => purchaseCredits(pkg.c, pkg.p)}>Buy Now</Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
        <Button variant="ghost" onClick={() => setActiveView("hub")} className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Cinematic Video Hero */}
      <div className="relative w-full h-[50vh] sm:h-[60vh] overflow-hidden bg-black">
        <video src={heroVideo.url} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover brightness-[1.3] saturate-[1.2]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: "spring" }}>
            <p className="text-xs sm:text-sm text-amber-400 font-semibold tracking-wider uppercase drop-shadow-md">✨ AI-Powered Restoration Lab</p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mt-1 drop-shadow-lg"
              style={{ 
                textShadow: "0 0 80px rgba(245,158,11,0.6), 0 4px 30px rgba(0,0,0,0.9), 0 0 120px rgba(245,158,11,0.3)",
                WebkitTextStroke: "2px rgba(245,158,11,0.6)"
              }}>
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500 bg-clip-text text-transparent">
                Photo Restoration
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-white/90 mt-2 max-w-xl drop-shadow-lg font-medium">
              AI colorization, damage detection, upscaling 4K & batch processing
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: "spring" }} className="grid grid-cols-4 gap-2 sm:gap-4 mt-4 max-w-2xl">
            {statItems.map((s, i) => (
              <motion.div key={i} initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
                className="bg-black/40 backdrop-blur-xl rounded-xl p-2 sm:p-3 border border-white/10 text-center">
                <s.icon className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 mx-auto mb-1" />
                <p className="text-lg sm:text-2xl font-black text-white">{s.value}</p>
                <p className="text-[10px] sm:text-xs text-white/60">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
        {/* Engagement Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <Card className="p-3 sm:p-4 bg-card/80 backdrop-blur-xl text-center border-amber-500/20">
            <Flame className="h-6 w-6 text-orange-500 mx-auto mb-1" />
            <p className="text-xl sm:text-2xl font-black">7</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </Card>
          <Card className="p-3 sm:p-4 bg-card/80 backdrop-blur-xl text-center border-primary/20">
            <TrendingUp className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-xl sm:text-2xl font-black">{stats.restorations}</p>
            <p className="text-xs text-muted-foreground">Total Restores</p>
          </Card>
          <Card className="p-3 sm:p-4 bg-card/80 backdrop-blur-xl text-center border-yellow-500/20">
            <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-xl sm:text-2xl font-black">3</p>
            <p className="text-xs text-muted-foreground">Achievements</p>
          </Card>
        </motion.div>

        {/* Tools Grid */}
        <h2 className="text-2xl sm:text-3xl font-black mb-4"
          style={{ 
            textShadow: "0 0 40px rgba(245,158,11,0.4), 0 2px 15px rgba(0,0,0,0.6)",
            WebkitTextStroke: "1.5px rgba(245,158,11,0.5)"
          }}>
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 bg-clip-text text-transparent">
            Restoration Tools
          </span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {tools.map((tool, i) => (
            <motion.div key={tool.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.05, type: "spring" }}
              whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}>
              <Card className="p-4 sm:p-5 cursor-pointer bg-card/80 backdrop-blur-xl hover:border-amber-500/40 transition-all h-full" onClick={() => setActiveView(tool.id)}>
                <tool.icon className={`h-7 w-7 sm:h-8 sm:w-8 ${tool.color} mb-2`} />
                <h3 className="font-bold text-sm sm:text-base">{tool.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{tool.desc}</p>
                <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-2 inline-block">{tool.cost}</span>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoRestoration;
