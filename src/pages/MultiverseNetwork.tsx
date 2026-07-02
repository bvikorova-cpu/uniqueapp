import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { 
  Globe, Layers, Shuffle, Crown, Sparkles, Users, Loader2,
  BarChart3, GitBranch, MessageCircle, Dices, Compass, Network, TrendingUp,
  BookOpen, CreditCard, Gamepad2, Medal, Swords, Eye
} from "lucide-react";
import { Infinity as InfinityIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MultiverseHero } from "@/components/multiverse/MultiverseHero";
import { MultiverseEngagement } from "@/components/multiverse/MultiverseEngagement";
import { MultiverseToolCard } from "@/components/multiverse/MultiverseToolCard";
import UniverseCreator from "@/components/multiverse/UniverseCreator";
import MyUniverses from "@/components/multiverse/MyUniverses";
import TimelineMerger from "@/components/multiverse/TimelineMerger";
import BestSelfFinder from "@/components/multiverse/BestSelfFinder";
import RealityComparison from "@/components/multiverse/RealityComparison";
import MultiverseTimeline from "@/components/multiverse/MultiverseTimeline";
import QuantumChat from "@/components/multiverse/QuantumChat";
import RealityLottery from "@/components/multiverse/RealityLottery";
import MultiversePricing from "@/components/multiverse/MultiversePricing";
import QuantumNavigator from "@/components/multiverse/QuantumNavigator";
import DecisionTreeMapper from "@/components/multiverse/DecisionTreeMapper";
import DimensionalAnalytics from "@/components/multiverse/DimensionalAnalytics";
import MultiverseCommunity from "@/components/multiverse/MultiverseCommunity";
import QuantumJournal from "@/components/multiverse/QuantumJournal";
import ParallelLifeSimulator from "@/components/multiverse/ParallelLifeSimulator";
import MultiverseLeaderboard from "@/components/multiverse/MultiverseLeaderboard";
import RealityClashArena from "@/components/multiverse/RealityClashArena";
import QuantumDestinyForecast from "@/components/multiverse/QuantumDestinyForecast";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type ViewType = "hub" | "create" | "my-universes" | "timeline-merger" | "best-self" | 
  "comparison" | "timeline-view" | "quantum-chat" | "reality-lottery" | "pricing" |
  "navigator" | "decision-tree" | "analytics" | "community" | "journal" |
  "life-simulator" | "leaderboard" | "clash-arena" | "destiny-forecast";

const tools = [
  { id: "create" as ViewType, icon: Globe, title: "Create Universe", description: "Generate AI-powered alternate realities", color: "violet", badge: "AI" },
  { id: "my-universes" as ViewType, icon: InfinityIcon, title: "My Universes", description: "Browse & manage parallel dimensions", color: "blue" },
  { id: "life-simulator" as ViewType, icon: Gamepad2, title: "Life Simulator", description: "Live a full day in your alternate reality", color: "fuchsia", badge: "AI" },
  { id: "life-simulator" as ViewType, icon: Gamepad2, title: "Life Simulator", description: "Live a full day in your alternate reality", color: "fuchsia", badge: "AI" },
  { id: "clash-arena" as ViewType, icon: Swords, title: "Reality Clash", description: "Pit two versions of yourself in battle", color: "rose", badge: "AI" },
  { id: "destiny-forecast" as ViewType, icon: Eye, title: "Destiny Forecast", description: "AI predicts your multiverse future", color: "indigo", badge: "AI" },
  { id: "navigator" as ViewType, icon: Compass, title: "Quantum Navigator", description: "Navigate through your realities one by one", color: "cyan" },
  { id: "timeline-merger" as ViewType, icon: Layers, title: "Timeline Merger", description: "Combine universes into optimal reality", color: "blue" },
  { id: "best-self" as ViewType, icon: Crown, title: "Best Self Finder", description: "AI identifies your most successful version", color: "amber", badge: "AI" },
  { id: "comparison" as ViewType, icon: BarChart3, title: "Reality Comparison", description: "Compare parallel versions side by side", color: "blue" },
  { id: "timeline-view" as ViewType, icon: GitBranch, title: "Multiverse Timeline", description: "Visual timeline of reality divergences", color: "indigo" },
  { id: "quantum-chat" as ViewType, icon: MessageCircle, title: "Quantum Chat", description: "Chat with your alternate selves via AI", color: "pink", badge: "AI" },
  { id: "quantum-chat" as ViewType, icon: MessageCircle, title: "Quantum Chat", description: "Chat with your alternate selves via AI", color: "pink", badge: "AI" },
  { id: "reality-lottery" as ViewType, icon: Dices, title: "Reality Lottery", description: "Random parallel life generator", color: "amber" },
  { id: "decision-tree" as ViewType, icon: Network, title: "Decision Tree", description: "Map decision consequences across realities", color: "emerald", badge: "AI" },
  { id: "leaderboard" as ViewType, icon: Medal, title: "Leaderboard", description: "Top multiverse explorers ranked", color: "amber" },
  { id: "analytics" as ViewType, icon: TrendingUp, title: "Analytics", description: "Analyze performance across dimensions", color: "violet" },
  { id: "community" as ViewType, icon: Users, title: "Community", description: "Connect with other explorers", color: "cyan" },
  { id: "journal" as ViewType, icon: BookOpen, title: "Quantum Journal", description: "Record multiverse reflections", color: "indigo" },
  { id: "pricing" as ViewType, icon: CreditCard, title: "Access Plans", description: "Subscriptions & one-time purchases", color: "emerald" },
  { id: "pricing" as ViewType, icon: CreditCard, title: "Access Plans", description: "Subscriptions & one-time purchases", color: "emerald" },
];

