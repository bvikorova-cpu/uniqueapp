import { useState } from "react";
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
import { ArrowLeft } from "lucide-react";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const VirtualEscapeRoom = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState("dashboard");
  const { toast } = useToast();



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
          { title: 'Pay in credits', description: 'Unlock a room for 5 credits - no subscriptions.' },
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
