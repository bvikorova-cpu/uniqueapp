import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Crown, Palette, Swords, Heart, Sparkles, Eye, ShoppingBag,
  Camera, TrendingUp, Info, Loader2, Brain, Cpu
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HolographicHero } from "@/components/holographic/HolographicHero";
import { HolographicToolCard } from "@/components/holographic/HolographicToolCard";
import { AvatarCreator } from "@/components/holographic/AvatarCreator";
import { AvatarCustomization } from "@/components/holographic/AvatarCustomization";
import { AvatarBattleArena } from "@/components/holographic/AvatarBattleArena";
import { AvatarBreeding } from "@/components/holographic/AvatarBreeding";
import { EmotionSync } from "@/components/holographic/EmotionSync";
import { AvatarMarketplace } from "@/components/holographic/AvatarMarketplace";
import { HolographicGallery } from "@/components/holographic/HolographicGallery";
import { EvolutionLab } from "@/components/holographic/EvolutionLab";
import { HolographicHowItWorks } from "@/components/holographic/HolographicHowItWorks";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
type ViewType = "hub" | "creator" | "customize" | "battle" | "breeding" |
  "emotion-sync" | "marketplace" | "gallery" | "evolution" | "how-it-works";

const tools = [
  { id: "creator" as ViewType, icon: Crown, title: "Avatar Creator", description: "Design your unique AI-powered holographic avatar", color: "violet", badge: "€7/mo" },
  { id: "customize" as ViewType, icon: Palette, title: "Customization Packs", description: "Unlock appearance options and personality traits", color: "blue", badge: "€3-15" },
  { id: "battle" as ViewType, icon: Swords, title: "Battle Arena", description: "PvP combat between holographic avatars", color: "red", badge: "€2-5" },
  { id: "breeding" as ViewType, icon: Heart, title: "Avatar Breeding", description: "Combine avatars to create unique offspring", color: "pink", badge: "€10" },
  { id: "emotion-sync" as ViewType, icon: Camera, title: "Emotion Sync", description: "Avatar mirrors your real-time emotions", color: "cyan", badge: "New" },
  { id: "marketplace" as ViewType, icon: ShoppingBag, title: "Avatar Marketplace", description: "Buy & sell custom skins and accessories", color: "orange", badge: "New" },
  { id: "gallery" as ViewType, icon: Eye, title: "Holographic Gallery", description: "Browse stunning avatar creations", color: "indigo" },
  { id: "evolution" as ViewType, icon: TrendingUp, title: "Evolution Lab", description: "Track growth and AI development stages", color: "emerald" },
  { id: "how-it-works" as ViewType, icon: Info, title: "How It Works", description: "Complete guide to the avatar universe", color: "purple" },
];

