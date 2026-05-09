import { Link2 } from "lucide-react";
import { AnalyzerToolLayout } from "../AnalyzerToolLayout";

export const URLAnalyzerView = ({ onBack }: { onBack: () => void }) => (
  <AnalyzerToolLayout
    title="URL Analyzer"
    description="Analyze any web page URL — content, safety, SEO insights"
    icon={<Link2 className="w-7 h-7" />}
    action="url-analyze"
    creditCost={3}
    placeholder="Paste a URL to analyze — https://example.com/article"
    gradient="from-sky-600 to-cyan-600"
    onBack={onBack}
    buildBody={(input) => ({ url: input })}
  />
);
