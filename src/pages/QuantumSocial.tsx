import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Atom, FileText, Eye, Users, Zap, Settings,
  MessageSquare, Vote, Trophy, Sparkles,
  Gem, Merge, Swords, Clock, Network
} from "lucide-react";
import { QuantumSocialHero } from "@/components/quantum-social/QuantumSocialHero";
import { QuantumSocialEngagement } from "@/components/quantum-social/QuantumSocialEngagement";
import { QuantumSocialToolCard } from "@/components/quantum-social/QuantumSocialToolCard";
import QuantumFeed from "@/components/quantum-social/QuantumFeed";
import QuantumProfile from "@/components/quantum-social/QuantumProfile";
import QuantumObserver from "@/components/quantum-social/QuantumObserver";
import QuantumEntanglements from "@/components/quantum-social/QuantumEntanglements";
import QuantumSubscriptions from "@/components/quantum-social/QuantumSubscriptions";
import { QuantumChatRooms } from "@/components/quantum-social/QuantumChatRooms";
import { RealityVoting } from "@/components/quantum-social/RealityVoting";
import { QuantumAchievements } from "@/components/quantum-social/QuantumAchievements";
import { AIQuantumOracle } from "@/components/quantum-social/AIQuantumOracle";
import { QuantumNFTs } from "@/components/quantum-social/QuantumNFTs";
import { RealityMerge } from "@/components/quantum-social/RealityMerge";
import { QuantumTournaments } from "@/components/quantum-social/QuantumTournaments";
import { ObserverLeaderboard } from "@/components/quantum-social/ObserverLeaderboard";
import { QuantumTimeTravel } from "@/components/quantum-social/QuantumTimeTravel";
import { EntanglementNetworkMap } from "@/components/quantum-social/EntanglementNetworkMap";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type ViewType = "hub" | "feed" | "profile" | "observer" | "entanglements" | "subscriptions" | "chat" | "voting" | "achievements" | "oracle" | "nfts" | "merge" | "tournaments" | "leaderboard" | "timetravel" | "networkmap";

const tools = [
  { id: "feed" as ViewType, icon: FileText, title: "Quantum Feed", description: "Posts in superposition — each viewer sees a different reality", gradient: "from-cyan-500/10 to-cyan-500/5", iconColor: "text-cyan-400" },
  { id: "chat" as ViewType, icon: MessageSquare, title: "Quantum Chat Rooms", description: "Messages exist in superposition until observed", badge: "Live", gradient: "from-violet-500/10 to-violet-500/5", iconColor: "text-violet-400" },
  { id: "nfts" as ViewType, icon: Gem, title: "Quantum NFTs", description: "Mint rare quantum moments as collectible NFTs", badge: "AI", credits: 2, gradient: "from-amber-500/10 to-amber-500/5", iconColor: "text-amber-400" },
  { id: "merge" as ViewType, icon: Merge, title: "Reality Merge", description: "Hybridize two versions of a post into one", badge: "AI", credits: 2, gradient: "from-pink-500/10 to-violet-500/5", iconColor: "text-pink-400" },
  { id: "oracle" as ViewType, icon: Sparkles, title: "AI Quantum Oracle", description: "AI predictions across quantum dimensions", badge: "AI", credits: 3, gradient: "from-violet-500/10 to-cyan-500/5", iconColor: "text-violet-400" },
  { id: "tournaments" as ViewType, icon: Swords, title: "Quantum Tournaments", description: "Compete in reality-collapsing events", badge: "New", gradient: "from-red-500/10 to-red-500/5", iconColor: "text-red-400" },
  { id: "leaderboard" as ViewType, icon: Eye, title: "Observer Leaderboard", description: "Global rankings of top quantum observers", badge: "Free", gradient: "from-blue-500/10 to-blue-500/5", iconColor: "text-blue-400" },
  { id: "timetravel" as ViewType, icon: Clock, title: "Quantum Time Travel", description: "View historical versions of collapsed posts", badge: "AI", credits: 1, gradient: "from-cyan-500/10 to-emerald-500/5", iconColor: "text-cyan-400" },
  { id: "networkmap" as ViewType, icon: Network, title: "Entanglement Map", description: "Visual graph of all quantum connections", badge: "AI", credits: 2, gradient: "from-emerald-500/10 to-cyan-500/5", iconColor: "text-emerald-400" },
  { id: "voting" as ViewType, icon: Vote, title: "Reality Voting", description: "Community votes to collapse quantum states", gradient: "from-pink-500/10 to-pink-500/5", iconColor: "text-pink-400" },
  { id: "observer" as ViewType, icon: Eye, title: "Observer Mode", description: "See all quantum versions of every post", gradient: "from-blue-500/10 to-blue-500/5", iconColor: "text-blue-400" },
  { id: "entanglements" as ViewType, icon: Users, title: "Entanglements", description: "Quantum connections with other users", gradient: "from-emerald-500/10 to-emerald-500/5", iconColor: "text-emerald-400" },
  { id: "achievements" as ViewType, icon: Trophy, title: "Achievements", description: "Earn badges exploring quantum realities", gradient: "from-amber-500/10 to-amber-500/5", iconColor: "text-amber-400" },
  { id: "profile" as ViewType, icon: Settings, title: "Quantum Profile", description: "Manage your quantum reality versions", gradient: "from-cyan-500/10 to-violet-500/5", iconColor: "text-cyan-400" },
  { id: "subscriptions" as ViewType, icon: Zap, title: "Subscriptions", description: "Manage quantum premium plans", gradient: "from-pink-500/10 to-violet-500/5", iconColor: "text-pink-400" },
];

