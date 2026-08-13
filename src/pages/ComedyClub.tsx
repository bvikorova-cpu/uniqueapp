import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Ticket, Mic2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ComedyClubHero } from "@/components/comedy/ComedyClubHero";
import { ComedyToolCard } from "@/components/comedy/ComedyToolCard";
import { BrowseComedyShows } from "@/components/comedy/BrowseComedyShows";
import { ComedianStudio } from "@/components/comedy/ComedianStudio";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type ViewType = "hub" | "browse" | "comedian-studio";

const tools = [
  { id: "comedian-studio" as ViewType, icon: Mic2, title: "Comedian Studio", description: "Sign up as a comedian & schedule your own live shows", color: "violet", badge: "Comedians" },
  { id: "browse" as ViewType, icon: Ticket, title: "Browse Shows", description: "Discover & buy tickets for upcoming stand-up shows", color: "red" },
];

const ComedyClub = () => {
  const [activeView, setActiveView] = useState<ViewType>("hub");
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        if (!session) window.location.href = '/auth';
        const params = new URLSearchParams(window.location.search);
        const v = params.get('view') as ViewType | null;
        if (v) setActiveView(v);
      } catch (e) { console.error(e); }
      finally { setCheckingAuth(false); }
    };
    check();
  }, []);

  if (checkingAuth) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (!user) return null;

  const goBack = () => setActiveView("hub");

  const renderView = () => {
    switch (activeView) {
      case "browse": return <BrowseComedyShows onBack={goBack} />;
      case "comedian-studio": return <ComedianStudio onBack={goBack} />;
      default: return null;
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Comedy Club works" steps={[
        { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
        { title: 'Interact', desc: 'Buy tickets with comedy coins or host your own show.' },
        { title: 'Review results', desc: 'Watch live shows, tip comedians and rate performances.' },
        { title: 'Come back', desc: 'Tickets and progress are saved to your account.' },
      ]} />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pt-20 pb-8">
          {activeView === "hub" ? (
            <>
              <ComedyClubHero />

              <HeroRewardedAd sectionKey="page_comedyclub" />

              {/* Tool Cards Grid */}
              <div className="mb-8">
                <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-6">
                  Comedy Tools
                </h2>
                <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {tools.map((tool, i) => (
                    <ComedyToolCard
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { icon: Ticket, title: "For Fans", desc: "Browse upcoming shows, buy tickets with coins, and watch live streams." },
                      { icon: Mic2, title: "For Comedians", desc: "Create your comedian profile, schedule shows, and go live." },
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
};

export default ComedyClub;
