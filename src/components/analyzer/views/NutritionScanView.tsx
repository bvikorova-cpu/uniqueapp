import { Apple } from "lucide-react";
import { AnalyzerToolLayout } from "../AnalyzerToolLayout";

export const NutritionScanView = ({ onBack }: { onBack: () => void }) => (
  <AnalyzerToolLayout
    title="Nutrition Scan"
    description="Calculate calories, macros, allergens & healthiness score from any meal"
    icon={<Apple className="w-7 h-7" />}
    action="nutrition-scan"
    creditCost={3}
    placeholder="Describe your meal — e.g. grilled chicken breast 200g, brown rice 150g, broccoli 100g, olive oil 1 tbsp"
    gradient="from-lime-600 to-emerald-600"
    onBack={onBack}
    buildBody={(input) => ({ meal: input })}
  />
);
