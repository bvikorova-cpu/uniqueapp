import { HeartPulse } from "lucide-react";
import { AnalyzerToolLayout } from "../AnalyzerToolLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export const HealthScannerView = ({ onBack }: { onBack: () => void }) => {
  const [scanType, setScanType] = useState("general");

  return (
    <AnalyzerToolLayout
      title="AI Health Scanner"
      description="Analyze skin conditions, food safety, plant toxicity & more — NOT a medical diagnosis"
      icon={<HeartPulse className="w-7 h-7" />}
      action="health-scanner"
      creditCost={3}
      placeholder="Describe what you want analyzed (e.g., a red bumpy rash on my forearm that appeared 2 days ago after hiking in the woods)"
      gradient="from-red-600 to-pink-600"
      onBack={onBack}
      buildBody={(input) => ({ description: input, scanType })}
    >
      <div className="mb-4">
        <label className="text-sm font-medium mb-1 block text-muted-foreground">Scan Type</label>
        <Select value={scanType} onValueChange={setScanType}>
          <SelectTrigger className="border-cyan-500/20"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Health</SelectItem>
            <SelectItem value="skin">Skin Condition</SelectItem>
            <SelectItem value="food-safety">Food Safety</SelectItem>
            <SelectItem value="plant-toxicity">Plant Toxicity</SelectItem>
            <SelectItem value="allergen">Allergen Check</SelectItem>
            <SelectItem value="nutrition">Nutrition Analysis</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </AnalyzerToolLayout>
  );
};
