import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Timer, TrendingDown, Swords, Film, BookOpen, Users, CreditCard, Info, Loader2, Shield, Sparkles, MessageCircle, User, Eye
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { TimeReversalHero } from "@/components/time-reversal/TimeReversalHero";
import { TimeReversalToolCard } from "@/components/time-reversal/TimeReversalToolCard";
import { AgeBattleArena } from "@/components/time-reversal/AgeBattleArena";
import { TimeLapseCreator } from "@/components/time-reversal/TimeLapseCreator";
import { SocialReverseFeed } from "@/components/time-reversal/SocialReverseFeed";
import { ReverseLifeStory } from "@/components/time-reversal/ReverseLifeStory";
import { TimeReversalPlans } from "@/components/time-reversal/TimeReversalPlans";
import { TimeReversalProfile } from "@/components/time-reversal/TimeReversalProfile";
import { TimeReversalHowItWorks } from "@/components/time-reversal/TimeReversalHowItWorks";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type ViewType = "hub" | "battle" | "timelapse" | "feed" | "story" | "plans" | "profile" | "how-it-works" | "timeline" | "dashboard";

const tools = [
  { id: "feed" as ViewType, icon: MessageCircle, title: "Social Feed", description: "Share your daily 'younger self' updates", color: "purple", badge: "Social" },
  { id: "battle" as ViewType, icon: Swords, title: "Age Battle Arena", description: "Compare reverse-aging & vote for the best", color: "red", badge: "Battle" },
  { id: "timelapse" as ViewType, icon: Film, title: "Time-Lapse Creator", description: "Generate reverse-aging timelapse videos", color: "violet", badge: "New" },
  { id: "story" as ViewType, icon: BookOpen, title: "Reverse Life Story", description: "AI writes your biography backwards", color: "amber", badge: "AI" },
  { id: "profile" as ViewType, icon: User, title: "My Profile", description: "Manage your reverse aging journey", color: "blue" },
  { id: "timeline" as ViewType, icon: TrendingDown, title: "My Timeline", description: "View your reverse age progression", color: "emerald" },
  { id: "dashboard" as ViewType, icon: Eye, title: "Dashboard", description: "Active features & subscription status", color: "cyan" },
  { id: "plans" as ViewType, icon: CreditCard, title: "Plans & Pricing", description: "Unlock premium time powers (€1.99+)", color: "orange", badge: "€1.99+" },
  { id: "how-it-works" as ViewType, icon: Info, title: "How It Works", description: "Complete guide to Time Reversal", color: "rose" },
];

export default function TimeReversalSocial() {
  const [activeView, setActiveView] = useState<ViewType>("hub");
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        if (!session) window.location.href = '/auth';
      } catch (e) { console.error(e); }
      finally { setCheckingAuth(false); }
    };
    check();
  }, []);

  useEffect(() => {
    if (searchParams.get('success') === 'true') toast({ title: "Payment Successful!", description: "Your Time Reversal feature is now active." });
  }, [searchParams]);

  if (checkingAuth) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user) return null;

  const goBack = () => setActiveView("hub");

  const renderView = () => {
    switch (activeView) {
      case "battle": return <AgeBattleArena onBack={goBack} />;
      case "timelapse": return <TimeLapseCreator onBack={goBack} />;
      case "feed": return <SocialReverseFeed onBack={goBack} />;
      case "story": return <ReverseLifeStory onBack={goBack} />;
      case "plans": return <TimeReversalPlans onBack={goBack} />;
      case "profile": return <TimeReversalProfile onBack={goBack} />;
      case "how-it-works": return <TimeReversalHowItWorks onBack={goBack} />;
      case "timeline": {
        // Lazy load existing TimeReversalTimeline inline
        navigate("/time-reversal/timeline");
        return null;
      }
      case "dashboard": {
        navigate("/time-reversal/dashboard");
        return null;
      }
      default: return null;
    }
  };

  return (
    
    <>
      <FloatingHowItWorks title="Time Reversal Social" steps={[{ title: "Rewind a moment", desc: "Pick a post or decision to reimagine." }, { title: "Explore alt outcomes", desc: "AI generates the parallel version." }, { title: "Share the timeline", desc: "Others can vote which path was better." }, { title: "Learn forward", desc: "Apply insights to future choices." }]} />
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-20 pb-8">
        {activeView === "hub" ? (
          <>
            <TimeReversalHero />

            <HeroRewardedAd sectionKey="page_timereversalsocial" />

            {/* Compact 4-stat Engagement Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { icon: Timer, label: "Years Reversed", value: "2.4K", color: "text-purple-500" },
                { icon: TrendingDown, label: "Transformations", value: "18.7K", color: "text-violet-500" },
                { icon: Users, label: "Active Users", value: "6.2K", color: "text-blue-500" },
                { icon: Sparkles, label: "Paradoxes Created", value: "892", color: "text-amber-500" },
              ].map((stat, i) => (
                <Card key={i} className="border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-lg font-black">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tool Cards Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-6">
                Time Reversal Tools
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {tools.map((tool, i) => (
                  <TimeReversalToolCard
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

            {/* How It Works Summary */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">How It Works</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: User, title: "1. Upload Photo", desc: "Our AI transforms you into your 80-year-old self to begin" },
                    { icon: TrendingDown, title: "2. Get Younger", desc: "Every day AI makes you younger automatically through time" },
                    { icon: Swords, title: "3. Battle & Share", desc: "Enter battles, post updates, and build your following" },
                    { icon: Shield, title: "4. Go Premium", desc: "Unlock speed boosts, age locks, and time paradox posts" },
                  ].map((step, i) => (
                    <div key={i} className="text-center space-y-2">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-bold text-sm">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
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
}
