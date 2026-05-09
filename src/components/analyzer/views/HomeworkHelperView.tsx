import { GraduationCap } from "lucide-react";
import { AnalyzerToolLayout } from "../AnalyzerToolLayout";

export const HomeworkHelperView = ({ onBack }: { onBack: () => void }) => (
  <AnalyzerToolLayout
    title="Homework Helper"
    description="Step-by-step explanations for any school subject"
    icon={<GraduationCap className="w-7 h-7" />}
    action="homework-help"
    creditCost={3}
    placeholder="Paste your homework question — e.g. Explain the causes of World War I in 200 words"
    gradient="from-yellow-600 to-amber-600"
    onBack={onBack}
    buildBody={(input) => ({ question: input, subject: "general" })}
  />
);
