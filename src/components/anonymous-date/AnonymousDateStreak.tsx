import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const AnonymousDateStreak = () => {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const activeDays = [true, true, true, false, true, false, false];
  const currentStreak = 3;

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
      <FloatingHowItWorks
        title={"Anonymous Date Streak"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center gap-2 mb-3">
        <Flame className="h-5 w-5 text-orange-500" />
        <h3 className="font-bold text-sm">Chat Streak</h3>
        <span className="ml-auto text-lg font-black text-primary">{currentStreak}</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, i) => (
          <div key={i} className="text-center">
            <span className="text-[10px] text-muted-foreground">{day}</span>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center mt-1 text-xs font-medium transition-all ${
              activeDays[i]
                ? "bg-pink-500/20 text-pink-500 border border-pink-500/30"
                : "bg-muted/30 text-muted-foreground"
            }`}>
              {activeDays[i] ? "✓" : "·"}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
