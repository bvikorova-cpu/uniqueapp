import { TrendingUp, Lightbulb, Star, DollarSign, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const CAREER_TIPS = [
  "Tailor your CV for each application — generic resumes get filtered out",
  "Include quantifiable achievements, not just responsibilities",
  "Network actively — 70% of jobs are filled through connections",
  "Keep your profile updated — recruiters search daily",
];

export function JobsSidebar() {
  return (
    <>
      <FloatingHowItWorks title="How Jobs Sidebar works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <div className="space-y-4">
      {/* Empty state encouragement */}
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/30">
        <h3 className="flex items-center gap-2 text-sm font-bold mb-3">
          <Briefcase className="h-4 w-4 text-primary" />
          Get Started
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Post your first job listing or create your job seeker profile to get matched with opportunities.
        </p>
      </Card>

      {/* Career Tips */}
      <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
        <h3 className="flex items-center gap-2 text-sm font-bold mb-3">
          <Lightbulb className="h-4 w-4 text-accent" />
          Career Tips
        </h3>
        <div className="space-y-2.5">
          {CAREER_TIPS.map((tip, i) => (
            <div key={i} className="flex gap-2">
              <Star className="h-3 w-3 text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
    </>
    );
}
