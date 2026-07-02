import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const PastLifeProgressPreview = () => {
  const metrics = [
    { label: "Lives Discovered", current: 7, max: 20, color: "bg-primary" },
    { label: "Eras Explored", current: 4, max: 12, color: "bg-accent" },
    { label: "Credits Used", current: 45, max: 100, color: "bg-chart-3" },
  ];

  return (
    <>
      <FloatingHowItWorks
        title='Past Life Progress Preview'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Past Life Progress Preview panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
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
