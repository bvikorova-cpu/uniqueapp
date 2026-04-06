import { Search } from "lucide-react";
import { AnalyzerToolLayout } from "../AnalyzerToolLayout";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const SmartSearchView = ({ onBack }: { onBack: () => void }) => {
  const [budget, setBudget] = useState("");

  return (
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
  );
};
