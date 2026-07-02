import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, ShoppingCart, Shield, Dumbbell, ShoppingBag, Swords, Trophy, Map, Search, Building, ArrowUpDown, Medal, GraduationCap, BarChart3, Coins, Crosshair, Gamepad2 } from "lucide-react";
import { ArenaAuthGuard } from "@/components/arena/ArenaAuthGuard";
import { TennisArenaHero } from "@/components/tennis/TennisArenaHero";
import { TennisEngagement } from "@/components/tennis/TennisEngagement";
import { TennisToolCard } from "@/components/tennis/TennisToolCard";
import { PlayerCreator } from "@/components/tennis/PlayerCreator";
import { PlayerMarket } from "@/components/tennis/PlayerMarket";
import { TeamBuilder } from "@/components/tennis/TeamBuilder";
import { TrainingCenter } from "@/components/tennis/TrainingCenter";
import { EquipmentShop } from "@/components/tennis/EquipmentShop";
import { MatchSimulator } from "@/components/tennis/MatchSimulator";
import { LeagueSystem } from "@/components/tennis/LeagueSystem";
import { TacticsBoard } from "@/components/tennis/TacticsBoard";
import { ScoutNetwork } from "@/components/tennis/ScoutNetwork";
import { StadiumBuilder } from "@/components/tennis/StadiumBuilder";
import { TransferMarket } from "@/components/tennis/TransferMarket";
import { TrophyRoom } from "@/components/tennis/TrophyRoom";
import { YouthAcademy } from "@/components/tennis/YouthAcademy";
import { MatchAnalysis } from "@/components/tennis/MatchAnalysis";
import { CoinShop } from "@/components/tennis/CoinShop";
import { ServeChallenge3D } from "@/components/tennis/ServeChallenge3D";
import { EmbeddedGame } from "@/components/arena/EmbeddedGame";
import { supabase } from "@/integrations/supabase/client";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type ViewType = "hub" | "player-creator" | "player-market" | "team-builder" | "training" | "equipment" | "match" | "league" | "tactics" | "scout" | "stadium" | "transfers" | "trophies" | "youth" | "analysis" | "coins" | "serve-game" | "play-game";

const tools = [
  { id: "player-creator" as ViewType, icon: UserPlus, title: "Player Creator", description: "Create custom tennis players with AI-generated stats", badge: "AI", credits: 500, gradient: "from-lime-500/10 to-lime-500/5", iconColor: "text-lime-400" },
  { id: "team-builder" as ViewType, icon: Shield, title: "Team Builder", description: "Build and manage your dream tennis roster", gradient: "from-blue-500/10 to-blue-500/5", iconColor: "text-blue-400" },
  { id: "match" as ViewType, icon: Swords, title: "Match Simulator", description: "Play matches against AI opponents on the court", badge: "AI", credits: 300, gradient: "from-red-500/10 to-red-500/5", iconColor: "text-red-400" },
  { id: "training" as ViewType, icon: Dumbbell, title: "Training Center", description: "Train players to boost serve, forehand & more", gradient: "from-orange-500/10 to-orange-500/5", iconColor: "text-orange-400" },
  { id: "player-market" as ViewType, icon: ShoppingCart, title: "Player Market", description: "Buy players from other managers", gradient: "from-emerald-500/10 to-emerald-500/5", iconColor: "text-emerald-400" },
  { id: "scout" as ViewType, icon: Search, title: "Scout Network", description: "AI-powered talent scouting worldwide", badge: "AI", credits: 400, gradient: "from-violet-500/10 to-violet-500/5", iconColor: "text-violet-400" },
  { id: "tactics" as ViewType, icon: Map, title: "Tactics Board", description: "Get AI tactical analysis for court strategy", badge: "AI", credits: 300, gradient: "from-teal-500/10 to-teal-500/5", iconColor: "text-teal-400" },
  { id: "league" as ViewType, icon: Trophy, title: "League System", description: "Join leagues and compete for Grand Slams", gradient: "from-amber-500/10 to-amber-500/5", iconColor: "text-amber-400" },
  { id: "equipment" as ViewType, icon: ShoppingBag, title: "Equipment Shop", description: "Buy rackets, shoes, gear for your players", gradient: "from-pink-500/10 to-pink-500/5", iconColor: "text-pink-400" },
  { id: "stadium" as ViewType, icon: Building, title: "Court Builder", description: "Upgrade and customize your tennis center", gradient: "from-indigo-500/10 to-indigo-500/5", iconColor: "text-indigo-400" },
  { id: "transfers" as ViewType, icon: ArrowUpDown, title: "Transfer Market", description: "List and sell your players to others", gradient: "from-lime-500/10 to-lime-500/5", iconColor: "text-lime-400" },
  { id: "youth" as ViewType, icon: GraduationCap, title: "Youth Academy", description: "Discover and develop young tennis talent", badge: "AI", credits: 350, gradient: "from-sky-500/10 to-sky-500/5", iconColor: "text-sky-400" },
  { id: "analysis" as ViewType, icon: BarChart3, title: "Match Analysis", description: "AI-powered post-match performance reports", badge: "AI", credits: 400, gradient: "from-fuchsia-500/10 to-fuchsia-500/5", iconColor: "text-fuchsia-400" },
  { id: "trophies" as ViewType, icon: Medal, title: "Trophy Room", description: "View your achievements and Grand Slams", badge: "Free", gradient: "from-yellow-500/10 to-yellow-500/5", iconColor: "text-yellow-400" },
  { id: "coins" as ViewType, icon: Coins, title: "Coin Shop", description: "Purchase coins for players and upgrades", gradient: "from-amber-500/10 to-amber-500/5", iconColor: "text-amber-400" },
  { id: "serve-game" as ViewType, icon: Crosshair, title: "🎾 Serve Challenge", description: "Play 3D serve challenge on court!", badge: "3D", gradient: "from-green-500/10 to-green-500/5", iconColor: "text-green-400" },
  { id: "play-game" as ViewType, icon: Gamepad2, title: "🎾 Play on Poki ↗", description: "Opens Tennis Masters on Poki.com in a new tab", badge: "POKI", gradient: "from-purple-500/10 to-pink-500/5", iconColor: "text-purple-400" },
];

