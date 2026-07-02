import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
  Music, Calendar, Gift, Trophy, Users, Sparkles, Crown, MessageCircle,
  PlayCircle, BarChart3, Star, Bell, ShoppingBag, ListMusic, Loader2,
  Info, Ticket, Headphones
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ConcertHero } from "@/components/concerts/ConcertHero";
import { ConcertEngagement } from "@/components/concerts/ConcertEngagement";
import { ConcertToolCard } from "@/components/concerts/ConcertToolCard";
import { BrowseConcerts } from "@/components/concerts/BrowseConcerts";
import { VirtualGiftsShop } from "@/components/concerts/VirtualGiftsShop";
import { ArtistDiscovery } from "@/components/concerts/ArtistDiscovery";
import { FanLeaderboard } from "@/components/concerts/FanLeaderboard";
import { ConcertReplay } from "@/components/concerts/ConcertReplay";
import { ConcertSchedule } from "@/components/concerts/ConcertSchedule";
import { ConcertChat } from "@/components/concerts/ConcertChat";
import { ConcertAnalytics } from "@/components/concerts/ConcertAnalytics";
import { VIPExperience } from "@/components/concerts/VIPExperience";
import { SetlistVoting } from "@/components/concerts/SetlistVoting";
import { MerchStore } from "@/components/concerts/MerchStore";
import { ConcertNotifications } from "@/components/concerts/ConcertNotifications";
import { ConcertHowItWorks } from "@/components/concerts/ConcertHowItWorks";
import { MusicianRegistration } from "@/components/musician/MusicianRegistration";
import { SongRequests } from "@/components/concerts/SongRequests";
import { MultiCamera } from "@/components/concerts/MultiCamera";
import { FanBadges } from "@/components/concerts/FanBadges";
import { ConcertStories } from "@/components/concerts/ConcertStories";
import { CollectibleTickets } from "@/components/concerts/CollectibleTickets";
import { ConcertAfterparty } from "@/components/concerts/ConcertAfterparty";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { useOneOffPaymentVerify } from "@/hooks/useOneOffPaymentVerify";
type ViewType = "hub" | "browse" | "gifts" | "artists" | "leaderboard" | "replay" | 
  "schedule" | "chat" | "analytics" | "vip" | "setlist" | "merch" | "notifications" | "how-it-works" | "musician" |
  "song-requests" | "multi-camera" | "fan-badges" | "stories" | "collectibles" | "afterparty";

const tools = [
  { id: "browse" as ViewType, icon: Ticket, title: "Browse Concerts", description: "Discover & buy tickets for upcoming live shows", color: "red" },
  { id: "schedule" as ViewType, icon: Calendar, title: "Concert Schedule", description: "View upcoming performances timeline", color: "blue" },
  { id: "artists" as ViewType, icon: Users, title: "Artist Discovery", description: "Explore talented musicians on the platform", color: "violet" },
  { id: "gifts" as ViewType, icon: Gift, title: "Virtual Gifts", description: "Send gifts to support your favorite artists", color: "pink" },
  { id: "vip" as ViewType, icon: Crown, title: "VIP Experience", description: "Upgrade to front-row seats & exclusive content", color: "amber" },
  { id: "replay" as ViewType, icon: PlayCircle, title: "Concert Replays", description: "Relive the best past performances", color: "indigo" },
  { id: "chat" as ViewType, icon: MessageCircle, title: "Concert Lounge", description: "Chat with fans in real-time", color: "cyan" },
  { id: "leaderboard" as ViewType, icon: Trophy, title: "Fan Leaderboard", description: "Top supporters & most generous fans", color: "amber" },
  { id: "setlist" as ViewType, icon: ListMusic, title: "Setlist Voting", description: "Vote for songs you want to hear live", color: "emerald" },
  { id: "merch" as ViewType, icon: ShoppingBag, title: "Artist Merch", description: "Exclusive merchandise from musicians", color: "orange" },
  { id: "analytics" as ViewType, icon: BarChart3, title: "Concert Analytics", description: "Platform performance metrics", color: "blue" },
  { id: "notifications" as ViewType, icon: Bell, title: "Notifications", description: "Customize your concert alerts", color: "red" },
  { id: "song-requests" as ViewType, icon: Music, title: "Song Requests", description: "Pay to request songs during live shows", color: "pink", badge: "€1-5" },
  { id: "multi-camera" as ViewType, icon: PlayCircle, title: "Multi-Camera", description: "Switch between 6 camera angles live", color: "cyan" },
  { id: "fan-badges" as ViewType, icon: Star, title: "Fan Badges & Levels", description: "Earn XP, unlock badges, level up", color: "amber" },
  { id: "stories" as ViewType, icon: Sparkles, title: "Concert Stories", description: "15s highlights from live performances", color: "violet" },
  { id: "collectibles" as ViewType, icon: Ticket, title: "Collectible Tickets", description: "Limited edition digital collectibles", color: "emerald", badge: "New" },
  { id: "afterparty" as ViewType, icon: Users, title: "Afterparty", description: "Exclusive post-concert hangout rooms", color: "red" },
  { id: "musician" as ViewType, icon: Music, title: "Become a Musician", description: "Register as an artist & start performing", color: "violet", badge: "Join" },
  { id: "how-it-works" as ViewType, icon: Info, title: "How It Works", description: "Learn about the concert platform", color: "cyan" },
];

