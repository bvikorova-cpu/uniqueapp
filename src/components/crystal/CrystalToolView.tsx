import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Functional tool components
import { CrystalAIAnalysis } from "./tools/CrystalAIAnalysis";
import { CrystalTimerTool } from "./tools/CrystalTimerTool";
import { CrystalSoundBathTool } from "./tools/CrystalSoundBathTool";
import { CrystalCollectionTool } from "./tools/CrystalCollectionTool";
import { CrystalOracleTool } from "./tools/CrystalOracleTool";
import { CrystalEncyclopediaTool } from "./tools/CrystalEncyclopediaTool";
import { CrystalGuidesTool } from "./tools/CrystalGuidesTool";
import { CrystalMoonPhaseTool } from "./tools/CrystalMoonPhaseTool";
import { CrystalOriginMapTool } from "./tools/CrystalOriginMapTool";
import { CrystalCommunityTool } from "./tools/CrystalCommunityTool";
import { CrystalLeaderboardTool } from "./tools/CrystalLeaderboardTool";
import { CrystalAnalyticsTool } from "./tools/CrystalAnalyticsTool";
import { CrystalChakraBalancingTool } from "./tools/CrystalChakraBalancingTool";
import { CrystalSubBoxTool } from "./tools/CrystalSubBoxTool";
import CrystalEnergyUpload from "./CrystalEnergyUpload";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface CrystalToolViewProps {
  toolName: string;
  onBack: () => void;
}

export const CrystalToolView = ({ toolName, onBack }: CrystalToolViewProps) => {
  const navigate = useNavigate();

  // Side-effect navigation for tools that route to standalone pages
  useEffect(() => {
    if (toolName === "Crystal Marketplace") {
      navigate("/crystal-marketplace");
    }
  }, [toolName, navigate]);

  const renderTool = () => {
    switch (toolName) {
      case "AI Energy Reading":
        return <CrystalEnergyUpload />;
      case "Energy Healing":
        return <CrystalAIAnalysis toolType="healing" title="Energy Healing Session" description="Describe your current physical, emotional, or spiritual concerns and receive a comprehensive AI-powered healing plan with crystal recommendations." needsImage={false} needsText textLabel="Describe Your Concerns" textPlaceholder="e.g., I've been feeling stressed and anxious lately, having trouble sleeping, and my energy feels low..." />;
      case "Chakra Balancing":
        return <CrystalChakraBalancingTool />;
      case "Crystal Encyclopedia":
        return <CrystalEncyclopediaTool />;
      case "Crystal Marketplace":
        return <div className="text-center py-8 text-muted-foreground">Opening marketplace…</div>;
      case "Crystal Scanner":
        return <CrystalAIAnalysis toolType="scanner" title="Crystal Scanner" description="Upload a clear photo of any crystal and our AI will instantly identify it, provide detailed properties, healing uses, estimated value, and care instructions." needsImage needsText={false} />;
      case "Crystal Collection":
        return <CrystalCollectionTool />;
      case "Daily Crystal Oracle":
        return <CrystalOracleTool />;
      case "Crystal Compatibility":
        return <CrystalAIAnalysis toolType="compatibility" title="Crystal Compatibility" description="Describe two people and their personalities to receive an AI-powered compatibility analysis with crystal recommendations for strengthening the connection." needsImage={false} needsText textLabel="Describe Both People" textPlaceholder="Person 1: Sarah, 28, creative artist, loves nature, introverted...&#10;Person 2: Michael, 32, analytical engineer, adventurous, extroverted..." />;
      case "Meditation Timer":
        return <CrystalTimerTool />;
      case "Aura Analysis":
        return <CrystalAIAnalysis toolType="aura" title="Aura Analysis" description="Upload a clear photo of yourself and our AI will analyze your aura colors, detect energy blocks, assess aura strength, and recommend crystals for cleansing." needsImage needsText={false} />;
      case "Crystal Guide":
        return <CrystalGuidesTool mode="guide" />;
      case "Energy Analytics":
        return <CrystalAnalyticsTool />;
      case "Moon Phase Crystals":
        return <CrystalMoonPhaseTool />;
      case "Third Eye Training":
        return <CrystalAIAnalysis toolType="third-eye" title="Third Eye Training" description="Describe your meditation experience level and spiritual goals to receive a personalized third eye activation exercise with crystal recommendations." needsImage={false} needsText textLabel="Your Experience Level & Goals" textPlaceholder="e.g., I'm a beginner in meditation, have been practicing for 3 months. I want to develop my intuition and have more vivid visualizations..." />;
      case "Energy Cleansing":
        return <CrystalGuidesTool mode="cleansing" />;
      case "Live Crystal ID":
        return <CrystalAIAnalysis toolType="live-id" title="Live Crystal Identification" description="Upload or capture a photo of any crystal for real-time AI identification. Get instant details about properties, rarity, value, and healing applications." needsImage needsText={false} />;
      case "Crystal Sound Bath":
        return <CrystalSoundBathTool />;
      case "Crystal Origin Map":
        return <CrystalOriginMapTool />;
      case "Crystal Community":
        return <CrystalCommunityTool />;
      case "Energy Leaderboard":
        return <CrystalLeaderboardTool />;
      case "Crystal Sub Box":
        return <CrystalSubBoxTool />;
      default:
        return <div className="text-center py-8 text-muted-foreground">Tool not found</div>;
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Crystal Tool View'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Crystal Tool View panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Hub
      </Button>
      {renderTool()}
    </motion.div>
    </>
  );
};
