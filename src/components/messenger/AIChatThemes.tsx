import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Palette, Sparkles, Check, Lock, Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BUILTIN_THEMES,
  BUILTIN_WALLPAPERS,
  chatBackgroundStyle,
  useChatTheme,
  type CustomChatTheme,
} from "@/hooks/useChatTheme";

interface AIChatThemesProps {
  onBack: () => void;
  userId: string;
}

export const AIChatThemes = ({ onBack, userId }: AIChatThemesProps) => {
  const { state, save, loading } = useChatTheme(userId);
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [generating, setGenerating] = useState(false);

  const owns = (id: string, price: number) => price === 0 || state.ownedThemes.includes(id);

  const purchase = async (id: string, price: number, label: string) => {
    setBusy(id);
    try {
      const { error } = await supabase.rpc("deduct_ai_credits", {
        p_user_id: userId,
        p_amount: price,
        p_reason: `messenger_theme_${id}`,
        p_source: "messenger",
      });
      if (error) throw error;
      await save({ ownedThemes: [...state.ownedThemes, id] });
      window.dispatchEvent(new Event("ai-credits-updated"));
      toast({ title: "Unlocked!", description: `${label} is now yours (−${price} credits).` });
      return true;
    } catch (e: any) {
      const msg = e?.message || "";
      toast({
        title: /insufficient|credit/i.test(msg) ? "Not enough credits" : "Purchase failed",
        description: /insufficient|credit/i.test(msg) ? `You need ${price} credits for ${label}.` : msg,
        variant: "destructive",
      });
      return false;
    } finally {
      setBusy(null);
    }
  };

  const applyTheme = async (id: string, price: number, name: string) => {
    if (!owns(id, price)) {
      const ok = await purchase(id, price, name);
      if (!ok) return;
    }
    try {
      await save({ themeId: id });
      toast({ title: "Theme applied", description: `${name} is now your chat theme.` });
    } catch (e: any) {
      toast({ title: "Could not save theme", description: e?.message || "Please try again.", variant: "destructive" });
    }
  };

  const applyWallpaper = async (id: string, price: number, name: string) => {
    if (!owns(id, price)) {
      const ok = await purchase(id, price, name);
      if (!ok) return;
    }
    try {
      await save({ wallpaperId: id });
      toast({ title: "Wallpaper applied", description: `${name} is now your chat background.` });
    } catch (e: any) {
      toast({ title: "Could not save wallpaper", description: e?.message || "Please try again.", variant: "destructive" });
    }
  };

  const generateTheme = async () => {
    if (!description.trim()) {
      toast({ title: "Describe your theme first", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("messenger-ai", {
        body: { action: "chat-theme", description: description.trim() },
      });
      if (error) throw error;
      let raw = data?.result ?? data?.message ?? data;
      if (typeof raw === "string") {
        const cleaned = raw.replace(/```json|```/g, "").trim();
        const start = cleaned.indexOf("{");
        raw = JSON.parse(start >= 0 ? cleaned.slice(start, cleaned.lastIndexOf("}") + 1) : cleaned);
      }
      const colors: string[] = Array.isArray(raw?.colors) ? raw.colors.slice(0, 3) : [];
      if (colors.length < 3) throw new Error("AI did not return a valid palette");
      const theme: CustomChatTheme = {
        id: `custom-${Date.now()}`,
        name: String(raw?.name || description.trim()).slice(0, 24),
        colors,
        wallpaper: Array.isArray(raw?.wallpaper) && raw.wallpaper.length >= 3 ? raw.wallpaper.slice(0, 3) : colors,
        description: raw?.description ? String(raw.description) : undefined,
      };
      await save({
        customThemes: [theme, ...state.customThemes].slice(0, 12),
        themeId: theme.id,
        wallpaperId: theme.id,
        ownedThemes: [...state.ownedThemes, theme.id],
      });
      window.dispatchEvent(new Event("ai-credits-updated"));
      setDescription("");
      toast({ title: `${theme.name} created!`, description: "Your custom theme is applied (−5 credits)." });
    } catch (e: any) {
      const msg = e?.message || "Generation failed";
      toast({
        title: /402|credit/i.test(msg) ? "Not enough credits" : "Generation failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
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

      {/* Live preview */}
      <Card className="border-border/40 overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 space-y-2 border" style={chatBackgroundStyle(state)}>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Live preview</p>
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm px-3 py-2 text-xs bg-card/90 border border-border/50">Hey! How do you like this theme?</div>
            </div>
            <div className="flex justify-end">
              <div
                className="rounded-2xl rounded-br-sm px-3 py-2 text-xs text-white"
                style={{ background: `linear-gradient(135deg, ${(state.customThemes.find(t => t.id === state.themeId)?.colors || BUILTIN_THEMES.find(t => t.id === state.themeId)?.colors || BUILTIN_THEMES[0].colors).join(", ")})` }}
              >
                Looks great — it saves automatically ✨
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Generate Custom */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-background to-accent/10">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent">
                <Wand2 className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-lg">AI Theme Generator</h3>
                <p className="text-xs text-muted-foreground">Describe your dream theme — AI creates and applies it</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. rainy neon Tokyo night"
                className="flex-1"
              />
              <Button
                className="bg-gradient-to-r from-primary to-accent text-white gap-2"
                onClick={generateTheme}
                disabled={generating}
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate (5 credits)
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* My AI themes */}
      {state.customThemes.length > 0 && (
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-black">
              <Wand2 className="h-5 w-5 text-primary" /> My AI Themes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {state.customThemes.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => applyTheme(theme.id, 0, theme.name)}
                  className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    state.themeId === theme.id ? "border-primary shadow-lg shadow-primary/20" : "border-transparent hover:border-primary/30"
                  }`}
                >
                  <div className="h-20 w-full" style={{ background: `linear-gradient(135deg, ${theme.colors.join(", ")})` }} />
                  <div className="p-2 bg-card/90 backdrop-blur-sm flex items-center justify-between gap-1">
                    <span className="text-xs font-bold truncate">{theme.name}</span>
                    {state.themeId === theme.id && <Check className="h-3 w-3 text-primary shrink-0" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Color Themes */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-black">
            <Palette className="h-5 w-5 text-primary" /> Color Themes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BUILTIN_THEMES.map((theme, i) => {
              const owned = owns(theme.id, theme.price);
              return (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => !loading && busy !== theme.id && applyTheme(theme.id, theme.price, theme.name)}
                  className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    state.themeId === theme.id ? "border-primary shadow-lg shadow-primary/20" : "border-transparent hover:border-primary/30"
                  }`}
                >
                  <div className="h-20 w-full" style={{ background: `linear-gradient(135deg, ${theme.colors.join(", ")})` }} />
                  {busy === theme.id && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  )}
                  <div className="p-2 bg-card/90 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate">{theme.name}</span>
                      {!owned && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
                      {state.themeId === theme.id && <Check className="h-3 w-3 text-primary shrink-0" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {owned ? (theme.price === 0 ? "Free" : "Owned") : `${theme.price} credits`}
                    </span>
                  </div>
                </motion.div>
              );
            })}
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
            {BUILTIN_WALLPAPERS.map((wp, i) => {
              const owned = owns(wp.id, wp.price);
              return (
                <motion.div
                  key={wp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => !loading && busy !== wp.id && applyWallpaper(wp.id, wp.price, wp.name)}
                  className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    state.wallpaperId === wp.id ? "border-primary shadow-lg shadow-primary/20" : "border-transparent hover:border-primary/30"
                  }`}
                >
                  <div
                    className="h-32 w-full"
                    style={{ background: `linear-gradient(135deg, ${wp.colors[0]}55, ${wp.colors[1]}33, ${wp.colors[2]}55)` }}
                  />
                  {busy === wp.id && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-black/60 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white truncate">{wp.name}</span>
                      {state.wallpaperId === wp.id ? (
                        <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                      ) : owned ? (
                        <span className="text-[10px] text-emerald-400">{wp.price === 0 ? "Free" : "Owned"}</span>
                      ) : (
                        <span className="text-[10px] text-white/70">{wp.price} credits</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
