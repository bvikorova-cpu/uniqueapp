import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const AnonymousDateProgress = () => {
  const metrics = [
    { label: "Matches Found", current: 4, max: 15, color: "bg-pink-500" },
    { label: "Messages Sent", current: 28, max: 100, color: "bg-accent" },
    { label: "Credits Used", current: 35, max: 100, color: "bg-chart-3" },
  ];

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
      <FloatingHowItWorks
        title={"Anonymous Date Progress"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-5 w-5 text-pink-500" />
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
  );
};
