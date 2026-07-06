import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Trophy, Dumbbell, Sparkles, Zap, ShoppingCart, 
  LogIn, ArrowLeft, Flag, Dna, Gavel, Flame,
  Swords, Crown, Wrench, Target, GitBranch, Cloud, Calendar
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserHorses, useRaces } from "@/hooks/useHorseRacing";
import { HorseRacingHero } from "@/components/horse-racing/HorseRacingHero";
import { HorseCurrencyDisplay } from "@/components/horse-racing/HorseCurrencyDisplay";
import { HorseLeaderboard } from "@/components/horse-racing/HorseLeaderboard";
import { HorseShop } from "@/components/horse-racing/HorseShop";
import { HorseBreedingLab } from "@/components/horse-racing/HorseBreedingLab";
import { LiveRaceSimulator } from "@/components/horse-racing/LiveRaceSimulator";
import { TrainingCamp } from "@/components/horse-racing/TrainingCamp";
import { HorseAuctionHouse } from "@/components/horse-racing/HorseAuctionHouse";
import { SeasonalChampionships } from "@/components/horse-racing/SeasonalChampionships";
import { HorseEquipmentSystem } from "@/components/horse-racing/HorseEquipmentSystem";
import { DailyTrainingQuests } from "@/components/horse-racing/DailyTrainingQuests";
import { BloodlineGenealogy } from "@/components/horse-racing/BloodlineGenealogy";
import { WeatherRacingBonuses } from "@/components/horse-racing/WeatherRacingBonuses";
import { HorseMarketplace } from "@/components/horse-racing/HorseMarketplace";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
type ActiveView = "dashboard" | "stable" | "racing" | "training" | "breeding" | "shop" | "leaderboard" | "auction" | "championships" | "equipment" | "quests" | "bloodline" | "weather" | "marketplace";

const tools = [
  { id: "stable" as const, icon: Swords, label: "My Stable", desc: "Manage your horses", gradient: "from-amber-500 to-orange-600" },
  { id: "racing" as const, icon: Flag, label: "Live Racing", desc: "Join & watch races", gradient: "from-red-500 to-rose-600" },
  { id: "training" as const, icon: Dumbbell, label: "Training Camp", desc: "Train horse stats", gradient: "from-emerald-500 to-green-600" },
  { id: "breeding" as const, icon: Dna, label: "Breeding Lab", desc: "Breed champions", gradient: "from-pink-500 to-rose-600" },
  { id: "championships" as const, icon: Calendar, label: "Championships", desc: "Seasonal tournaments", gradient: "from-violet-500 to-purple-600" },
  { id: "equipment" as const, icon: Wrench, label: "Equipment", desc: "Gear up your horses", gradient: "from-cyan-500 to-blue-600" },
  { id: "quests" as const, icon: Target, label: "Daily Quests", desc: "Bonus coins & XP", gradient: "from-yellow-500 to-amber-600" },
  { id: "bloodline" as const, icon: GitBranch, label: "Bloodlines", desc: "Genealogy tree", gradient: "from-indigo-500 to-blue-600" },
  { id: "weather" as const, icon: Cloud, label: "Weather System", desc: "Breed advantages", gradient: "from-teal-500 to-cyan-600" },
  { id: "shop" as const, icon: ShoppingCart, label: "Racing Shop", desc: "Items & cosmetics", gradient: "from-orange-500 to-red-600" },
  { id: "leaderboard" as const, icon: Trophy, label: "Rankings", desc: "Top champions", gradient: "from-amber-500 to-yellow-600" },
  { id: "auction" as const, icon: Gavel, label: "Auction House", desc: "Buy & sell horses", gradient: "from-rose-500 to-red-600" },
  { id: "marketplace" as const, icon: ShoppingCart, label: "Marketplace", desc: "Fixed-price horse listings", gradient: "from-purple-500 to-pink-600" },
];

