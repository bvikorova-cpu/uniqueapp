import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const SkillSwapProgress = () => {
  const metrics = [
    { label: "Skills Taught", current: 7, max: 20, color: "bg-primary" },
    { label: "Skills Learned", current: 4, max: 15, color: "bg-accent" },
    { label: "Exchanges Done", current: 11, max: 50, color: "bg-chart-3" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Skill Swap Progress - How it works"} steps={[{ title: 'Open', desc: 'Access the Skill Swap Progress section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Skill Swap Progress.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-sm">Your Progress</h3>
      </div>
      <div className="space-y-3">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{m.label}</span>
              <span className="font-medium">{m.current}/{m.max}</span>
            </div>
            <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <div
                className={`h-full ${m.color} rounded-full transition-all duration-1000`}
                style={{ width: `${(m.current / m.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
    </>
  );
};
