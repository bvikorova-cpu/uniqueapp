import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Sparkles, Box, Store, Users, Coins, Crown, ArrowLeft,
  Gem, TrendingUp, Brain, Shuffle, Handshake, Gift, Eye,
  BarChart3, ShoppingBag, History
} from "lucide-react";
import GenerateCollectible from "@/components/collectibles/GenerateCollectible";
import MyCollection from "@/components/collectibles/MyCollection";
import MysteryBoxes from "@/components/collectibles/MysteryBoxes";
import CollectiblesMarketplace from "@/components/collectibles/CollectiblesMarketplace";
import VipSubscription from "@/components/collectibles/VipSubscription";
import PurchaseHistory from "@/components/collectibles/PurchaseHistory";
import BuyCreditsDialog from "@/components/collectibles/BuyCreditsDialog";
import AIRarityPredictor from "@/components/collectibles/AIRarityPredictor";
import AICollectionAdvisor from "@/components/collectibles/AICollectionAdvisor";
import MysteryBoxSimulator from "@/components/collectibles/MysteryBoxSimulator";
import CollectibleTradingHub from "@/components/collectibles/CollectibleTradingHub";
import CollectorLeaderboard from "@/components/collectibles/CollectorLeaderboard";
import AIItemCustomizer from "@/components/collectibles/AIItemCustomizer";
import CollectorAchievements from "@/components/collectibles/CollectorAchievements";
import CollectiblePriceAlerts from "@/components/collectibles/CollectiblePriceAlerts";
import DailyLoginRewards from "@/components/collectibles/DailyLoginRewards";
import CollectorGuilds from "@/components/collectibles/CollectorGuilds";
import heroVideo from "@/assets/collectibles-hero.mp4.asset.json";

type ActiveView = "hub" | "generate" | "collection" | "mystery" | "marketplace" | "vip" | "credits" | "history" | "rarity-predictor" | "collection-advisor" | "box-simulator" | "trading-hub" | "leaderboard" | "item-customizer" | "achievements" | "price-alerts" | "daily-rewards" | "guilds";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

const stats = [
  { label: "Items", value: "12.4K", icon: Gem },
  { label: "Collections", value: "2.8K", icon: Box },
  { label: "Mystery Boxes", value: "890", icon: Gift },
  { label: "Trades", value: "5.1K", icon: Handshake },
];

const tools: { id: ActiveView; icon: any; title: string; desc: string; cost?: string; gradient: string }[] = [
  { id: "generate", icon: Sparkles, title: "Generate Item", desc: "Create unique AI collectibles", cost: "10 Credits", gradient: "from-purple-500/20 to-pink-500/20" },
  { id: "collection", icon: Box, title: "My Collection", desc: "View and manage your items", gradient: "from-blue-500/20 to-cyan-500/20" },
  { id: "mystery", icon: Gift, title: "Mystery Boxes", desc: "Open boxes for random rewards", gradient: "from-amber-500/20 to-orange-500/20" },
  { id: "marketplace", icon: Store, title: "Marketplace", desc: "Buy and sell with others", gradient: "from-emerald-500/20 to-teal-500/20" },
  { id: "rarity-predictor", icon: TrendingUp, title: "AI Rarity Predictor", desc: "Predict future value & rarity", cost: "8 Credits", gradient: "from-violet-500/20 to-purple-500/20" },
  { id: "collection-advisor", icon: Brain, title: "AI Collection Advisor", desc: "Smart portfolio recommendations", cost: "5 Credits", gradient: "from-rose-500/20 to-pink-500/20" },
  { id: "box-simulator", icon: Shuffle, title: "Box Simulator", desc: "Preview outcomes before opening", cost: "3 Credits", gradient: "from-cyan-500/20 to-blue-500/20" },
  { id: "trading-hub", icon: Handshake, title: "Trading Hub", desc: "P2P trading with escrow", gradient: "from-green-500/20 to-emerald-500/20" },
  { id: "vip", icon: Crown, title: "VIP Membership", desc: "Exclusive perks & daily boxes", gradient: "from-yellow-500/20 to-amber-500/20" },
  { id: "credits", icon: Coins, title: "Buy Credits", desc: "Purchase credit packs", gradient: "from-indigo-500/20 to-violet-500/20" },
  { id: "history", icon: History, title: "Purchase History", desc: "View all transactions", gradient: "from-slate-500/20 to-gray-500/20" },
  { id: "leaderboard", icon: BarChart3, title: "Leaderboard", desc: "Top collectors ranked by value", gradient: "from-yellow-500/20 to-orange-500/20" },
  { id: "item-customizer", icon: Sparkles, title: "AI Item Customizer", desc: "AI visual modifications for items", cost: "12 Credits", gradient: "from-fuchsia-500/20 to-pink-500/20" },
  { id: "achievements", icon: Crown, title: "Achievements", desc: "Badges & milestone rewards", gradient: "from-amber-500/20 to-yellow-500/20" },
  { id: "price-alerts", icon: TrendingUp, title: "Price Alerts", desc: "Market value notifications", cost: "5 Credits", gradient: "from-red-500/20 to-rose-500/20" },
  { id: "daily-rewards", icon: Gift, title: "Daily Rewards", desc: "Login bonuses & streaks", gradient: "from-lime-500/20 to-green-500/20" },
  { id: "guilds", icon: Users, title: "Guilds", desc: "Community groups & perks", gradient: "from-sky-500/20 to-blue-500/20" },
];

