import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Clock, Send, FolderOpen, Users, Brain, Calendar, Eye, CreditCard, Info, Loader2, Shield, Sparkles, Mail
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { TimeCapsuleHero } from "@/components/time-capsule/TimeCapsuleHero";
import { TimeCapsuleToolCard } from "@/components/time-capsule/TimeCapsuleToolCard";
import { CapsuleCreator } from "@/components/time-capsule/CapsuleCreator";
import { MyCapsules } from "@/components/time-capsule/MyCapsules";
import { CapsuleGallery } from "@/components/time-capsule/CapsuleGallery";
import { AITimingPredictor } from "@/components/time-capsule/AITimingPredictor";
import { MemoryVault } from "@/components/time-capsule/MemoryVault";
import { CollaborativeCapsule } from "@/components/time-capsule/CollaborativeCapsule";
import { CapsuleTimeline } from "@/components/time-capsule/CapsuleTimeline";
import { CapsulePlans } from "@/components/time-capsule/CapsulePlans";
import { TimeCapsuleHowItWorks } from "@/components/time-capsule/TimeCapsuleHowItWorks";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type ViewType = "hub" | "creator" | "my-capsules" | "gallery" | "ai-predictor" | "vault" | "collaborative" | "timeline" | "plans" | "how-it-works";

const tools = [
  { id: "creator" as ViewType, icon: Send, title: "Create Capsule", description: "Write messages, record videos, or letters for the future", color: "blue", badge: "Free" },
  { id: "my-capsules" as ViewType, icon: Clock, title: "My Capsules", description: "View and manage all your time capsules", color: "amber" },
  { id: "vault" as ViewType, icon: FolderOpen, title: "Memory Vault", description: "Upload and store photos, videos, and documents", color: "violet", badge: "New" },
  { id: "ai-predictor" as ViewType, icon: Brain, title: "AI Timing", description: "AI predicts the perfect delivery moment", color: "emerald", badge: "AI" },
  { id: "collaborative" as ViewType, icon: Users, title: "Group Capsule", description: "Create collaborative capsules with friends", color: "pink", badge: "New" },
  { id: "timeline" as ViewType, icon: Calendar, title: "Timeline", description: "Visualize your capsules on a timeline", color: "cyan" },
  { id: "gallery" as ViewType, icon: Eye, title: "Community Gallery", description: "Browse public capsule stories", color: "indigo" },
  { id: "plans" as ViewType, icon: CreditCard, title: "Plans & Pricing", description: "Choose your capsule plan (€4.99–€49.99)", color: "orange", badge: "€4.99+" },
  { id: "how-it-works" as ViewType, icon: Info, title: "How It Works", description: "Complete guide to Time Capsule 2.0", color: "rose" },
];

export default function TimeCapsule() {
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
    if (searchParams.get('success') === 'true') toast({ title: "Payment Successful!", description: "You can now create your time capsule." });
    if (searchParams.get('premium_success') === 'true') toast({ title: "Premium Activated!", description: "Your Premium subscription is now active." });
  }, [searchParams]);

  if (checkingAuth) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user) return null;

  const goBack = () => setActiveView("hub");

  const renderView = () => {
    switch (activeView) {
      case "creator": return <CapsuleCreator onBack={goBack} />;
      case "my-capsules": return <MyCapsules onBack={goBack} />;
      case "gallery": return <CapsuleGallery onBack={goBack} />;
      case "ai-predictor": return <AITimingPredictor onBack={goBack} />;
      case "vault": return <MemoryVault onBack={goBack} />;
      case "collaborative": return <CollaborativeCapsule onBack={goBack} />;
      case "timeline": return <CapsuleTimeline onBack={goBack} />;
      case "plans": return <CapsulePlans onBack={goBack} />;
      case "how-it-works": return <TimeCapsuleHowItWorks onBack={goBack} />;
      default: return null;
    }
  };

  return (
    
    <>
      <FloatingHowItWorks title="Time Capsule Network" steps={[{ title: "Create a capsule", desc: "Photos, letters, videos sealed for the future." }, { title: "Set unlock date", desc: "Choose when it opens \u2014 days or decades away." }, { title: "Invite recipients", desc: "Optional co-owners get notified on unlock." }, { title: "Watch it open", desc: "Notification and reveal ceremony on unlock day." }]} />
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-20 pb-8">
        {activeView === "hub" ? (
          <>
            <TimeCapsuleHero />

            <HeroRewardedAd sectionKey="page_timecapsule" />

            {/* Compact Engagement Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { icon: Clock, label: "Total Capsules", value: "12.4K", color: "text-blue-500" },
                { icon: Mail, label: "Delivered", value: "3.2K", color: "text-emerald-500" },
                { icon: Shield, label: "Encrypted Years", value: "847+", color: "text-amber-500" },
                { icon: Sparkles, label: "Active Users", value: "5.6K", color: "text-violet-500" },
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
                Time Capsule Tools
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {tools.map((tool, i) => (
                  <TimeCapsuleToolCard
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
                    { icon: Send, title: "1. Create", desc: "Write messages, record videos, or compose letters for the future" },
                    { icon: Brain, title: "2. AI Timing", desc: "Our AI suggests the perfect delivery moment for maximum impact" },
                    { icon: Shield, title: "3. Secure", desc: "Military-grade encryption protects your memories for decades" },
                    { icon: Calendar, title: "4. Deliver", desc: "Your capsule arrives exactly when it's meant to be received" },
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
