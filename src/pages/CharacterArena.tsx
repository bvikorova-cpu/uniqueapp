import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Swords, Sparkles, Flame, Users, Trophy, TreeDeciduous, Skull, Crown, Zap, Shield } from "lucide-react";
import { CharacterArenaHero } from "@/components/character/CharacterArenaHero";
import { CharacterCreditsDisplay } from "@/components/character/CharacterCreditsDisplay";
import { CharacterCreator } from "@/components/character/CharacterCreator";
import { CharacterBattleArena } from "@/components/character/CharacterBattleArena";
import { CharacterSocialFeed } from "@/components/character/CharacterSocialFeed";
import { CharacterGallery } from "@/components/character/CharacterGallery";
import { TournamentHub } from "@/components/character/TournamentHub";
import { CharacterFusionLab } from "@/components/character/CharacterFusionLab";
import { BattleRoyaleMode } from "@/components/character/BattleRoyaleMode";
import { CharacterEvolutionTree } from "@/components/character/CharacterEvolutionTree";
import { AIDungeonRaids } from "@/components/character/AIDungeonRaids";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
type ActiveView = "dashboard" | "creator" | "battle" | "royale" | "social" | "gallery" | "tournament" | "fusion" | "evolution" | "dungeon";

const TOOLS = [
  { id: "creator" as const, title: "Forge Warrior", desc: "Create AI-powered characters", icon: Sparkles, color: "from-amber-500 to-orange-600", cost: "5-15 cr" },
  { id: "battle" as const, title: "1v1 Battle", desc: "Duel between two warriors", icon: Swords, color: "from-red-500 to-rose-600", cost: "2 cr" },
  { id: "royale" as const, title: "Battle Royale", desc: "8 warriors, 1 survivor", icon: Flame, color: "from-orange-500 to-red-600", cost: "10 cr" },
  { id: "fusion" as const, title: "Fusion Lab", desc: "Merge two warriors into one", icon: Zap, color: "from-purple-500 to-pink-600", cost: "30 cr" },
  { id: "dungeon" as const, title: "Dungeon Raids", desc: "Fight AI bosses for XP", icon: Skull, color: "from-violet-500 to-purple-600", cost: "5-25 cr" },
  { id: "evolution" as const, title: "Evolution Tree", desc: "Track warrior progression", icon: TreeDeciduous, color: "from-green-500 to-emerald-600", cost: "Free" },
  { id: "tournament" as const, title: "Tournaments", desc: "Compete for glory", icon: Trophy, color: "from-yellow-500 to-amber-600", cost: "5 cr" },
  { id: "gallery" as const, title: "Hall of Legends", desc: "Browse top warriors", icon: Crown, color: "from-amber-500 to-yellow-600", cost: "Free" },
  { id: "social" as const, title: "War Council", desc: "Community & social feed", icon: Users, color: "from-blue-500 to-cyan-600", cost: "Free" },
];

const CharacterArena = () => {
  usePaymentVerification();
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  const { data: stats } = useQuery({
    queryKey: ["character-arena-stats"],
    queryFn: async () => {
      const [chars, battles, tournaments] = await Promise.all([
        supabase.from("characters").select("id", { count: "exact", head: true }),
        supabase.from("character_battles").select("id", { count: "exact", head: true }),
        supabase.from("tournaments").select("id", { count: "exact", head: true }).eq("status", "registration"),
      ]);
      return {
        totalCharacters: chars.count || 0,
        totalBattles: battles.count || 0,
        activeTournaments: tournaments.count || 0,
        onlineWarriors: Math.floor(Math.random() * 500) + 100,
      };
    },
  });

  const renderView = () => {
    switch (activeView) {
      case "creator": return <CharacterCreator />;
      case "battle": return <CharacterBattleArena />;
      case "royale": return <BattleRoyaleMode />;
      case "fusion": return <CharacterFusionLab />;
      case "dungeon": return <AIDungeonRaids />;
      case "evolution": return <CharacterEvolutionTree />;
      case "tournament": return <TournamentHub />;
      case "gallery": return <CharacterGallery />;
      case "social": return <CharacterSocialFeed />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="container mx-auto max-w-7xl pt-20 pb-28 md:pb-8">
        {activeView !== "dashboard" && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Button variant="ghost" onClick={() => setActiveView("dashboard")} className="mb-4 gap-2 text-muted-foreground hover:text-foreground" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Button>
          </motion.div>
        )}

        {activeView === "dashboard" ? (
          <>
            <CharacterArenaHero stats={stats || { totalCharacters: 0, totalBattles: 0, activeTournaments: 0, onlineWarriors: 0 }} />

            <HeroRewardedAd sectionKey="page_characterarena" />

            {/* Engagement Row */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
              {[
                { icon: Flame, label: "Battle Streak", value: "0 Days", sub: "Win battles daily!", color: "from-red-500 to-orange-600" },
                { icon: Shield, label: "Army Size", value: stats?.totalCharacters?.toString() || "0", sub: "Warriors forged", color: "from-blue-500 to-cyan-600" },
                { icon: Trophy, label: "Achievements", value: "0/20", sub: "Unlock more!", color: "from-amber-500 to-yellow-600" },
              ].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1, type: "spring" }}>
                  <Card className="p-3 sm:p-4 border-border/30 bg-card/90 backdrop-blur-xl text-center">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-2`}>
                      <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-lg sm:text-xl font-black">{item.value}</p>
                    <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="mb-8">
              <CharacterCreditsDisplay />
            </div>

            {/* Tool Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {TOOLS.map((tool, i) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveView(tool.id)}
                  className="cursor-pointer"
                >
                  <Card className="relative overflow-hidden border-border/30 bg-card/90 backdrop-blur-xl hover:border-primary/40 transition-all p-4 sm:p-5 h-full group">
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <tool.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="font-black text-sm sm:text-base mb-1">{tool.title}</h3>
                    <p className="text-muted-foreground text-[10px] sm:text-xs mb-2">{tool.desc}</p>
                    <Badge variant="outline" className="text-[10px] border-border/30">{tool.cost}</Badge>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          renderView()
        )}
      </div>
    </div>
  );
};

export default CharacterArena;
