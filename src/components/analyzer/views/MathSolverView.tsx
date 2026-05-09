import { Calculator } from "lucide-react";
import { AnalyzerToolLayout } from "../AnalyzerToolLayout";

export const MathSolverView = ({ onBack }: { onBack: () => void }) => (
  <AnalyzerToolLayout
    title="AI Math Solver"
    description="Solve math problems step-by-step — algebra, calculus, geometry, statistics"
    icon={<Calculator className="w-7 h-7" />}
    action="math-solve"
    creditCost={3}
    placeholder="Type or paste a math problem, e.g. solve 2x² + 5x - 3 = 0"
    gradient="from-fuchsia-600 to-purple-600"
    onBack={onBack}
    buildBody={(input) => ({ problem: input, level: "general" })}
  />
);
