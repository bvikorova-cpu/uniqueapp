import { Card } from "@/components/ui/card";
import { Target, Edit2, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface EarningsGoalTrackerProps {
  /** Earnings accumulated this calendar month */
  monthEarnings: number;
  storageKey?: string;
}

export const EarningsGoalTracker = ({ monthEarnings, storageKey = "earnings_monthly_goal" }: EarningsGoalTrackerProps) => {
  const [goal, setGoal] = useState(500);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("500");

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setGoal(Number(stored));
      setDraft(stored);
    }
  }, [storageKey]);

  const save = () => {
    const v = Math.max(50, Number(draft) || 500);
    setGoal(v);
    localStorage.setItem(storageKey, String(v));
    setEditing(false);
  };

  const progress = Math.min(100, (monthEarnings / goal) * 100);
  const remaining = Math.max(0, goal - monthEarnings);

  // Days left in month
  const now = new Date();
  const eom = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysLeft = Math.max(1, Math.ceil((eom.getTime() - now.getTime()) / 86400000));
  const perDay = remaining / daysLeft;

  return (
    <>
      <FloatingHowItWorks title={"Earnings Goal Tracker - How it works"} steps={[{ title: 'Open', desc: 'Access the Earnings Goal Tracker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Earnings Goal Tracker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-6 bg-card/80 backdrop-blur-md border-amber-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Target className="h-5 w-5 text-amber-500" />
          Monthly Goal
        </h3>
        {!editing ? (
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <div className="flex gap-1">
            <Input
              type="number"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="h-8 w-24 text-sm"
            />
            <Button size="sm" onClick={save} className="h-8">
              <Check className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-3xl font-black">€{monthEarnings.toFixed(0)}</span>
          <span className="text-sm text-muted-foreground">of €{goal}</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
            className={`h-full rounded-full ${
              progress >= 100
                ? "bg-gradient-to-r from-emerald-400 to-green-500"
                : "bg-gradient-to-r from-amber-400 to-yellow-500"
            }`}
          />
        </div>
      </div>

      {progress < 100 ? (
        <p className="text-xs text-muted-foreground">
          €{remaining.toFixed(2)} to go • ~€{perDay.toFixed(2)}/day for {daysLeft} more days
        </p>
      ) : (
        <p className="text-xs font-bold text-emerald-500">🎉 Goal smashed! +€{(monthEarnings - goal).toFixed(2)} above target.</p>
      )}
    </Card>
    </>
  );
};
