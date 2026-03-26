import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const badges = [
  { id: "first", label: "Prvý experiment", icon: "🥇", requirement: 1 },
  { id: "five", label: "5 experimentov", icon: "🧪", requirement: 5 },
  { id: "ten", label: "Vedecký nadšenec", icon: "🔬", requirement: 10 },
  { id: "twenty", label: "Laboratórny expert", icon: "🧫", requirement: 20 },
  { id: "fifty", label: "Vedec roka", icon: "🏆", requirement: 50 },
];

interface ExperimentTrackerProps {
  experimentsCompleted: number;
}

export const ExperimentTracker = ({ experimentsCompleted }: ExperimentTrackerProps) => {
  return (
    <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏅 Tvoje úspechy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-center">
          <p className="text-3xl font-black text-indigo-500">{experimentsCompleted}</p>
          <p className="text-sm text-muted-foreground">dokončených experimentov</p>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {badges.map((badge, i) => {
            const unlocked = experimentsCompleted >= badge.requirement;
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`text-center p-2 rounded-xl border ${unlocked ? "border-amber-500/40 bg-amber-500/10" : "border-border bg-muted/30 opacity-40"}`}
              >
                <div className={`text-2xl mb-1 ${unlocked ? "" : "grayscale"}`}>{badge.icon}</div>
                <div className="text-[10px] font-medium leading-tight">{badge.label}</div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
