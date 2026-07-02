import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bot, Sparkles, Users, MessageCircle, Heart, BarChart3, Brain, 
  Mic, Swords, Trophy, Activity, Crown, Flame, Star, Award 
} from "lucide-react";
import { CloneHero } from "@/components/ai-clone/CloneHero";
import { CloneCreator } from "@/components/ai-clone/CloneCreator";
import { MyClones } from "@/components/ai-clone/MyClones";
import { CloneMarketplace } from "@/components/ai-clone/CloneMarketplace";
import { CloneDating } from "@/components/ai-clone/CloneDating";
import { CloneSubscriptions } from "@/components/ai-clone/CloneSubscriptions";
import { CloneAnalytics } from "@/components/ai-clone/CloneAnalytics";
import { ClonePersonalityQuiz } from "@/components/ai-clone/ClonePersonalityQuiz";
import { CloneVoice } from "@/components/ai-clone/CloneVoice";
import { CloneBattles } from "@/components/ai-clone/CloneBattles";
import { CloneLeaderboard } from "@/components/ai-clone/CloneLeaderboard";
import { CloneSocialFeed } from "@/components/ai-clone/CloneSocialFeed";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type ViewType = "hub" | "create" | "my-clones" | "marketplace" | "dating" | "subscriptions" | "analytics" | "quiz" | "voice" | "battles" | "leaderboard" | "feed";

const TOOLS = [
  { id: "create" as ViewType, icon: Sparkles, label: "Create Clone", desc: "Build your AI twin", color: "text-purple-400" },
  { id: "my-clones" as ViewType, icon: Bot, label: "My Clones", desc: "Manage your clones", color: "text-cyan-400" },
  { id: "marketplace" as ViewType, icon: Users, label: "Marketplace", desc: "Explore public clones", color: "text-emerald-400" },
  { id: "dating" as ViewType, icon: Heart, label: "Clone Dating", desc: "Auto-match clones", color: "text-pink-400" },
  { id: "quiz" as ViewType, icon: Brain, label: "Personality Quiz", desc: "Discover your profile", color: "text-amber-400" },
  { id: "voice" as ViewType, icon: Mic, label: "Voice Studio", desc: "Define clone voice", color: "text-indigo-400" },
  { id: "battles" as ViewType, icon: Swords, label: "Clone Battles", desc: "Wit & charm duels", color: "text-red-400" },
  { id: "analytics" as ViewType, icon: BarChart3, label: "Analytics", desc: "Performance insights", color: "text-teal-400" },
  { id: "leaderboard" as ViewType, icon: Trophy, label: "Leaderboard", desc: "Top clones ranking", color: "text-yellow-400" },
  { id: "feed" as ViewType, icon: Activity, label: "Social Feed", desc: "Network activity", color: "text-orange-400" },
  { id: "subscriptions" as ViewType, icon: Crown, label: "Subscriptions", desc: "Upgrade your plan", color: "text-violet-400" },
];

