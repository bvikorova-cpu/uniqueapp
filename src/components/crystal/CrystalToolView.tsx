import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

import { CrystalAIAnalysis } from "./tools/CrystalAIAnalysis";
import { CrystalOracleTool } from "./tools/CrystalOracleTool";
import CrystalEnergyUpload from "./CrystalEnergyUpload";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface CrystalToolViewProps {
  toolName: string;
  onBack: () => void;
}

export const CrystalToolView = ({ toolName, onBack }: CrystalToolViewProps) => {

  const renderTool = () => {
    switch (toolName) {
      case "AI Energy Reading":
        return <CrystalEnergyUpload />;
      case "Energy Healing":
        return <CrystalAIAnalysis toolType="healing" title="Energy Healing Session" description="Describe your current physical, emotional, or spiritual concerns and receive a comprehensive AI-powered healing plan with crystal recommendations." needsImage={false} needsText textLabel="Describe Your Concerns" textPlaceholder="e.g., I've been feeling stressed and anxious lately, having trouble sleeping, and my energy feels low..." />;
      case "Daily Crystal Oracle":
        return <CrystalOracleTool />;
      case "Aura Analysis":
        return <CrystalAIAnalysis toolType="aura" title="Aura Analysis" description="Upload a clear photo of yourself and our AI will analyze your aura colors, detect energy blocks, assess aura strength, and recommend crystals for cleansing." needsImage needsText={false} />;
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
