import { useState } from "react";
import { EscapeRoomHero } from "@/components/escape-room/EscapeRoomHero";

import { EscapeRoomToolGrid } from "@/components/escape-room/EscapeRoomToolGrid";
import RoomGallery from "@/components/escape-room/RoomGallery";
import GamePlay from "@/components/escape-room/GamePlay";
import Leaderboard from "@/components/escape-room/Leaderboard";
import { EscapeBadgesView } from "@/components/escape-room/views/EscapeBadgesView";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const VirtualEscapeRoom = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState("dashboard");

  if (selectedRoomId) {
    return <GamePlay roomId={selectedRoomId} onExit={() => setSelectedRoomId(null)} />;
  }

  const back = () => setActiveView("dashboard");

  const renderView = () => {
    switch (activeView) {
      case "browse":
        return (
          <div>
            <Button variant="ghost" onClick={back} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
            <RoomGallery onSelectRoom={setSelectedRoomId} />
          </div>
        );
      case "leaderboard":
        return (
          <div>
            <Button variant="ghost" onClick={back} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
            <Leaderboard />
          </div>
        );
      case "badges":
        return <EscapeBadgesView onBack={back} />;
      default:
        return (
          <>
            <EscapeRoomHero />
            <HeroRewardedAd sectionKey="page_virtualescaperoom" />


            <h2 className="mb-4 text-center text-sm font-black uppercase tracking-[0.35em] text-amber-400/80">
              Enter the Dark
            </h2>
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
          { title: 'Pay in credits', description: 'Unlock a room for 8 credits - no subscriptions.' },
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
