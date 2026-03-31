import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Trophy, Dumbbell, Heart, Sparkles, Zap, TrendingUp, ShoppingCart, 
  Rocket, Shield, LogIn, ArrowLeft, Flag, Dna, Gavel, Flame,
  Swords, Crown
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

type ActiveView = "dashboard" | "stable" | "racing" | "training" | "breeding" | "shop" | "leaderboard" | "auction";

const tools = [
  { id: "stable" as const, icon: Swords, label: "My Stable", desc: "Manage your horses", gradient: "from-purple-500 to-violet-600" },
  { id: "racing" as const, icon: Flag, label: "Live Racing", desc: "Join & watch races", gradient: "from-amber-500 to-orange-600" },
  { id: "training" as const, icon: Dumbbell, label: "Training Camp", desc: "Train horse stats", gradient: "from-emerald-500 to-green-600" },
  { id: "breeding" as const, icon: Dna, label: "Breeding Lab", desc: "Breed champions", gradient: "from-pink-500 to-rose-600" },
  { id: "shop" as const, icon: ShoppingCart, label: "Racing Shop", desc: "Items & cosmetics", gradient: "from-cyan-500 to-blue-600" },
  { id: "leaderboard" as const, icon: Trophy, label: "Rankings", desc: "Top champions", gradient: "from-yellow-500 to-amber-600" },
  { id: "auction" as const, icon: Gavel, label: "Auction House", desc: "Buy & sell horses", gradient: "from-red-500 to-rose-600" },
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

  const handleBuyHorse = () => {
    if (!horseName) { toast.error("Enter horse name"); return; }
    createHorse.mutate({ name: horseName, breed: horseBreed, color: horseColor, costCoins: 50 }, {
      onSuccess: () => { setShowBuyHorse(false); setHorseName(""); },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  // Stats for hero
  const heroStats = {
    totalHorses: horses?.length || 0,
    totalRaces: horses?.reduce((sum, h) => sum + (h.total_races || 0), 0) || 0,
    activeRaces: races?.length || 0,
    onlineTrainers: Math.floor(Math.random() * 50) + 10,
  };

  const renderDashboard = () => (
    <>
      <HorseRacingHero stats={heroStats} />

      {/* Engagement Row */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {[
          { icon: Flame, label: "Win Streak", value: `${horses?.[0]?.total_wins || 0}`, sub: "Best horse", gradient: "from-orange-500 to-red-500" },
          { icon: Crown, label: "Stable Size", value: `${horses?.length || 0}`, sub: "Horses owned", gradient: "from-cyan-500 to-blue-500" },
          { icon: Trophy, label: "Victories", value: `${horses?.reduce((s, h) => s + (h.total_wins || 0), 0) || 0}`, sub: "Total wins", gradient: "from-amber-500 to-yellow-500" },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
          >
            <Card className="p-3 text-center border-white/5 bg-card/80 backdrop-blur-sm hover:scale-105 transition-transform">
              <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-2 shadow-lg`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-black">{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.sub}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Currency */}
      <HorseCurrencyDisplay />

      {/* Tool Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.05, type: "spring" }}
          >
            <Card
              className="p-4 cursor-pointer border-white/5 bg-card/80 backdrop-blur-sm hover:border-purple-500/30 hover:scale-105 transition-all group"
              onClick={() => setActiveView(tool.id)}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                <tool.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-sm">{tool.label}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{tool.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Legal */}
      <Card className="mt-6 p-3 border-amber-500/10 bg-card/60">
        <p className="text-[10px] text-muted-foreground">
          ⚖️ <strong>Legal Notice:</strong> Skill-based racing • Legal virtual economy • No gambling • Virtual currency cannot be exchanged for real money
        </p>
      </Card>
    </>
  );

  const renderStable = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black flex items-center gap-2">
          <Swords className="h-6 w-6 text-purple-400" /> My Stable
        </h2>
        <Button onClick={() => requireAuth(() => setShowBuyHorse(true))}
          className="bg-gradient-to-r from-purple-600 to-amber-600 text-white text-xs"
        >
          <Zap className="mr-1 h-4 w-4" /> Buy Horse (50 Coins)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {horses?.map((horse, i) => (
          <motion.div key={horse.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="p-4 border-purple-500/10 bg-card/80 backdrop-blur-sm hover:border-purple-500/30 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold">{horse.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{horse.breed}</p>
                  <p className="text-[10px] text-amber-400">Level {horse.level}</p>
                </div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg border-2 border-white/20" style={{ backgroundColor: horse.color }} />
                  <div className="absolute -inset-1 rounded-xl blur-md opacity-30" style={{ backgroundColor: horse.color }} />
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                {[
                  { label: "Speed", value: horse.speed_stat, color: "text-yellow-400" },
                  { label: "Stamina", value: horse.stamina_stat, color: "text-blue-400" },
                  { label: "Acceleration", value: horse.acceleration_stat, color: "text-orange-400" },
                ].map(s => (
                  <div key={s.label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className={`font-bold ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Races: {horse.total_races} • Wins: {horse.total_wins}</span>
                {horse.total_wins > 0 && <Trophy className="h-3.5 w-3.5 text-amber-400" />}
              </div>
            </Card>
          </motion.div>
        ))}
        {(!horses || horses.length === 0) && (
          <div className="col-span-full text-center py-12">
            <Zap className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">No horses yet — buy your first horse!</p>
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
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 pt-20 sm:pt-24">
        {activeView !== "dashboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 flex items-center gap-3">
            <Button variant="ghost" onClick={() => setActiveView("dashboard")} className="gap-2 drop-shadow-md">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Button>
            {!user && (
              <Button onClick={() => navigate('/auth')} variant="outline" size="sm" className="ml-auto">
                <LogIn className="h-4 w-4 mr-1" /> Sign In
              </Button>
            )}
          </motion.div>
        )}

        {activeView === "dashboard" && !user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 flex justify-end">
            <Button onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-purple-600 to-amber-600 text-white"
            >
              <LogIn className="mr-2 h-4 w-4" /> Sign In to Play
            </Button>
          </motion.div>
        )}

        {viewComponents[activeView]}
      </div>

      {/* Buy Horse Dialog */}
      <Dialog open={showBuyHorse} onOpenChange={setShowBuyHorse}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy New Horse</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Horse Name</Label>
              <Input value={horseName} onChange={e => setHorseName(e.target.value)} placeholder="Enter name" />
            </div>
            <div>
              <Label>Breed</Label>
              <Select value={horseBreed} onValueChange={setHorseBreed}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="thoroughbred">Thoroughbred</SelectItem>
                  <SelectItem value="arabian">Arabian</SelectItem>
                  <SelectItem value="quarter">Quarter Horse</SelectItem>
                  <SelectItem value="mustang">Mustang</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-1">
                {["#8B4513", "#000000", "#FFFFFF", "#808080", "#D2691E"].map(c => (
                  <button key={c} onClick={() => setHorseColor(c)}
                    className="w-10 h-10 rounded-lg border-2 transition-all"
                    style={{ backgroundColor: c, borderColor: horseColor === c ? "hsl(var(--primary))" : "rgba(255,255,255,0.1)" }}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleBuyHorse} className="w-full bg-gradient-to-r from-purple-600 to-amber-600 text-white">
              Buy Horse — 50 Coins
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
