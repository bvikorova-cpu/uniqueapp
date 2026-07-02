import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, ShoppingCart, Shield, Dumbbell, ShoppingBag, Swords, Trophy, Map, Search, Building, ArrowUpDown, Medal, GraduationCap, BarChart3, Coins, Crosshair, Gamepad2 } from "lucide-react";
import { ArenaAuthGuard } from "@/components/arena/ArenaAuthGuard";
import { FootballArenaHero } from "@/components/football/FootballArenaHero";
import { FootballEngagement } from "@/components/football/FootballEngagement";
import { FootballToolCard } from "@/components/football/FootballToolCard";
import { PlayerCreator } from "@/components/football/PlayerCreator";
import { PlayerMarket } from "@/components/football/PlayerMarket";
import { TeamBuilder } from "@/components/football/TeamBuilder";
import { TrainingCenter } from "@/components/football/TrainingCenter";
import { EquipmentShop } from "@/components/football/EquipmentShop";
import { MatchSimulator } from "@/components/football/MatchSimulator";
import { LeagueSystem } from "@/components/football/LeagueSystem";
import { TacticsBoard } from "@/components/football/TacticsBoard";
import { ScoutNetwork } from "@/components/football/ScoutNetwork";
import { StadiumBuilder } from "@/components/football/StadiumBuilder";
import { TransferMarket } from "@/components/football/TransferMarket";
import { TrophyRoom } from "@/components/football/TrophyRoom";
import { YouthAcademy } from "@/components/football/YouthAcademy";
import { MatchAnalysis } from "@/components/football/MatchAnalysis";
import { CoinShop } from "@/components/football/CoinShop";
import { PenaltyShootout3D } from "@/components/football/PenaltyShootout3D";
import { EmbeddedGame } from "@/components/arena/EmbeddedGame";
import { Stadium3D } from "@/components/arena/Stadium3D";
import { supabase } from "@/integrations/supabase/client";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type ViewType = "hub" | "player-creator" | "player-market" | "team-builder" | "training" | "equipment" | "match" | "league" | "tactics" | "scout" | "stadium" | "transfers" | "trophies" | "youth" | "analysis" | "coins" | "penalty-game" | "play-game";

const tools = [
  { id: "player-creator" as ViewType, icon: UserPlus, title: "Player Creator", description: "Create custom players with AI-generated stats", badge: "AI", credits: 3, gradient: "from-emerald-500/10 to-emerald-500/5", iconColor: "text-emerald-400" },
  { id: "team-builder" as ViewType, icon: Shield, title: "Team Builder", description: "Build and manage your dream football squad", gradient: "from-blue-500/10 to-blue-500/5", iconColor: "text-blue-400" },
  { id: "match" as ViewType, icon: Swords, title: "Match Simulator", description: "Play matches against AI opponents", badge: "AI", credits: 3, gradient: "from-red-500/10 to-red-500/5", iconColor: "text-red-400" },
  { id: "training" as ViewType, icon: Dumbbell, title: "Training Center", description: "Train players to boost their stats", badge: "AI", credits: 2, gradient: "from-orange-500/10 to-orange-500/5", iconColor: "text-orange-400" },
  { id: "player-market" as ViewType, icon: ShoppingCart, title: "Player Market", description: "Buy players from other managers", gradient: "from-cyan-500/10 to-cyan-500/5", iconColor: "text-cyan-400" },
  { id: "scout" as ViewType, icon: Search, title: "Scout Network", description: "AI-powered talent scouting worldwide", badge: "AI", credits: 3, gradient: "from-violet-500/10 to-violet-500/5", iconColor: "text-violet-400" },
  { id: "tactics" as ViewType, icon: Map, title: "Tactics Board", description: "Get AI tactical analysis for your team", badge: "AI", credits: 2, gradient: "from-teal-500/10 to-teal-500/5", iconColor: "text-teal-400" },
  { id: "league" as ViewType, icon: Trophy, title: "League System", description: "Join leagues and compete for trophies", gradient: "from-amber-500/10 to-amber-500/5", iconColor: "text-amber-400" },
  { id: "equipment" as ViewType, icon: ShoppingBag, title: "Equipment Shop", description: "Buy boots, gloves, and gear for players", gradient: "from-pink-500/10 to-pink-500/5", iconColor: "text-pink-400" },
  { id: "stadium" as ViewType, icon: Building, title: "Stadium Builder", description: "Upgrade and customize your stadium", gradient: "from-indigo-500/10 to-indigo-500/5", iconColor: "text-indigo-400" },
  { id: "transfers" as ViewType, icon: ArrowUpDown, title: "Transfer Market", description: "List and sell your players to others", gradient: "from-lime-500/10 to-lime-500/5", iconColor: "text-lime-400" },
  { id: "youth" as ViewType, icon: GraduationCap, title: "Youth Academy", description: "Discover and develop young talent", badge: "AI", credits: 2, gradient: "from-sky-500/10 to-sky-500/5", iconColor: "text-sky-400" },
  { id: "analysis" as ViewType, icon: BarChart3, title: "Match Analysis", description: "AI-powered post-match performance reports", badge: "AI", credits: 3, gradient: "from-fuchsia-500/10 to-fuchsia-500/5", iconColor: "text-fuchsia-400" },
  { id: "trophies" as ViewType, icon: Medal, title: "Trophy Room", description: "View your achievements and trophies", badge: "Free", gradient: "from-yellow-500/10 to-yellow-500/5", iconColor: "text-yellow-400" },
  { id: "coins" as ViewType, icon: Coins, title: "Coin Shop", description: "Purchase coins for players and upgrades", gradient: "from-amber-500/10 to-amber-500/5", iconColor: "text-amber-400" },
  { id: "penalty-game" as ViewType, icon: Crosshair, title: "⚽ Penalty Shootout", description: "Play 3D penalty kicks against the AI goalkeeper!", badge: "3D", gradient: "from-green-500/10 to-emerald-500/5", iconColor: "text-green-400" },
  { id: "play-game" as ViewType, icon: Gamepad2, title: "⚽ Play on Poki ↗", description: "Opens Football Legends on Poki.com in a new tab", badge: "POKI", gradient: "from-purple-500/10 to-pink-500/5", iconColor: "text-purple-400" },
];

