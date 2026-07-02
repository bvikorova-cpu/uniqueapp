import { Search } from "lucide-react";
import { AnalyzerToolLayout } from "../AnalyzerToolLayout";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const SmartSearchView = ({ onBack }: { onBack: () => void }) => {
  const [budget, setBudget] = useState("");

  return (
    <>
      <FloatingHowItWorks title={"Smart Search View - How it works"} steps={[{ title: 'Open', desc: 'Access the Smart Search View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Smart Search View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <AnalyzerToolLayout
      title="AI Smart Search"
      description="Find similar items, alternatives & shopping recommendations powered by AI"
      icon={<Search className="w-7 h-7" />}
      action="smart-search"
      creditCost={3}
      placeholder="Describe what you're looking for (e.g., a mid-century modern desk lamp, brass finish, under $200)"
      gradient="from-blue-600 to-purple-600"
      onBack={onBack}
      buildBody={(input) => ({ query: input, budget })}
    >
      <div className="mb-4">
        <label className="text-sm font-medium mb-1 block text-muted-foreground">Budget (optional)</label>
        <Input
          placeholder="e.g., $100-500"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="border-cyan-500/20"
        />
      </div>
    </AnalyzerToolLayout>
    </>
  );
};
