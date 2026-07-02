import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const WellnessProgressPreview = () => {
  return (
    <>
      <FloatingHowItWorks title="WellnessProgressPreview — How it works" steps={[{title:"Open this tool",desc:"Access WellnessProgressPreview within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-primary" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-primary/40" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">No sessions yet</p>
            <p className="text-xs text-muted-foreground">Start a wellness session to track your progress!</p>
          </div>

          <div className="space-y-3">
            {[
              { label: "Sessions completed", value: 0 },
              { label: "Minutes meditated", value: 0 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-bold">{item.value}</span>
                </div>
                <Progress value={item.value} className="h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>);
};