const useLiveStats = () => {
  const [stats, setStats] = useState({ totalPlayers: 0, totalMatches: 0, activeLeagues: 0, onlineManagers: 0 });
  useEffect(() => {
    const load = async () => {
      const [{ count: p }, { count: m }, { count: l }] = await Promise.all([
        supabase.from("football_players").select("id", { count: "exact", head: true }),
        supabase.from("football_matches").select("id", { count: "exact", head: true }),
        supabase.from("football_leagues").select("id", { count: "exact", head: true }).eq("status", "open"),
      ]);
      setStats({ totalPlayers: p || 0, totalMatches: m || 0, activeLeagues: l || 0, onlineManagers: Math.floor(Math.random() * 50) + 10 });
    };
    load();
    const iv = setInterval(load, 60000);
    return () => clearInterval(iv);
  }, []);
  return stats;
};

const FootballArena = () => {
  const [activeView, setActiveView] = useState<ViewType>("hub");
  const stats = useLiveStats();

  const renderView = () => {
    const back = () => setActiveView("hub");
    switch (activeView) {
      case "player-creator": return <PlayerCreator onBack={back} />;
      case "player-market": return <PlayerMarket onBack={back} />;
      case "team-builder": return <TeamBuilder onBack={back} />;
      case "training": return <TrainingCenter onBack={back} />;
      case "equipment": return <EquipmentShop onBack={back} />;
      case "match": return <MatchSimulator onBack={back} />;
      case "league": return <LeagueSystem onBack={back} />;
      case "tactics": return <TacticsBoard onBack={back} />;
      case "scout": return <ScoutNetwork onBack={back} />;
      case "stadium": return <StadiumBuilder onBack={back} />;
      case "transfers": return <TransferMarket onBack={back} />;
      case "trophies": return <TrophyRoom onBack={back} />;
      case "youth": return <YouthAcademy onBack={back} />;
      case "analysis": return <MatchAnalysis onBack={back} />;
      case "coins": return <CoinShop onBack={back} />;
      case "penalty-game": return <PenaltyShootout3D onBack={back} />;
      case "play-game": return <EmbeddedGame onBack={back} title="Football 3D" gameUrl="https://html5.gamedistribution.com/540d36010bb94e288a660456efaebff9/" sport="football" />;
      default: return null;
    }
  };

  if (activeView !== "hub") {
    return (
<div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pt-20 pb-28 md:pb-8">
          <ArenaAuthGuard onBack={() => setActiveView("hub")} sportName="Football Arena">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{renderView()}</motion.div>
          </ArenaAuthGuard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FloatingHowItWorks title="FootballArena — How it works" steps={[{title:"Open this section",desc:"Access FootballArena from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
      <div className="container mx-auto px-4 pt-20 pb-28 md:pb-8 space-y-8">
        <FootballArenaHero stats={stats} onNavigate={(v) => setActiveView(v as ViewType)} />
        <HeroRewardedAd sectionKey="page_footballarena" />

        {/* 3D Stadium Showcase */}
        <div className="rounded-2xl overflow-hidden border border-border/40 bg-card/50 backdrop-blur-sm h-[320px]">
          <Stadium3D sport="football" className="w-full h-full" />
        </div>

        <FootballEngagement />
        <div>
          <h2 className="text-xl font-bold mb-4">Football Arena Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tools.map((tool, i) => (
              <FootballToolCard key={tool.id} icon={tool.icon} title={tool.title} description={tool.description} badge={tool.badge} credits={tool.credits} gradient={tool.gradient} iconColor={tool.iconColor} onClick={() => setActiveView(tool.id)} delay={0.05 * i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FootballArena;
