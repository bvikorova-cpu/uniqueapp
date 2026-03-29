import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { 
  Globe, Layers, Shuffle, Crown, Sparkles, Infinity, Users, Loader2,
  BarChart3, GitBranch, MessageCircle, Dices, Compass, Network, TrendingUp,
  BookOpen, CreditCard, Settings
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

type ViewType = "hub" | "create" | "my-universes" | "timeline-merger" | "best-self" | 
  "comparison" | "timeline-view" | "quantum-chat" | "reality-lottery" | "pricing" |
  "navigator" | "decision-tree" | "analytics" | "community" | "journal" | "settings";

const tools = [
  { id: "create" as ViewType, icon: Globe, title: "Create Universe", description: "Generate AI-powered alternate realities", color: "violet", badge: "AI" },
  { id: "my-universes" as ViewType, icon: Infinity, title: "My Universes", description: "Browse & manage parallel dimensions", color: "red" },
  { id: "navigator" as ViewType, icon: Compass, title: "Quantum Navigator", description: "Navigate through your realities one by one", color: "cyan" },
  { id: "timeline-merger" as ViewType, icon: Layers, title: "Timeline Merger", description: "Combine universes into optimal reality", color: "blue" },
  { id: "best-self" as ViewType, icon: Crown, title: "Best Self Finder", description: "AI identifies your most successful version", color: "amber", badge: "AI" },
  { id: "comparison" as ViewType, icon: BarChart3, title: "Reality Comparison", description: "Compare parallel versions side by side", color: "blue" },
  { id: "timeline-view" as ViewType, icon: GitBranch, title: "Multiverse Timeline", description: "Visual timeline of reality divergences", color: "indigo" },
  { id: "quantum-chat" as ViewType, icon: MessageCircle, title: "Quantum Chat", description: "Chat with your alternate selves via AI", color: "pink", badge: "AI" },
  { id: "reality-lottery" as ViewType, icon: Dices, title: "Reality Lottery", description: "Random parallel life generator", color: "amber" },
  { id: "decision-tree" as ViewType, icon: Network, title: "Decision Tree Mapper", description: "Map decision consequences across realities", color: "emerald", badge: "AI" },
  { id: "analytics" as ViewType, icon: TrendingUp, title: "Dimensional Analytics", description: "Analyze performance across dimensions", color: "violet" },
  { id: "community" as ViewType, icon: Users, title: "Multiverse Community", description: "Connect with other explorers", color: "red" },
  { id: "journal" as ViewType, icon: BookOpen, title: "Quantum Journal", description: "Record multiverse reflections & insights", color: "indigo" },
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
          // Load engagement data
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
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (!user) return null;

  const goBack = () => setActiveView("hub");

  // Render active tool view
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
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {verifying && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-6"><div className="flex items-center gap-3"><Loader2 className="w-6 h-6 animate-spin text-primary" /><p>Verifying payment...</p></div></Card>
        </div>
      )}

      <div className="container mx-auto px-4 pt-20 pb-8">
        {activeView === "hub" ? (
          <>
            {/* Cinematic Video Hero */}
            <MultiverseHero />

            {/* Engagement Row */}
            <MultiverseEngagement 
              universesCount={universesCount} 
              bestSelfScore={0} 
              achievements={0} 
            />

            {/* Tool Cards Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-6">
                Multiverse Tools
              </h2>
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

            {/* How It Works */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">How It Works</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Globe, title: "1. Create Universe", desc: "AI generates parallel realities from your divergence points" },
                    { icon: Shuffle, title: "2. Jump Realities", desc: "Navigate between dimensions to explore different life paths" },
                    { icon: Layers, title: "3. Merge Timelines", desc: "Combine the best aspects of multiple realities" },
                    { icon: Crown, title: "4. Find Best Self", desc: "AI identifies your most successful version" },
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
  );
};

export default MultiverseNetwork;