const QuantumSocial = () => {
  const [activeView, setActiveView] = useState<ViewType>("hub");
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const verifiedRef = useRef(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const payment = searchParams.get("payment");
    if (payment === "canceled") {
      toast({ title: "Payment canceled", variant: "destructive" });
      const next = new URLSearchParams(searchParams);
      next.delete("payment");
      setSearchParams(next, { replace: true });
      return;
    }
    if (!sessionId || verifiedRef.current) return;
    verifiedRef.current = true;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { session_id: sessionId },
        });
        if (error) throw error;
        if (data?.verified) {
          toast({ title: "Payment confirmed", description: `${data.product_type?.replace(/_/g, " ")} unlocked.` });
          window.dispatchEvent(new CustomEvent("quantum-access-refresh"));
          setActiveView("subscriptions");
        } else {
          toast({ title: "Payment not confirmed", description: data?.status || "Try again later", variant: "destructive" });
        }
      } catch (e: any) {
        toast({ title: "Verification failed", description: e.message, variant: "destructive" });
      } finally {
        const next = new URLSearchParams(searchParams);
        next.delete("session_id");
        next.delete("payment");
        setSearchParams(next, { replace: true });
      }
    })();
  }, [searchParams, setSearchParams, toast]);

  const renderView = () => {
    switch (activeView) {
      case "feed": return <QuantumFeed onBack={() => setActiveView("hub")} />;
      case "profile": return <QuantumProfile onBack={() => setActiveView("hub")} />;
      case "observer": return <QuantumObserver onBack={() => setActiveView("hub")} />;
      case "entanglements": return <QuantumEntanglements onBack={() => setActiveView("hub")} />;
      case "subscriptions": return <QuantumSubscriptions onBack={() => setActiveView("hub")} />;
      case "chat": return <QuantumChatRooms onBack={() => setActiveView("hub")} />;
      case "voting": return <RealityVoting onBack={() => setActiveView("hub")} />;
      case "achievements": return <QuantumAchievements onBack={() => setActiveView("hub")} />;
      case "oracle": return <AIQuantumOracle onBack={() => setActiveView("hub")} />;
      case "nfts": return <QuantumNFTs onBack={() => setActiveView("hub")} />;
      case "merge": return <RealityMerge onBack={() => setActiveView("hub")} />;
      case "tournaments": return <QuantumTournaments onBack={() => setActiveView("hub")} />;
      case "leaderboard": return <ObserverLeaderboard onBack={() => setActiveView("hub")} />;
      case "timetravel": return <QuantumTimeTravel onBack={() => setActiveView("hub")} />;
      case "networkmap": return <EntanglementNetworkMap onBack={() => setActiveView("hub")} />;
      default: return null;
    }
  };

  if (activeView !== "hub") {
    return (
      
    <>
      <FloatingHowItWorks title="Quantum Social Network" steps={[{ title: "Ask the Oracle", desc: "Quantum AI answers reality-bending questions." }, { title: "Entangle with users", desc: "Form quantum pairs for synced experiences." }, { title: "Observe outcomes", desc: "Predictions collapse based on your choices." }, { title: "Iterate", desc: "Rerun experiments to see new branches." }]} />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pt-20 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderView()}
          </motion.div>
        </div>
      </div>
    </>
  );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-20 pb-8 space-y-8">
        <QuantumSocialHero />
        <HeroRewardedAd sectionKey="page_quantumsocial" />

        <QuantumSocialEngagement />
        <div>
          <h2 className="text-xl font-bold mb-4">Explore Quantum Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tools.map((tool, i) => (
              <QuantumSocialToolCard
                key={tool.id}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                badge={tool.badge}
                credits={tool.credits}
                gradient={tool.gradient}
                iconColor={tool.iconColor}
                onClick={() => setActiveView(tool.id)}
                delay={0.05 * i}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumSocial;
