import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { EscapeRoomHero } from "@/components/escape-room/EscapeRoomHero";
import { EscapeRoomEngagement } from "@/components/escape-room/EscapeRoomEngagement";
import { EscapeRoomToolGrid } from "@/components/escape-room/EscapeRoomToolGrid";
import RoomGallery from "@/components/escape-room/RoomGallery";
import RoomBuilder from "@/components/escape-room/RoomBuilder";
import GamePlay from "@/components/escape-room/GamePlay";
import Leaderboard from "@/components/escape-room/Leaderboard";
import SubscriptionPlans from "@/components/escape-room/SubscriptionPlans";
import { AIPuzzleGeneratorView } from "@/components/escape-room/views/AIPuzzleGeneratorView";
import { AIStoryWriterView } from "@/components/escape-room/views/AIStoryWriterView";
import { AIHintSystemView } from "@/components/escape-room/views/AIHintSystemView";
import { AIThemeDesignerView } from "@/components/escape-room/views/AIThemeDesignerView";
import { AIDifficultyTunerView } from "@/components/escape-room/views/AIDifficultyTunerView";
import { AIClueGeneratorView } from "@/components/escape-room/views/AIClueGeneratorView";
import { RoomAnalyticsView } from "@/components/escape-room/views/RoomAnalyticsView";
import { EscapeHistoryView } from "@/components/escape-room/views/EscapeHistoryView";
import { EscapeBadgesView } from "@/components/escape-room/views/EscapeBadgesView";
import { TeamManagerView } from "@/components/escape-room/views/TeamManagerView";
import { DailyChallengesView } from "@/components/escape-room/views/DailyChallengesView";
import { RoomReviewsView } from "@/components/escape-room/views/RoomReviewsView";
import { CreatorEarningsView } from "@/components/escape-room/views/CreatorEarningsView";
import { MultiplayerLobbyView } from "@/components/escape-room/views/MultiplayerLobbyView";
import { AIRoomNarratorView } from "@/components/escape-room/views/AIRoomNarratorView";
import { SeasonPassView } from "@/components/escape-room/views/SeasonPassView";
import { RoomReplayView } from "@/components/escape-room/views/RoomReplayView";
import { CustomSoundDesignerView } from "@/components/escape-room/views/CustomSoundDesignerView";
import { SpeedrunTournamentsView } from "@/components/escape-room/views/SpeedrunTournamentsView";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, Check, Crown, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const VirtualEscapeRoom = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState("dashboard");
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const roomId = params.get("roomId");
    if (success === "true" && roomId) {
      toast({ title: "Payment Successful!", description: "Starting your escape room adventure..." });
      setSelectedRoomId(roomId);
      window.history.replaceState({}, "", "/virtual-escape-room");
    }
  }, [toast]);

  if (selectedRoomId) {
    return <GamePlay roomId={selectedRoomId} onExit={() => setSelectedRoomId(null)} />;
  }

  const back = () => setActiveView("dashboard");

  const renderView = () => {
    switch (activeView) {
      case "browse": return <div><Button variant="ghost" onClick={back} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button><RoomGallery onSelectRoom={setSelectedRoomId} /></div>;
      case "create": return <div><Button variant="ghost" onClick={back} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button><RoomBuilder /></div>;
      case "leaderboard": return <div><Button variant="ghost" onClick={back} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button><Leaderboard /></div>;
      case "premium": return <div><Button variant="ghost" onClick={back} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button><SubscriptionPlans /></div>;
      case "corporate": return (
        <div>
          <Button variant="ghost" onClick={back} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black">Corporate Team Building</h2>
                <p className="text-muted-foreground">Custom branded escape rooms for your team</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: "Starter", price: "€50", desc: "Up to 10 players", features: ["1 custom room", "Basic analytics", "Email support"] },
                { name: "Business", price: "€100", desc: "Up to 30 players + Analytics", features: ["3 custom rooms", "Full analytics", "Priority support", "Custom branding"], popular: true },
                { name: "Enterprise", price: "€200", desc: "Unlimited + Custom Branding", features: ["Unlimited rooms", "Dedicated manager", "API access", "Custom integrations"] },
              ].map((plan, i) => (
                <Card key={i} className={plan.popular ? "border-primary shadow-lg" : ""}>
                  {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">Popular</span></div>}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="text-3xl font-black">{plan.price}</div>
                    <CardDescription>{plan.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-emerald-500" />{f}</li>
                      ))}
                    </ul>
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"} onClick={async () => {
                      try {
                        const { supabase } = await import("@/integrations/supabase/client");
                        const { data: { session } } = await supabase.auth.getSession();
                        if (!session) { toast({ description: "Please log in first" }); return; }
                        const eur = parseFloat(String(plan.price).replace(/[^0-9.]/g, "")) || 0;
                        const { data, error } = await supabase.functions.invoke("create-checkout", {
                          body: {
                            product: "escape_room_corporate",
                            productName: `Escape Room Corporate — ${plan.name}`,
                            amount: Math.round(eur * 100),
                            mode: "subscription",
                            metadata: { plan_name: plan.name, tier: "corporate" },
                          }
                        });
                        if (error) throw error;
                        if (data?.url) window.open(data.url, "_blank");
                      } catch (e: any) { toast({ description: e.message || "Checkout zlyhal" }); }
                    }}>Get Started</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      );
      case "ai-puzzle": return <AIPuzzleGeneratorView onBack={back} />;
      case "ai-story": return <AIStoryWriterView onBack={back} />;
      case "ai-hint": return <AIHintSystemView onBack={back} />;
      case "ai-theme": return <AIThemeDesignerView onBack={back} />;
      case "ai-difficulty": return <AIDifficultyTunerView onBack={back} />;
      case "ai-clue": return <AIClueGeneratorView onBack={back} />;
      case "analytics": return <RoomAnalyticsView onBack={back} />;
      case "history": return <EscapeHistoryView onBack={back} />;
      case "badges": return <EscapeBadgesView onBack={back} />;
      case "teams": return <TeamManagerView onBack={back} />;
      case "challenges": return <DailyChallengesView onBack={back} />;
      case "reviews": return <RoomReviewsView onBack={back} />;
      case "earnings": return <CreatorEarningsView onBack={back} />;
      case "multiplayer": return <MultiplayerLobbyView onBack={back} />;
      case "ai-narrator": return <AIRoomNarratorView onBack={back} />;
      case "season-pass": return <SeasonPassView onBack={back} />;
      case "replay": return <RoomReplayView onBack={back} />;
      case "ai-sound": return <CustomSoundDesignerView onBack={back} />;
      case "speedrun": return <SpeedrunTournamentsView onBack={back} />;
      default:
        return (
          <>
            <EscapeRoomHero />
            <HeroRewardedAd sectionKey="page_virtualescaperoom" />

            <EscapeRoomEngagement />
            <h2 className="text-xl font-bold mb-4">Tools & Features</h2>
            <EscapeRoomToolGrid onToolSelect={setActiveView} />
          </>
        );
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title="How Virtual Escape Room works"
        steps={[
          { title: 'Pick a room', description: 'Browse mystery/adventure themes.' },
          { title: 'Buy tickets', description: 'Secure your slot via Stripe.' },
          { title: 'Play with friends', description: 'Multi-user real-time puzzles.' },
          { title: 'Beat the timer', description: 'Solve clues and escape to earn rewards.' },
        ]}
      />
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 pt-24">
        {renderView()}
      </main>
    </div>
    </>
  );
};

export default VirtualEscapeRoom;