export default function Collectibles() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [activeView, setActiveView] = useState<ActiveView>("hub");
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const verifyRanRef = useRef(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate("/auth");
      else setUser(data.user);
    });
  }, [navigate]);

  // Verify Stripe credits payment after success redirect (idempotent — guarded against refresh)
  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (payment === "success" && sessionId && !verifyRanRef.current) {
      verifyRanRef.current = true;
      supabase.functions
        .invoke("verify-payment", { body: { sessionId, product_type: "collectibles_credits" } })
        .then(({ error }) => {
          if (error) {
            toast({ title: "Verification failed", description: error.message, variant: "destructive" });
          } else {
            toast({ title: "Payment successful!", description: "Your credits have been added." });
          }
        })
        .finally(() => {
          const url = new URL(window.location.href);
          url.searchParams.delete("payment");
          url.searchParams.delete("session_id");
          window.history.replaceState({}, "", url.pathname + url.search);
        });
    } else if (payment === "canceled") {
      toast({ title: "Payment canceled", description: "No charge was made." });
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [searchParams, toast]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case "generate": return <GenerateCollectible userId={user.id} />;
      case "collection": return <MyCollection userId={user.id} />;
      case "mystery": return <MysteryBoxes userId={user.id} />;
      case "marketplace": return <CollectiblesMarketplace userId={user.id} />;
      case "vip": return (
        <div className="grid gap-6 md:grid-cols-2">
          <VipSubscription />
          <PurchaseHistory userId={user.id} />
        </div>
      );
      case "credits": return <BuyCreditsInline />;
      case "history": return <PurchaseHistory userId={user.id} />;
      case "rarity-predictor": return <AIRarityPredictor userId={user.id} />;
      case "collection-advisor": return <AICollectionAdvisor userId={user.id} />;
      case "box-simulator": return <MysteryBoxSimulator userId={user.id} />;
      case "trading-hub": return <CollectibleTradingHub userId={user.id} />;
      case "leaderboard": return <CollectorLeaderboard userId={user.id} />;
      case "item-customizer": return <AIItemCustomizer userId={user.id} />;
      case "achievements": return <CollectorAchievements userId={user.id} />;
      case "price-alerts": return <CollectiblePriceAlerts userId={user.id} />;
      case "daily-rewards": return <DailyLoginRewards userId={user.id} />;
      case "guilds": return <CollectorGuilds userId={user.id} />;
      default: return null;
    }
  };

  if (activeView !== "hub") {
    const currentTool = tools.find(t => t.id === activeView);
    return (
      <div className="min-h-screen bg-background pt-20 pb-8">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          <Button variant="ghost" onClick={() => setActiveView("hub")} className="mb-4 gap-2 drop-shadow-md">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
            {renderView()}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cinematic Video Hero */}
      <div className="relative h-[62vh] sm:h-[55vh] overflow-hidden bg-black">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-[1.3] saturate-[1.2]"
          src={heroVideo.url}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-16 sm:p-8">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mb-3 inline-flex max-w-fit rounded-2xl border border-border/50 bg-background/80 px-4 py-3 shadow-glow backdrop-blur-xl"
            >
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
                Collectibles
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4 max-w-xl rounded-xl bg-background/55 px-4 py-2 text-sm text-foreground/90 backdrop-blur-md sm:text-lg"
            >
              AI-powered digital collectibles — generate, trade, open mystery boxes
            </motion.p>

            {/* Stats Overlay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="bg-black/55 backdrop-blur-xl rounded-xl p-3 border border-white/20 shadow-lg">
                  <div className="flex items-center gap-2">
                    <stat.icon className="h-4 w-4 text-purple-300" />
                    <span className="text-xs text-white/80">{stat.label}</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-white mt-1 drop-shadow-md">{stat.value}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Engagement Row */}
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 -mt-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8"
        >
          <Card className="p-4 bg-card/80 backdrop-blur-xl border-primary/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Daily Streak</p>
                <p className="text-lg font-bold">🔥 3 Days</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card/80 backdrop-blur-xl border-primary/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Collection Value</p>
                <p className="text-lg font-bold">📈 Rising</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card/80 backdrop-blur-xl border-primary/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Crown className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Collector Rank</p>
                <p className="text-lg font-bold">🏆 Silver</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tool Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pb-8"
        >
          {tools.map((tool) => (
            <motion.div key={tool.id} variants={itemVariants}>
              <Card
                onClick={() => tool.id === "credits" ? setShowBuyDialog(true) : setActiveView(tool.id)}
                className={`p-4 sm:p-5 cursor-pointer group hover:shadow-xl transition-all duration-300 
                  hover:scale-[1.03] active:scale-[0.97] bg-gradient-to-br ${tool.gradient} 
                  border-white/10 backdrop-blur-sm relative overflow-hidden`}
              >
                {tool.cost && (
                  <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] bg-primary/20 text-primary">
                    {tool.cost}
                  </Badge>
                )}
                <tool.icon className="h-7 w-7 sm:h-8 sm:w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-sm sm:text-base mb-1">{tool.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{tool.desc}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <BuyCreditsDialog open={showBuyDialog} onOpenChange={setShowBuyDialog} />
    </div>
  );
}

function BuyCreditsInline() {
  const [showDialog, setShowDialog] = useState(true);
  return <BuyCreditsDialog open={showDialog} onOpenChange={setShowDialog} />;
}
