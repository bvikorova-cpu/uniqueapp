import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Palette, Sparkles, Check, Lock, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
interface AIChatThemesProps {
  onBack: () => void;
  userId: string;
}

const themes = [
  { id: "midnight", name: "Midnight Ocean", colors: ["#0a1628", "#1a365d", "#2b6cb0"], free: true },
  { id: "sunset", name: "Sunset Glow", colors: ["#1a0a2e", "#7c3aed", "#f97316"], free: true },
  { id: "forest", name: "Enchanted Forest", colors: ["#0a1f0a", "#166534", "#22c55e"], free: true },
  { id: "neon", name: "Neon Cyberpunk", colors: ["#0f0f23", "#6366f1", "#ec4899"], free: false, price: 3 },
  { id: "aurora", name: "Aurora Borealis", colors: ["#041029", "#06b6d4", "#a855f7"], free: false, price: 3 },
  { id: "lava", name: "Volcanic Fire", colors: ["#1a0000", "#dc2626", "#f59e0b"], free: false, price: 5 },
  { id: "galaxy", name: "Deep Galaxy", colors: ["#0a0020", "#4c1d95", "#06b6d4"], free: false, price: 5 },
  { id: "ice", name: "Arctic Ice", colors: ["#e0f2fe", "#7dd3fc", "#0284c7"], free: false, price: 5 },
];

const wallpapers = [
  { id: "abstract", name: "Abstract Waves", preview: "bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-purple-500/30", free: true },
  { id: "stars", name: "Starfield", preview: "bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-blue-900/50", free: false, price: 2 },
  { id: "bubbles", name: "Chat Bubbles", preview: "bg-gradient-to-br from-pink-500/20 via-rose-500/10 to-orange-500/20", free: false, price: 2 },
  { id: "matrix", name: "Digital Rain", preview: "bg-gradient-to-br from-emerald-900/40 via-green-900/30 to-teal-900/40", free: false, price: 3 },
];

export const AIChatThemes = ({ onBack, userId }: AIChatThemesProps) => {
  const [selectedTheme, setSelectedTheme] = useState("midnight");
  const [selectedWallpaper, setSelectedWallpaper] = useState("abstract");
  const { toast } = useToast();

  const applyTheme = (themeId: string, isFree: boolean) => {
    if (!isFree) {
      toast({ title: "Premium Theme", description: "Purchase this theme with AI credits to unlock it.", variant: "destructive" });
      return;
    }
    setSelectedTheme(themeId);
    toast({ title: "Theme Applied!", description: "Your chat theme has been updated." });
  };

  const applyWallpaper = (wallpaperId: string, isFree: boolean) => {
    if (!isFree) {
      toast({ title: "Premium Wallpaper", description: "Purchase this wallpaper with AI credits.", variant: "destructive" });
      return;
    }
    setSelectedWallpaper(wallpaperId);
    toast({ title: "Wallpaper Applied!", description: "Your chat background has been updated." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Chat Themes & Wallpapers</h2>
          <p className="text-sm text-muted-foreground">Personalize your messaging experience</p>
        </div>
      </div>

      {/* AI Generate Custom */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-background to-accent/10">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent">
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-lg">AI Theme Generator</h3>
              <p className="text-sm text-muted-foreground">Describe your dream chat theme and AI will create it</p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-accent text-white gap-2" onClick={async () => {
              const description = window.prompt("Describe your dream chat theme:");
              if (!description?.trim()) return;
              try {
                const { supabase } = await import("@/integrations/supabase/client");
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) { toast({ description: "Please log in first" }); return; }
                const { data, error } = await supabase.functions.invoke("generate-gift-message", {
                  body: { type: "chat_theme", prompt: `Generate a chat theme color palette (3 hex colors) and a name for: ${description}` }
                });
                if (error) throw error;
                toast({ description: data?.message || data?.text || "Theme generated!" });
              } catch (e: any) {
                toast({ description: e.message || "Generovanie zlyhalo" });
              }
            }}>
              <Sparkles className="h-4 w-4" /> Generate (5 credits)
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Color Themes */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-black">
            <Palette className="h-5 w-5 text-primary" /> Color Themes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {themes.map((theme, i) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => applyTheme(theme.id, theme.free)}
                className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedTheme === theme.id ? "border-primary shadow-lg shadow-primary/20" : "border-transparent hover:border-primary/30"
                }`}
              >
                <div
                  className="h-20 w-full"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.join(", ")})` }}
                />
                <div className="p-2 bg-card/90 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{theme.name}</span>
                    {!theme.free && <Lock className="h-3 w-3 text-muted-foreground" />}
                    {selectedTheme === theme.id && <Check className="h-3 w-3 text-primary" />}
                  </div>
                  {!theme.free && <span className="text-[10px] text-muted-foreground">{theme.price} credits</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wallpapers */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-black">
            <Sparkles className="h-5 w-5 text-primary" /> Chat Wallpapers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {wallpapers.map((wp, i) => (
              <motion.div
                key={wp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => applyWallpaper(wp.id, wp.free)}
                className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedWallpaper === wp.id ? "border-primary shadow-lg shadow-primary/20" : "border-transparent hover:border-primary/30"
                }`}
              >
                <div className={`h-32 w-full ${wp.preview}`} />
                <div className="absolute bottom-0 inset-x-0 p-2 bg-black/60 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{wp.name}</span>
                    {!wp.free && <span className="text-[10px] text-white/70">{wp.price} credits</span>}
                    {wp.free && <span className="text-[10px] text-emerald-400">Free</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
