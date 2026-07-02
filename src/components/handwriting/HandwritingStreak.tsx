import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const HandwritingStreak = () => {
  const today = new Date().getDay();
  const activeDays = [1, 2, 3].filter(d => d <= (today === 0 ? 7 : today));

  return (
    <>
      <FloatingHowItWorks title={"Handwriting Streak - How it works"} steps={[{ title: 'Open', desc: 'Access the Handwriting Streak section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Handwriting Streak.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          Analysis Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1.5">
          {DAYS.map((day, i) => {
            const isActive = activeDays.includes(i + 1);
            return (
              <motion.div
                key={day}
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
                  }`}
                >
                  {isActive ? "✓" : "·"}
                </div>
                <span className="text-[9px] text-muted-foreground">{day}</span>
              </motion.div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          <span className="text-primary font-bold">{activeDays.length}</span> day streak 🔥
        </p>
      </CardContent>
    </Card>
    </>
  );
};
