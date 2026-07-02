import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TalentCoachView } from "./TalentCoachView";
import { ThumbnailGeneratorView } from "./ThumbnailGeneratorView";
import { TrendAnalyzerView } from "./TrendAnalyzerView";
import { PerformanceScoreView } from "./PerformanceScoreView";
import { ViralPredictorView } from "./ViralPredictorView";
import { MusicAdvisorView } from "./MusicAdvisorView";
import { CaptionWriterView } from "./CaptionWriterView";
import { LiveLeaderboardView } from "./LiveLeaderboardView";
import { CollaborationMatcherView } from "./CollaborationMatcherView";
import { AchievementSystemView } from "./AchievementSystemView";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  activeView: string;
  onBack: () => void;
}

const MegatalentToolView = ({ activeView, onBack }: Props) => {
  const renderToolView = () => {
    switch (activeView) {
      case "talent_coach": return <TalentCoachView />;
      case "thumbnail_generator": return <ThumbnailGeneratorView />;
      case "trend_analyzer": return <TrendAnalyzerView />;
      case "performance_score": return <PerformanceScoreView />;
      case "viral_predictor": return <ViralPredictorView />;
      case "music_advisor": return <MusicAdvisorView />;
      case "caption_writer": return <CaptionWriterView />;
      case "leaderboard": return <LiveLeaderboardView />;
      case "collaboration_matcher": return <CollaborationMatcherView />;
      case "achievements": return <AchievementSystemView />;
      default: return null;
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Megatalent Tool View - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent Tool View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent Tool View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to MegaTalent
        </Button>
        {renderToolView()}
      </div>
    </div>
    </>
  );
};

export default MegatalentToolView;