export default function HolographicAvatars() {
  const [activeView, setActiveView] = useState<ViewType>("hub");
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        if (!session) window.location.href = '/auth';
      } catch (e) { console.error(e); }
      finally { setCheckingAuth(false); }
    };
    check();
  }, []);

  // Detect Stripe redirect (success/cancel) and surface toast + cleanup URL.
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const sessionId = searchParams.get("session_id");
    if (success === "true") {
      toast.success("Payment successful — your holographic feature is unlocked!", {
        description: sessionId ? `Reference: ${sessionId.slice(-8)}` : undefined,
      });
      // Consume any pending gameplay action stored before redirect.
      try {
        const raw = localStorage.getItem("pendingHoloAction");
        if (raw) {
          const action = JSON.parse(raw);
          localStorage.removeItem("pendingHoloAction");
          if (action?.kind === "battle") {
            supabase.functions
              .invoke("holographic-battle-simulate", { body: { mode: action.mode, sessionId } })
              .then(({ data, error }) => {
                if (error || !data?.result) return;
                const r = data.result;
                const emoji = r.outcome === "win" ? "🏆" : r.outcome === "loss" ? "💀" : "🤝";
                toast(`${emoji} Battle vs ${r.opponent_name}: ${r.outcome.toUpperCase()}`, {
                  description: `Power ${r.user_power} vs ${r.opponent_power}${r.rewards_eur > 0 ? ` · +€${r.rewards_eur}` : ""}`,
                });
              });
          } else if (action?.kind === "breeding") {
            supabase.functions
              .invoke("holographic-breeding-simulate", {
                body: { parent1: action.parent1, parent2: action.parent2, sessionId },
              })
              .then(({ data, error }) => {
                if (error || !data?.result) return;
                const r = data.result;
                toast.success(`👶 New offspring: ${r.offspring_name}`, {
                  description: `${r.offspring_style} · ${r.rarity} · traits: ${(r.offspring_traits ?? []).join(", ")}`,
                });
              });
          }
        }
      } catch (e) { console.warn("pendingHoloAction parse failed", e); }
      const next = new URLSearchParams(searchParams);
      ["success", "session_id"].forEach((k) => next.delete(k));
      setSearchParams(next, { replace: true });
    } else if (canceled === "true") {
      toast.info("Payment canceled");
      try { localStorage.removeItem("pendingHoloAction"); } catch {}
      const next = new URLSearchParams(searchParams);
      next.delete("canceled");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  if (checkingAuth) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (!user) return null;

  const goBack = () => setActiveView("hub");

  const renderView = () => {
    switch (activeView) {
      case "creator": return <AvatarCreator onBack={goBack} />;
      case "customize": return <AvatarCustomization onBack={goBack} />;
      case "battle": return <AvatarBattleArena onBack={goBack} />;
      case "breeding": return <AvatarBreeding onBack={goBack} />;
      case "emotion-sync": return <EmotionSync onBack={goBack} />;
      case "marketplace": return <AvatarMarketplace onBack={goBack} />;
      case "gallery": return <HolographicGallery onBack={goBack} />;
      case "evolution": return <EvolutionLab onBack={goBack} />;
      case "how-it-works": return <HolographicHowItWorks onBack={goBack} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Holographic scan lines - subtle global overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(168,85,247,0.15) 3px, rgba(168,85,247,0.15) 4px)' }}
      />

      <div className="container mx-auto px-4 pt-20 pb-8">
        {activeView === "hub" ? (
          <>
            <HolographicHero />

            <HeroRewardedAd sectionKey="page_holographicavatars" />

            {/* Compact Engagement Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { icon: Crown, label: "Total Avatars", value: "847", color: "text-violet-500" },
                { icon: Cpu, label: "AI Interactions", value: "124K", color: "text-cyan-500" },
                { icon: Brain, label: "Evolution Score", value: "92%", color: "text-emerald-500" },
                { icon: Sparkles, label: "XP Earned", value: "58K", color: "text-amber-500" },
              ].map((stat, i) => (
                <Card key={i} className="border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-lg font-black">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tool Cards Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-6">
                Avatar Tools
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {tools.map((tool, i) => (
                  <HolographicToolCard
                    key={tool.id}
                    icon={tool.icon}
                    title={tool.title}
                    description={tool.description}
                    color={tool.color}
                    onClick={() => setActiveView(tool.id)}
                    index={i}
                    badge={tool.badge}
                  />
                ))}
              </div>
            </div>

            {/* How It Works Summary */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">How It Works</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Crown, title: "1. Create Avatar", desc: "Design your unique 3D holographic avatar with AI personality" },
                    { icon: Brain, title: "2. Watch It Evolve", desc: "Your avatar learns, gains XP, and develops autonomous behaviors" },
                    { icon: Swords, title: "3. Battle & Breed", desc: "Compete in PvP battles or breed unique offspring with combined traits" },
                    { icon: ShoppingBag, title: "4. Trade & Collect", desc: "Buy and sell skins, accessories, and rare items on the marketplace" },
                  ].map((step, i) => (
                    <div key={i} className="text-center space-y-2">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-bold text-sm">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="max-w-4xl mx-auto">
            {renderView()}
          </div>
        )}
      </div>
    </div>
  );
}
