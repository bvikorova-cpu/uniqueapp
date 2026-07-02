import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const PastLifeStreak = () => {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const activeDays = [true, true, false, true, true, false, false];
  const currentStreak = 4;

  return (
    <>
      <FloatingHowItWorks
        title='Past Life Streak'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Past Life Streak panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="h-5 w-5 text-orange-500" />
        <h3 className="font-bold text-sm">Discovery Streak</h3>
        <span className="ml-auto text-lg font-black text-primary">{currentStreak}</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, i) => (
          <div key={i} className="text-center">
            <span className="text-[10px] text-muted-foreground">{day}</span>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center mt-1 text-xs font-medium transition-all ${
              activeDays[i]
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-muted/30 text-muted-foreground"
            }`}>
              {activeDays[i] ? "✓" : "·"}
            </div>
          </div>
        ))}
      </div>
    </Card>
    </>
  );
};
