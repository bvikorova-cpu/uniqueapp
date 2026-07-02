import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InfluKingHero } from "@/components/influ-king/InfluKingHero";
import { InfluKingToolCard } from "@/components/influ-king/InfluKingToolCard";
import CreateInfluencer from "@/components/virtual-influencer/CreateInfluencer";
import InfluencerDashboard from "@/components/virtual-influencer/InfluencerDashboard";
import AIContentCalendar from "@/components/influ-king/views/AIContentCalendar";
import BrandDealMarketplace from "@/components/influ-king/views/BrandDealMarketplace";
import AITrendAnalyzer from "@/components/influ-king/views/AITrendAnalyzer";
import InfluencerBattleArena from "@/components/influ-king/views/InfluencerBattleArena";
import GenericInfluView from "@/components/influ-king/views/GenericInfluView";
import {
  Users, Plus, TrendingUp, DollarSign, Calendar, Briefcase, BarChart3, Swords,
  Sparkles, PenTool, ImageIcon, Hash, Target, Zap, Shield, Eye, MessageSquare,
  Video, Bot, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type ViewType = "hub" | "create" | "dashboard" | "content-calendar" | "brand-deals" | "trend-analyzer" | "battle-arena" | string;

const TOOLS = [
  { id: "create", icon: Plus, title: "Create Influencer", description: "Design a new AI virtual influencer with custom personality", badge: "Core", gradient: "from-cyan-500/10 to-purple-500/10", iconColor: "text-cyan-400" },
  { id: "dashboard", icon: BarChart3, title: "Influencer Dashboard", description: "View analytics, content library & earnings for your influencers", badge: "Core", gradient: "from-cyan-500/10 to-blue-500/10", iconColor: "text-cyan-400" },
  { id: "content-calendar", icon: Calendar, title: "AI Content Calendar", description: "AI plans your entire content schedule — posts, reels, stories", badge: "AI", credits: 5, gradient: "from-purple-500/10 to-cyan-500/10", iconColor: "text-purple-400" },
  { id: "brand-deals", icon: Briefcase, title: "Brand Deal Marketplace", description: "AI-matched brand sponsorship opportunities for your influencers", badge: "AI", credits: 5, gradient: "from-amber-500/10 to-cyan-500/10", iconColor: "text-amber-400" },
  { id: "trend-analyzer", icon: TrendingUp, title: "AI Trend Analyzer", description: "Real-time trend insights and content recommendations", badge: "AI", credits: 5, gradient: "from-green-500/10 to-cyan-500/10", iconColor: "text-green-400" },
  { id: "battle-arena", icon: Swords, title: "Influencer Battle Arena", description: "Pit influencers against each other — AI judges content quality", badge: "AI", credits: 5, gradient: "from-red-500/10 to-purple-500/10", iconColor: "text-red-400" },
  { id: "caption-gen", icon: PenTool, title: "AI Caption Writer", description: "Generate viral captions, bios & CTAs for any platform", badge: "AI", credits: 3, gradient: "from-pink-500/10 to-cyan-500/10", iconColor: "text-pink-400" },
  { id: "hashtag-gen", icon: Hash, title: "Hashtag Generator", description: "AI-powered hashtag research & optimization for max reach", badge: "AI", credits: 3, gradient: "from-blue-500/10 to-purple-500/10", iconColor: "text-blue-400" },
  { id: "content-idea", icon: Sparkles, title: "Content Idea Engine", description: "Never run out of ideas — AI generates viral content concepts", badge: "AI", credits: 3, gradient: "from-yellow-500/10 to-cyan-500/10", iconColor: "text-yellow-400" },
  { id: "audience-insight", icon: Target, title: "Audience Insights", description: "Deep AI analysis of your target audience demographics & behavior", badge: "AI", credits: 5, gradient: "from-teal-500/10 to-blue-500/10", iconColor: "text-teal-400" },
  { id: "engagement-boost", icon: Zap, title: "Engagement Booster", description: "AI strategies to maximize likes, comments & shares", badge: "AI", credits: 3, gradient: "from-orange-500/10 to-red-500/10", iconColor: "text-orange-400" },
  { id: "competitor-spy", icon: Eye, title: "Competitor Spy", description: "Analyze competitor strategies, content & growth patterns", badge: "AI", credits: 5, gradient: "from-rose-500/10 to-purple-500/10", iconColor: "text-rose-400" },
  { id: "reply-gen", icon: MessageSquare, title: "AI Reply Generator", description: "Smart, on-brand responses for comments & DMs", badge: "AI", credits: 3, gradient: "from-indigo-500/10 to-cyan-500/10", iconColor: "text-indigo-400" },
  { id: "script-writer", icon: Video, title: "Video Script Writer", description: "AI writes engaging scripts for reels, TikToks & YouTube shorts", badge: "AI", credits: 5, gradient: "from-fuchsia-500/10 to-blue-500/10", iconColor: "text-fuchsia-400" },
  { id: "brand-voice", icon: Bot, title: "Brand Voice Coach", description: "AI defines and maintains your influencer's unique voice & tone", badge: "AI", credits: 5, gradient: "from-emerald-500/10 to-purple-500/10", iconColor: "text-emerald-400" },
  { id: "media-kit", icon: Award, title: "Media Kit Generator", description: "Professional AI-designed media kit for brand partnerships", badge: "AI", credits: 5, gradient: "from-violet-500/10 to-cyan-500/10", iconColor: "text-violet-400" },
  { id: "crisis-mgr", icon: Shield, title: "Crisis Manager", description: "AI handles PR crises with drafted responses & strategies", badge: "AI", credits: 5, gradient: "from-slate-500/10 to-red-500/10", iconColor: "text-slate-400" },
  { id: "collab-finder", icon: Users, title: "Collab Finder", description: "Find perfect influencer collaborations powered by AI matching", badge: "AI", credits: 5, gradient: "from-lime-500/10 to-cyan-500/10", iconColor: "text-lime-400" },
];

const GENERIC_TOOLS: Record<string, { title: string; description: string; icon: any; action: string; credits: number; placeholder: string }> = {
  "caption-gen": { title: "AI Caption Writer", description: "Generate viral captions, bios & CTAs", icon: PenTool, action: "caption", credits: 3, placeholder: "Describe your post or paste the topic..." },
  "hashtag-gen": { title: "Hashtag Generator", description: "AI-powered hashtag research", icon: Hash, action: "hashtags", credits: 3, placeholder: "Describe your content niche and topic..." },
  "content-idea": { title: "Content Idea Engine", description: "AI generates viral content concepts", icon: Sparkles, action: "content-ideas", credits: 3, placeholder: "Your niche and what type of content you want..." },
  "audience-insight": { title: "Audience Insights", description: "Deep AI analysis of your audience", icon: Target, action: "audience-insight", credits: 5, placeholder: "Describe your influencer profile and niche..." },
  "engagement-boost": { title: "Engagement Booster", description: "AI strategies for max engagement", icon: Zap, action: "engagement-boost", credits: 3, placeholder: "Describe your current engagement challenges..." },
  "competitor-spy": { title: "Competitor Spy", description: "Analyze competitor strategies", icon: Eye, action: "competitor-spy", credits: 5, placeholder: "Enter competitor names or describe their niche..." },
  "reply-gen": { title: "AI Reply Generator", description: "Smart on-brand responses", icon: MessageSquare, action: "reply-gen", credits: 3, placeholder: "Paste the comment/DM you want to reply to..." },
  "script-writer": { title: "Video Script Writer", description: "Scripts for reels & TikToks", icon: Video, action: "script-writer", credits: 5, placeholder: "Topic, platform, and target duration..." },
  "brand-voice": { title: "Brand Voice Coach", description: "Define your unique voice & tone", icon: Bot, action: "brand-voice", credits: 5, placeholder: "Describe your influencer's personality and audience..." },
  "media-kit": { title: "Media Kit Generator", description: "Professional AI media kit", icon: Award, action: "media-kit", credits: 5, placeholder: "Influencer name, niche, follower count, achievements..." },
  "crisis-mgr": { title: "Crisis Manager", description: "AI handles PR crises", icon: Shield, action: "crisis-manager", credits: 5, placeholder: "Describe the situation or controversy..." },
  "collab-finder": { title: "Collab Finder", description: "Find perfect collaborations", icon: Users, action: "collab-finder", credits: 5, placeholder: "Your niche, audience size, and collaboration goals..." },
};

const VirtualInfluencerAgency = () => {
  const [activeView, setActiveView] = useState<ViewType>("hub");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<string | null>(null);

  const { data: influencers } = useQuery({
    queryKey: ["virtual-influencers"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.from("virtual_influencers").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: totalEarnings } = useQuery({
    queryKey: ["total-earnings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;
      const { data, error } = await supabase.from("influencer_earnings").select("net_amount").eq("user_id", user.id);
      if (error) throw error;
      return data.reduce((sum, e) => sum + Number(e.net_amount), 0);
    },
  });

  const handleToolClick = (id: string) => {
    if (id === "create") { setShowCreateDialog(true); return; }
    if (id === "dashboard") {
      if (influencers?.length) {
        setSelectedInfluencer(influencers[0].id);
        setActiveView("dashboard");
      } else {
        toast.info("Create your first virtual influencer to unlock the dashboard.");
        setShowCreateDialog(true);
      }
      return;
    }
    setActiveView(id);
  };

  const goBack = () => setActiveView("hub");

  // Render active view
  if (activeView === "dashboard" && selectedInfluencer) {
    return (
      <div className="min-h-screen bg-background">
        <FloatingHowItWorks
          title="Virtual Influencer Agency"
          intro="Create and manage AI influencers."
          steps={[
            { title: "Build your influencer", desc: "Face, style, personality, voice." },
          { title: "Generate content", desc: "Posts, reels and stories automatically." },
          { title: "Post to socials", desc: "Connect Instagram, TikTok, X." },
          { title: "Grow the audience", desc: "Analytics and follower insights." },
          { title: "Monetize", desc: "Brand deals via the Brand Arena." }
          ]}
        />
        <div className="container mx-auto px-4 py-8 mt-16">
          <Button variant="ghost" onClick={goBack} className="mb-4 gap-2">← Back to Hub</Button>
          <InfluencerDashboard influencerId={selectedInfluencer} />
        </div>
      </div>
    );
  }

  if (activeView === "content-calendar") return <div className="min-h-screen bg-background"><div className="container mx-auto px-4 py-8 mt-16"><AIContentCalendar onBack={goBack} /></div></div>;
  if (activeView === "brand-deals") return <div className="min-h-screen bg-background"><div className="container mx-auto px-4 py-8 mt-16"><BrandDealMarketplace onBack={goBack} /></div></div>;
  if (activeView === "trend-analyzer") return <div className="min-h-screen bg-background"><div className="container mx-auto px-4 py-8 mt-16"><AITrendAnalyzer onBack={goBack} /></div></div>;
  if (activeView === "battle-arena") return <div className="min-h-screen bg-background"><div className="container mx-auto px-4 py-8 mt-16"><InfluencerBattleArena onBack={goBack} /></div></div>;

  if (GENERIC_TOOLS[activeView]) {
    const tool = GENERIC_TOOLS[activeView];
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 mt-16">
          <GenericInfluView onBack={goBack} title={tool.title} description={tool.description} icon={tool.icon} action={tool.action} credits={tool.credits} placeholder={tool.placeholder} />
        </div>
      </div>
    );
  }

  const totalFollowers = influencers?.reduce((sum, inf) => sum + (inf.followers || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mt-16">
          <InfluKingHero />
          <HeroRewardedAd sectionKey="page_virtualinfluenceragency" />

        </div>

        {/* Engagement Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Your Influencers</p>
            <p className="text-2xl font-black text-cyan-400">{influencers?.length || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Followers</p>
            <p className="text-2xl font-black text-purple-400">{totalFollowers.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
            <p className="text-2xl font-black text-amber-400">€{totalEarnings?.toFixed(2) || "0.00"}</p>
          </div>
        </div>

        {/* Tool Grid */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Agency Tools</h2>
          <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">{TOOLS.length} Tools</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          {TOOLS.map((tool, i) => {
            const isDashboardLocked = tool.id === "dashboard" && !influencers?.length;
            return (
              <InfluKingToolCard
                key={tool.id}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                badge={tool.badge}
                credits={tool.credits}
                gradient={tool.gradient}
                iconColor={tool.iconColor}
                onClick={() => handleToolClick(tool.id)}
                delay={i * 0.03}
                locked={isDashboardLocked}
                lockedReason={isDashboardLocked ? "First, create a virtual influencer to unlock the Dashboard with analytics and earnings." : undefined}
              />
            );
          })}
        </div>

        {/* Influencer List */}
        {influencers && influencers.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Your Virtual Influencers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {influencers.map((inf) => (
                <div
                  key={inf.id}
                  onClick={() => { setSelectedInfluencer(inf.id); setActiveView("dashboard"); }}
                  className="cursor-pointer p-4 rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 hover:border-cyan-400/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {inf.avatar_url ? (
                      <img src={inf.avatar_url} alt={inf.name} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                        {inf.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-sm">{inf.name}</p>
                      <p className="text-xs text-muted-foreground">{inf.niche}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div><p className="text-xs text-muted-foreground">Followers</p><p className="text-sm font-bold">{inf.followers?.toLocaleString()}</p></div>
                    <div><p className="text-xs text-muted-foreground">Engagement</p><p className="text-sm font-bold">{Number(inf.engagement_rate).toFixed(1)}%</p></div>
                    <div><p className="text-xs text-muted-foreground">Earned</p><p className="text-sm font-bold">€{Number(inf.total_earnings).toFixed(0)}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <CreateInfluencer open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  );
};

export default VirtualInfluencerAgency;
