import { Layers } from "lucide-react";
import { AnalyzerToolLayout } from "../AnalyzerToolLayout";

export const BatchAnalyzeView = ({ onBack }: { onBack: () => void }) => (
  <AnalyzerToolLayout
    title="Batch Analysis"
    description="Analyze multiple items at once — compare, classify & summarize in bulk"
    icon={<Layers className="w-7 h-7" />}
    action="batch-analyze"
    creditCost={5}
    placeholder="Describe multiple items, one per line:&#10;1. Red Nike Air Max 90, size 10, slightly worn&#10;2. Blue Adidas Ultraboost, size 10, new in box&#10;3. White Converse Chuck Taylor, size 10, vintage"
    gradient="from-amber-600 to-orange-600"
    onBack={onBack}
    buildBody={(input) => ({ items: input })}
  />
);