const LiveConcerts = () => {
  const [activeView, setActiveView] = useState<ViewType>("hub");
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useOneOffPaymentVerify({
    fn: "verify-concert-ticket-payment",
    successTitle: "Ticket confirmed!",
    successDescription: "Your concert ticket is ready in your account.",
  });

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
      case "browse": return <BrowseConcerts onBack={goBack} />;
      case "gifts": return <VirtualGiftsShop onBack={goBack} />;
      case "artists": return <ArtistDiscovery onBack={goBack} />;
      case "leaderboard": return <FanLeaderboard onBack={goBack} />;
      case "replay": return <ConcertReplay onBack={goBack} />;
      case "schedule": return <ConcertSchedule onBack={goBack} />;
      case "chat": return <ConcertChat onBack={goBack} />;
      case "analytics": return <ConcertAnalytics onBack={goBack} />;
      case "vip": return <VIPExperience onBack={goBack} />;
      case "setlist": return <SetlistVoting onBack={goBack} />;
      case "merch": return <MerchStore onBack={goBack} />;
      case "notifications": return <ConcertNotifications onBack={goBack} />;
      case "how-it-works": return <ConcertHowItWorks onBack={goBack} />;
      case "song-requests": return <SongRequests onBack={goBack} />;
      case "multi-camera": return <MultiCamera onBack={goBack} />;
      case "fan-badges": return <FanBadges onBack={goBack} />;
      case "stories": return <ConcertStories onBack={goBack} />;
      case "collectibles": return <CollectibleTickets onBack={goBack} />;
      case "afterparty": return <ConcertAfterparty onBack={goBack} />;
      case "musician":
        navigate("/musician-dashboard");
        return null;
      default: return null;
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Live Concerts works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-20 pb-8">
        {activeView === "hub" ? (
          <>
            <ConcertHero />

            <HeroRewardedAd sectionKey="page_liveconcerts" />

            <ConcertEngagement liveShows={0} totalConcerts={0} topGifts={0} />

            {/* Tool Cards Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-6">
                Concert Tools
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {tools.map((tool, i) => (
                  <ConcertToolCard
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
                    { icon: Ticket, title: "1. Browse Concerts", desc: "Discover upcoming live shows from talented musicians" },
                    { icon: Crown, title: "2. Get Tickets", desc: "Choose Standard or VIP tier with Stripe checkout" },
                    { icon: Headphones, title: "3. Watch Live", desc: "HD streaming with real-time chat interaction" },
                    { icon: Gift, title: "4. Send Gifts", desc: "Support artists with virtual gifts — 80% goes to them" },
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

export default LiveConcerts;