export default function HorseRacing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { horses, createHorse } = useUserHorses();
  const { races } = useRaces();
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [showBuyHorse, setShowBuyHorse] = useState(false);
  const [horseName, setHorseName] = useState("");
  const [horseBreed, setHorseBreed] = useState("thoroughbred");
  const [horseColor, setHorseColor] = useState("#8B4513");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("payment");
    if (status === "success") {
      toast.success("Purchase successful!");
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["horse-currency"] }), 2000);
      window.history.replaceState({}, "", "/horse-racing");
    } else if (status === "cancelled") {
      toast.info("Payment cancelled");
      window.history.replaceState({}, "", "/horse-racing");
    }
  }, [queryClient]);

  const requireAuth = (action: () => void) => {
    if (!user) { navigate('/auth'); return; }
    action();
  };

  const handleBuyHorse = async () => {
    if (!horseName) { toast.error("Enter horse name"); return; }
    const { chargeHorseAction } = await import("@/lib/moduleCreditActions");
    const charge = await chargeHorseAction("buy-horse", { horse_name: horseName, metadata: { breed: horseBreed, color: horseColor } });
    if (!charge.ok) return;
    createHorse.mutate({ name: horseName, breed: horseBreed, color: horseColor, costCoins: 50 }, {
      onSuccess: () => { setShowBuyHorse(false); setHorseName(""); },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  const heroStats = {
    totalHorses: horses?.length || 0,
    totalRaces: horses?.reduce((sum, h) => sum + (h.total_races || 0), 0) || 0,
    activeRaces: races?.length || 0,
    onlineTrainers: Math.floor(Math.random() * 50) + 10,
  };

  const renderDashboard = () => (
    <>
      <HorseRacingHero stats={heroStats} onNavigate={(v) => setActiveView(v as ActiveView)} />
      <HeroRewardedAd sectionKey="page_horseracing" />


      {/* Engagement Row */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 mt-6">
        {[
          { icon: Flame, label: "Win Streak", value: `${horses?.[0]?.total_wins || 0}`, sub: "Best horse", color: "text-red-400", glow: "shadow-red-500/20" },
          { icon: Crown, label: "Stable Size", value: `${horses?.length || 0}`, sub: "Horses owned", color: "text-amber-400", glow: "shadow-amber-500/20" },
          { icon: Trophy, label: "Victories", value: `${horses?.reduce((s, h) => s + (h.total_wins || 0), 0) || 0}`, sub: "Total wins", color: "text-emerald-400", glow: "shadow-emerald-500/20" },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
          >
            <Card className={`p-3 sm:p-4 text-center bg-slate-900/60 border-amber-500/15 backdrop-blur-sm hover:border-amber-400/30 transition-all shadow-lg ${s.glow}`}>
              <div className="relative mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-800/60 border border-white/5 flex items-center justify-center mb-2">
                <s.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${s.color}`} />
                <div className={`absolute -inset-2 rounded-xl blur-md opacity-20 ${s.color.replace('text-', 'bg-')}`} />
              </div>
              <p className="text-[10px] font-mono text-amber-400/40 uppercase tracking-wider">{s.label}</p>
              <p className="text-xl sm:text-2xl font-black font-mono text-white">{s.value}</p>
              <p className="text-[9px] font-mono text-amber-400/30">{s.sub}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Currency */}
      <div className="mt-4">
        <HorseCurrencyDisplay />
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 mt-6">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.03, type: "spring" }}
          >
            <Card
              className="relative overflow-hidden p-4 cursor-pointer bg-slate-900/60 border-amber-500/10 backdrop-blur-sm hover:border-amber-400/30 hover:scale-[1.03] transition-all group"
              onClick={() => setActiveView(tool.id)}
            >
              {/* Top gradient bar */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${tool.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
              
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                <tool.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold font-mono text-sm text-white">{tool.label}</h3>
              <p className="text-[10px] font-mono text-amber-400/40 mt-0.5">{tool.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Legal */}
      <Card className="mt-6 p-3 bg-slate-900/40 border-amber-500/10">
        <p className="text-[10px] font-mono text-amber-400/40">
          ⚖️ <strong className="text-amber-400/60">Legal Notice:</strong> Skill-based racing • Legal virtual economy • No gambling • Virtual currency cannot be exchanged for real money
        </p>
      </Card>
    </>
  );

  const renderStable = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black font-mono flex items-center gap-2 text-white">
          <Swords className="h-6 w-6 text-amber-400" /> My Stable
        </h2>
        <Button onClick={() => requireAuth(() => setShowBuyHorse(true))}
          className="bg-gradient-to-r from-amber-600 to-red-600 text-white font-mono text-xs uppercase tracking-wider"
        >
          <Zap className="mr-1 h-4 w-4" /> Buy Horse (50 Coins)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {horses?.map((horse, i) => (
          <motion.div key={horse.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 bg-slate-900/60 border-amber-500/10 backdrop-blur-sm hover:border-amber-400/30 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold font-mono text-white">{horse.name}</h3>
                  <p className="text-xs font-mono text-amber-400/50 capitalize">{horse.breed}</p>
                  <p className="text-[10px] font-mono text-amber-400">Level {horse.level}</p>
                </div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg border-2 border-amber-400/20" style={{ backgroundColor: horse.color }} />
                  <div className="absolute -inset-1 rounded-xl blur-md opacity-30" style={{ backgroundColor: horse.color }} />
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                {[
                  { label: "Speed", value: horse.speed_stat, color: "text-yellow-400" },
                  { label: "Stamina", value: horse.stamina_stat, color: "text-blue-400" },
                  { label: "Acceleration", value: horse.acceleration_stat, color: "text-orange-400" },
                ].map(s => (
                  <div key={s.label} className="flex justify-between text-xs font-mono">
                    <span className="text-amber-400/50">{s.label}</span>
                    <span className={`font-bold ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-amber-500/10 flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-400/40">Races: {horse.total_races} • Wins: {horse.total_wins}</span>
                {horse.total_wins > 0 && <Trophy className="h-3.5 w-3.5 text-amber-400" />}
              </div>
            </Card>
          </motion.div>
        ))}
        {(!horses || horses.length === 0) && (
          <div className="col-span-full text-center py-12">
            <Zap className="w-12 h-12 mx-auto mb-3 text-amber-400/20" />
            <p className="text-amber-400/50 font-mono text-sm">No horses yet — buy your first horse!</p>
          </div>
        )}
      </div>
    </div>
  );

  const viewComponents: Record<ActiveView, JSX.Element> = {
    dashboard: renderDashboard(),
    stable: renderStable(),
    racing: <LiveRaceSimulator />,
    training: <TrainingCamp />,
    breeding: <HorseBreedingLab />,
    shop: <HorseShop />,
    leaderboard: <HorseLeaderboard />,
    auction: <HorseAuctionHouse />,
    championships: <SeasonalChampionships />,
    equipment: <HorseEquipmentSystem />,
    quests: <DailyTrainingQuests />,
    bloodline: <BloodlineGenealogy />,
    weather: <WeatherRacingBonuses />,
    marketplace: <HorseMarketplace />,
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-6 pt-20 sm:pt-24 pb-28 md:pb-8">
        {activeView !== "dashboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 flex items-center gap-3">
            <Button variant="ghost" onClick={() => setActiveView("dashboard")} className="gap-2 font-mono text-amber-400 hover:text-amber-300 drop-shadow-md">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Button>
            {!user && (
              <Button onClick={() => navigate('/auth')} variant="outline" size="sm" className="ml-auto border-amber-500/20 text-amber-400 font-mono">
                <LogIn className="h-4 w-4 mr-1" /> Sign In
              </Button>
            )}
          </motion.div>
        )}

        {activeView === "dashboard" && !user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 flex justify-end">
            <Button onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-amber-600 to-red-600 text-white font-mono uppercase tracking-wider"
            >
              <LogIn className="mr-2 h-4 w-4" /> Sign In to Play
            </Button>
          </motion.div>
        )}

        {viewComponents[activeView]}
      </div>

      {/* Buy Horse Dialog */}
      <Dialog open={showBuyHorse} onOpenChange={setShowBuyHorse}>
        <DialogContent className="bg-slate-900 border-amber-500/20">
          <DialogHeader>
            <DialogTitle className="font-mono text-white">Buy New Horse</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="font-mono text-amber-400/60">Horse Name</Label>
              <Input value={horseName} onChange={e => setHorseName(e.target.value)} placeholder="Enter name" className="bg-slate-800/60 border-amber-500/20 font-mono" />
            </div>
            <div>
              <Label className="font-mono text-amber-400/60">Breed</Label>
              <Select value={horseBreed} onValueChange={setHorseBreed}>
                <SelectTrigger className="bg-slate-800/60 border-amber-500/20 font-mono"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="thoroughbred">Thoroughbred</SelectItem>
                  <SelectItem value="arabian">Arabian</SelectItem>
                  <SelectItem value="quarter">Quarter Horse</SelectItem>
                  <SelectItem value="mustang">Mustang</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-mono text-amber-400/60">Color</Label>
              <div className="flex gap-2 mt-1">
                {["#8B4513", "#000000", "#FFFFFF", "#808080", "#D2691E"].map(c => (
                  <button key={c} onClick={() => setHorseColor(c)}
                    className="w-10 h-10 rounded-lg border-2 transition-all"
                    style={{ backgroundColor: c, borderColor: horseColor === c ? "#f59e0b" : "rgba(255,255,255,0.1)" }}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleBuyHorse} className="w-full bg-gradient-to-r from-amber-600 to-red-600 text-white font-mono uppercase tracking-wider">
              Buy Horse — 50 Coins
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