const useLiveStats = () => {
  const [stats, setStats] = useState({ totalPlayers: 0, totalMatches: 0, activeLeagues: 0, onlineManagers: 0 });
  useEffect(() => {
    const load = async () => {
      const [{ count: p }, { count: m }, { count: l }] = await Promise.all([
        supabase.from("tennis_players").select("id", { count: "exact", head: true }),
        supabase.from("tennis_matches").select("id", { count: "exact", head: true }),
        supabase.from("tennis_leagues").select("id", { count: "exact", head: true }).eq("status", "open"),
      ]);
      setStats({ totalPlayers: p || 0, totalMatches: m || 0, activeLeagues: l || 0, onlineManagers: Math.floor(Math.random() * 50) + 10 });
    };
    load();
    const iv = setInterval(load, 60000);
    return () => clearInterval(iv);
  }, []);
  return stats;
};

const TennisArena = () => {
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
      case "serve-game": return <ServeChallenge3D onBack={back} />;
      case "play-game": return <EmbeddedGame onBack={back} title="Tennis Masters" gameUrl="https://html5.gamedistribution.com/cfd23874aad14e9daa2228891622d579/" sport="tennis" />;
      default: return null;
    }
  };

  if (activeView !== "hub") {
    return (
      <><FloatingHowItWorks title="TennisArena — How it works" steps={[{title:"Open this section",desc:"Access TennisArena from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pt-20 pb-28 md:pb-8">
          <ArenaAuthGuard onBack={() => setActiveView("hub")} sportName="Tennis Arena">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{renderView()}</motion.div>
          </ArenaAuthGuard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-20 pb-28 md:pb-8 space-y-8">
        <TennisArenaHero stats={stats} onNavigate={(v) => setActiveView(v as ViewType)} />
        <HeroRewardedAd sectionKey="page_tennisarena" />

        <TennisEngagement />
        <div>
          <h2 className="text-xl font-bold mb-4">Tennis Arena Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tools.map((tool, i) => (
              <TennisToolCard key={tool.id} icon={tool.icon} title={tool.title} description={tool.description} badge={tool.badge} credits={tool.credits} gradient={tool.gradient} iconColor={tool.iconColor} onClick={() => setActiveView(tool.id)} delay={0.05 * i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </>
  );
};

export default TennisArena;
