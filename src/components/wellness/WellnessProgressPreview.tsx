import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { useWellnessStats } from "@/hooks/useWellnessStats";

export const WellnessProgressPreview = () => {
  const {
    sessionsCompleted,
    minutesMeditated,
    journalCount,
    soundMinutes,
    hasActivity,
    isLoading,
  } = useWellnessStats();

  const items = [
    { label: "Sessions completed", value: sessionsCompleted, goal: 10 },
    { label: "Minutes meditated", value: minutesMeditated, goal: 60 },
    { label: "Journal entries", value: journalCount, goal: 7 },
    { label: "Nature sound minutes", value: soundMinutes, goal: 300 },
  ];

  return (
    <>
      <FloatingHowItWorks title="Your Progress — How it works" steps={[{title:"Everything is live",desc:"These numbers come straight from your saved wellness activity — nothing is pre-filled."},{title:"Sessions & minutes",desc:"Completed meditations and body scans add to your session count and minutes."},{title:"Journal & sounds",desc:"Gratitude entries and nature-sound listening time are tracked separately."},{title:"Bars show goals",desc:"Each bar fills toward the next milestone used by your achievements."}]} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-primary" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isLoading && !hasActivity && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-primary/40" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">No sessions yet</p>
              <p className="text-xs text-muted-foreground">Start a wellness session to track your progress!</p>
            </div>
          )}

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-bold">{isLoading ? "–" : item.value}</span>
                </div>
                <Progress
                  value={Math.min(100, (item.value / item.goal) * 100)}
                  className="h-1.5"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>);
};