export default function AIClone() {
  const [activeView, setActiveView] = useState<ViewType>("hub");

  // Handle Stripe payment redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const sessionId = params.get("session_id");
    if (payment === "success" && sessionId) {
      supabase.functions.invoke("verify-payment", { body: { session_id: sessionId } })
        .then(({ data }) => {
          if (data?.verified) toast.success("Payment confirmed! Your purchase is now active.");
          else toast.error("Payment could not be verified.");
        })
        .catch(() => toast.error("Payment verification failed."));
      window.history.replaceState({}, "", "/ai-clone");
    } else if (payment === "canceled") {
      toast.info("Payment canceled.");
      window.history.replaceState({}, "", "/ai-clone");
    }
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["clone-profile-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("personality_clones")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      return { count: data };
    },
  });

  const renderView = () => {
    switch (activeView) {
      case "create": return <CloneCreator />;
      case "my-clones": return <MyClones />;
      case "marketplace": return <CloneMarketplace />;
      case "dating": return <CloneDating />;
      case "subscriptions": return <CloneSubscriptions />;
      case "analytics": return <CloneAnalytics />;
      case "quiz": return <ClonePersonalityQuiz />;
      case "voice": return <CloneVoice />;
      case "battles": return <CloneBattles />;
      case "leaderboard": return <CloneLeaderboard />;
      case "feed": return <CloneSocialFeed />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingHowItWorks
        title="Personality Clone"
        intro="Create your AI clone \u2014 voice, style and personality."
        steps={[
          { title: "Upload samples", desc: "Photos, voice recordings, writing samples." },
          { title: "Train the clone", desc: "AI learns your tone and appearance." },
          { title: "Chat with your clone", desc: "Practice interviews, dating, presentations." },
          { title: "Generate content", desc: "Let the clone reply to fans or write drafts." },
          { title: "Manage privacy", desc: "Delete data or lock the clone anytime." }
        ]}
      />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <CloneHero />

        <HeroRewardedAd sectionKey="page_aiclone" />

        {/* Engagement Row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Card className="p-3 sm:p-4 bg-card/80 backdrop-blur-xl border-primary/20 text-center">
            <Flame className="h-5 w-5 text-purple-400 mx-auto mb-1" />
            <p className="text-lg sm:text-2xl font-black">0</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Active Clones</p>
          </Card>
          <Card className="p-3 sm:p-4 bg-card/80 backdrop-blur-xl border-primary/20 text-center">
            <Star className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-lg sm:text-2xl font-black">0</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Conversations</p>
          </Card>
          <Card className="p-3 sm:p-4 bg-card/80 backdrop-blur-xl border-primary/20 text-center">
            <Award className="h-5 w-5 text-pink-400 mx-auto mb-1" />
            <p className="text-lg sm:text-2xl font-black capitalize">Basic</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Tier</p>
          </Card>
        </div>

        {/* Back button when in sub-view */}
        {activeView !== "hub" && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4 text-sm font-medium text-primary hover:underline flex items-center gap-1"
            onClick={() => setActiveView("hub")}
          >
            ← Back to Hub
          </motion.button>
        )}

        {activeView === "hub" ? (
          <>
            {/* Tool Cards Grid */}
            <h2 className="text-xl sm:text-2xl font-black mb-4">Clone Tools</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
              {TOOLS.map((tool, i) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Card
                    className="p-4 cursor-pointer hover:border-primary/40 transition-all bg-card/80 backdrop-blur-xl border-primary/20 text-center h-full"
                    onClick={() => setActiveView(tool.id)}
                  >
                    <tool.icon className={`h-6 w-6 ${tool.color} mx-auto mb-2`} />
                    <p className="text-xs sm:text-sm font-semibold">{tool.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">{tool.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Description */}
            <Card className="bg-card/80 backdrop-blur-xl border-primary/20 p-6 mb-8">
              <h2 className="text-lg font-bold mb-3">How AI Personality Clone Works</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Create an intelligent digital version of yourself that learns your communication style, 
                personality traits, and interests. Your clone interacts with others on your behalf 24/7 — 
                building connections, having conversations, and even dating while you sleep or work.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="p-3 bg-background/50 rounded-xl border border-border/50">
                  <span className="text-lg mb-1 block">🎨</span>
                  <p className="font-medium text-xs">Create</p>
                  <p className="text-[10px] text-muted-foreground">Define personality & style</p>
                </div>
                <div className="p-3 bg-background/50 rounded-xl border border-border/50">
                  <span className="text-lg mb-1 block">🧠</span>
                  <p className="font-medium text-xs">Train</p>
                  <p className="text-[10px] text-muted-foreground">AI learns from you</p>
                </div>
                <div className="p-3 bg-background/50 rounded-xl border border-border/50">
                  <span className="text-lg mb-1 block">💬</span>
                  <p className="font-medium text-xs">Communicate</p>
                  <p className="text-[10px] text-muted-foreground">24/7 autonomous chats</p>
                </div>
                <div className="p-3 bg-background/50 rounded-xl border border-border/50">
                  <span className="text-lg mb-1 block">📊</span>
                  <p className="font-medium text-xs">Analyze</p>
                  <p className="text-[10px] text-muted-foreground">Performance insights</p>
                </div>
              </div>
            </Card>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {renderView()}
          </motion.div>
        )}
      </div>
    </div>
  );
}
