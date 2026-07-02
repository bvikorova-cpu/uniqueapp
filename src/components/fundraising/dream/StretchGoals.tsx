import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Rocket, CheckCircle2, Lock } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export interface StretchGoal {
  id: string;
  amount: number;
  title: string;
  description: string;
}

interface Props {
  baseTarget: number;
  currentAmount: number;
  goals: StretchGoal[];
}

export function StretchGoals({ baseTarget, currentAmount, goals }: Props) {
  if (!goals || goals.length === 0) return null;
  const sorted = [...goals].sort((a, b) => a.amount - b.amount);

  return (
    <>
      <FloatingHowItWorks title={"Stretch Goals - How it works"} steps={[{ title: 'Open', desc: 'Access the Stretch Goals section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Stretch Goals.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-5 bg-gradient-to-br from-accent/5 via-primary/5 to-background border-accent/20">
      <div className="flex items-center gap-2 mb-4">
        <Rocket className="w-5 h-5 text-accent" />
        <h3 className="font-bold text-lg">Stretch Goals</h3>
      </div>
      <div className="space-y-4">
        {sorted.map((goal, i) => {
          const unlocked = currentAmount >= goal.amount;
          const prevAmount = i === 0 ? baseTarget : sorted[i - 1].amount;
          const segmentProgress = Math.min(
            ((currentAmount - prevAmount) / (goal.amount - prevAmount)) * 100,
            100
          );
          const displayProgress = unlocked ? 100 : Math.max(segmentProgress, 0);

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  {unlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <span
                    className={`text-sm font-bold truncate ${unlocked ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {goal.title}
                  </span>
                </div>
                <span className="text-xs font-bold text-muted-foreground shrink-0">
                  €{goal.amount.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-1.5 ml-6">
                {goal.description}
              </p>
              <Progress value={displayProgress} className="h-1.5 ml-6" />
            </motion.div>
          );
        })}
      </div>
    </Card>
    </>
  );
}
