import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Calculator } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const REWARD_PER_REFERRAL = 5;

export function ReferralEarningsCalculator() {
  const [count, setCount] = useState(10);
  const total = count * REWARD_PER_REFERRAL;

  return (
    <Card className="border-yellow-500/20 bg-card/80 backdrop-blur-xl">
      <FloatingHowItWorks
        title={"Referral Earnings Calculator"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-5 w-5 text-yellow-500" /> Earnings Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
            €{total}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            if {count} {count === 1 ? "friend" : "friends"} subscribe
          </p>
        </div>
        <Slider
          value={[count]}
          min={1}
          max={100}
          step={1}
          onValueChange={(v) => setCount(v[0])}
          className="my-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 friend</span>
          <span>100 friends</span>
        </div>
      </CardContent>
    </Card>
  );
}
