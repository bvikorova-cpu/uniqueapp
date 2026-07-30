import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";
import { useHandwritingStats } from "@/hooks/useHandwritingStats";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const dayKey = (d: Date) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export const HandwritingStreak = () => {
  const { data, isLoading } = useHandwritingStats();
  const activeDates = new Set(data?.activeDates ?? []);

  // Build the current week (Mon..Sun) and mark days with a real analysis.
  const today = new Date();
  const dow = today.getDay() === 0 ? 7 : today.getDay(); // 1..7 (Mon..Sun)
  const weekDays = DAYS.map((label, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (dow - 1 - i));
    return { label, key: dayKey(d), isFuture: i + 1 > dow };
  });

  return (
    <>
      <FloatingHowItWorks title={"Handwriting Streak - How it works"} steps={[{ title: 'Analyze', desc: 'Run at least one handwriting analysis to mark today as active.' }, { title: 'Keep going', desc: 'Analyze on consecutive days to grow your streak.' }, { title: 'Track', desc: 'Checked days show real analyses from your account this week.' }, { title: 'Review', desc: 'Your streak counter updates automatically after each analysis.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          Analysis Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1.5">
          {weekDays.map((day, i) => {
            const isActive = activeDates.has(day.key);
            return (
              <motion.div
                key={day.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex flex-col items-center gap-1 flex-1"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-muted/30 text-muted-foreground border border-border/30"
                  } ${day.isFuture ? "opacity-40" : ""}`}
                >
                  {isActive ? "✓" : "·"}
                </div>
                <span className="text-[9px] text-muted-foreground">{day.label}</span>
              </motion.div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {isLoading ? (
            "Loading your streak…"
          ) : (
            <>
              <span className="text-primary font-bold">{data?.streak ?? 0}</span> day streak 🔥
            </>
          )}
        </p>
      </CardContent>
    </Card>
    </>
  );
};
