import { Building2, TrendingUp, Lightbulb, Star, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";

const TRENDING_COMPANIES = [
  { name: "TechFlow Inc.", jobs: 12, logo: "TF" },
  { name: "DesignHub", jobs: 8, logo: "DH" },
  { name: "CloudFirst", jobs: 6, logo: "CF" },
  { name: "DataVerse", jobs: 5, logo: "DV" },
  { name: "GreenEnergy Co.", jobs: 4, logo: "GE" },
];

const SALARY_INSIGHTS = [
  { role: "Software Engineer", range: "$80k - $150k" },
  { role: "Product Manager", range: "$90k - $140k" },
  { role: "UX Designer", range: "$70k - $120k" },
  { role: "Data Scientist", range: "$85k - $155k" },
];

const CAREER_TIPS = [
  "Tailor your CV for each application — generic resumes get filtered out",
  "Include quantifiable achievements, not just responsibilities",
  "Network actively — 70% of jobs are filled through connections",
  "Keep your profile updated — recruiters search daily",
];

export function JobsSidebar() {
  return (
    <div className="space-y-4">
      {/* Trending Companies */}
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/30">
        <h3 className="flex items-center gap-2 text-sm font-bold mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          Trending Companies
        </h3>
        <div className="space-y-2.5">
          {TRENDING_COMPANIES.map((company) => (
            <div key={company.name} className="flex items-center gap-3 group cursor-pointer">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {company.logo}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                  {company.name}
                </p>
                <p className="text-xs text-muted-foreground">{company.jobs} open positions</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Salary Insights */}
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/30">
        <h3 className="flex items-center gap-2 text-sm font-bold mb-3">
          <DollarSign className="h-4 w-4 text-primary" />
          Salary Insights
        </h3>
        <div className="space-y-2">
          {SALARY_INSIGHTS.map((item) => (
            <div key={item.role} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
              <span className="text-xs font-medium">{item.role}</span>
              <span className="text-xs font-bold text-primary">{item.range}</span>
            </div>
          ))}
        </div>
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
  );
}