const MultiverseNetwork = () => {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<ViewType>("hub");
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [universesCount, setUniversesCount] = useState(0);

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        if (!session) window.location.href = '/auth';
        else {
          const { data } = await supabase.functions.invoke('get-user-universes');
          if (data?.universes) setUniversesCount(data.universes.length);
        }
      } catch (e) { console.error(e); }
      finally { setCheckingAuth(false); }
    };
    check();
  }, []);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId && searchParams.get('payment') === 'success') {
      const verify = async () => {
        try {
          setVerifying(true);
          const { data, error } = await supabase.functions.invoke('verify-multiverse-payment', { body: { sessionId } });
          if (error) throw error;
          if (data.success) {
            toast({ title: "Payment Successful", description: `Access to ${data.serviceType} activated!` });
            window.history.replaceState({}, '', '/multiverse-network');
          }
        } catch (e) {
          toast({ title: "Verification Failed", description: "Please contact support", variant: "destructive" });
        } finally { setVerifying(false); }
      };
      verify();
    }
  }, [searchParams]);

  if (checkingAuth) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-400" /></div>;
  }
  if (!user) return null;

  const goBack = () => setActiveView("hub");

  const renderView = () => {
    switch (activeView) {
      case "create": return <UniverseCreator onUniverseCreated={() => setActiveView("my-universes")} />;
      case "my-universes": return <MyUniverses />;
      case "timeline-merger": return <TimelineMerger />;
      case "best-self": return <BestSelfFinder />;
      case "comparison": return <RealityComparison onBack={goBack} />;
      case "timeline-view": return <MultiverseTimeline onBack={goBack} />;
      case "quantum-chat": return <QuantumChat onBack={goBack} />;
      case "reality-lottery": return <RealityLottery onBack={goBack} />;
      case "pricing": return <MultiversePricing onBack={goBack} />;
      case "navigator": return <QuantumNavigator onBack={goBack} />;
      case "decision-tree": return <DecisionTreeMapper onBack={goBack} />;
      case "analytics": return <DimensionalAnalytics onBack={goBack} />;
      case "community": return <MultiverseCommunity onBack={goBack} />;
      case "journal": return <QuantumJournal onBack={goBack} />;
      case "life-simulator": return <ParallelLifeSimulator onBack={goBack} />;
      case "leaderboard": return <MultiverseLeaderboard onBack={goBack} />;
      case "clash-arena": return <RealityClashArena onBack={goBack} />;
      case "destiny-forecast": return <QuantumDestinyForecast onBack={goBack} />;
      default: return null;
    }
  };

  return (
    
    <>
      <FloatingHowItWorks title="Multiverse Profile Network" steps={[{ title: "Create alternate selves", desc: "Different personas across parallel timelines." }, { title: "Switch profiles", desc: "Interact as any version of you." }, { title: "Match universes", desc: "Meet users on compatible timelines." }, { title: "Merge insights", desc: "Combine learnings from every self." }]} />
      <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Deep space cosmic background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-black to-black" />
        {/* Animated stars */}
        {Array.from({ length: 50 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
        {/* Nebula effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-cyan-600/5 blur-3xl" />
        <div className="absolute top-2/3 left-1/2 w-72 h-72 rounded-full bg-fuchsia-600/5 blur-3xl" />
      </div>

      {verifying && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-6 bg-violet-950/60 border-violet-500/30"><div className="flex items-center gap-3"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /><p className="text-violet-200">Verifying payment...</p></div></Card>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 pt-20 pb-8">
        {activeView === "hub" ? (
          <>
            <MultiverseHero />
            <HeroRewardedAd sectionKey="page_multiversenetwork" />

            <MultiverseEngagement 
              universesCount={universesCount} 
              bestSelfScore={0} 
              achievements={0} 
            />

            {/* Tool Cards Grid */}
            <div className="mb-8">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-black mb-6"
                style={{
                  background: 'linear-gradient(135deg, #c084fc, #22d3ee, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Multiverse Tools
              </motion.h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {tools.map((tool, i) => (
                  <MultiverseToolCard
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

            {/* How It Works - cosmic style */}
            <Card className="border-violet-500/20 bg-black/50 backdrop-blur-xl overflow-hidden">
              <div className="h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-black" style={{ background: 'linear-gradient(135deg, #c084fc, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  How It Works
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Globe, title: "1. Create Universe", desc: "AI generates parallel realities from your divergence points" },
                    { icon: Shuffle, title: "2. Jump Realities", desc: "Navigate between dimensions to explore different life paths" },
                    { icon: Swords, title: "3. Clash & Compare", desc: "Pit versions against each other and find the best one" },
                    { icon: Eye, title: "4. Forecast Destiny", desc: "AI predicts your future across all parallel timelines" },
                  ].map((step, i) => (
                    <motion.div 
                      key={i} 
                      className="text-center space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <motion.div 
                        className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        animate={{ boxShadow: ['0 0 10px rgba(139,92,246,0.1)', '0 0 20px rgba(139,92,246,0.3)', '0 0 10px rgba(139,92,246,0.1)'] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                      >
                        <step.icon className="w-6 h-6 text-violet-400" />
                      </motion.div>
                      <h4 className="font-bold text-sm text-violet-200">{step.title}</h4>
                      <p className="text-xs text-violet-300/50">{step.desc}</p>
                    </motion.div>
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
    </>
  );
};

export default MultiverseNetwork;
