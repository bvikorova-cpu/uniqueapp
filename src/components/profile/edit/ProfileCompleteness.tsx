import { motion } from "framer-motion";
import { CheckCircle2, Circle, Trophy, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export interface CompletenessCheck {
  key: string;
  label: string;
  done: boolean;
  weight: number;
}

interface ProfileCompletenessProps {
  checks: CompletenessCheck[];
}

export const computeCompleteness = (checks: CompletenessCheck[]) => {
  const total = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.filter((c) => c.done).reduce((s, c) => s + c.weight, 0);
  return total === 0 ? 0 : Math.round((earned / total) * 100);
};

export const ProfileCompleteness = ({ checks }: ProfileCompletenessProps) => {
  const percent = computeCompleteness(checks);
  const next = checks.find((c) => !c.done);

  const tier =
    percent >= 100 ? { label: "Legendary", color: "from-amber-300 to-amber-500", icon: Trophy } :
    percent >= 75  ? { label: "Polished",  color: "from-violet-300 to-fuchsia-400", icon: Sparkles } :
    percent >= 50  ? { label: "Growing",   color: "from-sky-300 to-blue-500", icon: Sparkles } :
                     { label: "Just started", color: "from-slate-300 to-slate-500", icon: Sparkles };

  const TierIcon = tier.icon;

  return (
    <>
      <FloatingHowItWorks title={"Profile Completeness - How it works"} steps={[{ title: 'Open', desc: 'Access the Profile Completeness section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Profile Completeness.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-5 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-lg`}>
            <TierIcon className="h-4 w-4 text-background" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Profile Strength</p>
            <p className={`text-base font-black bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>{tier.label}</p>
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black tabular-nums">{percent}%</p>
      </div>

      <Progress value={percent} className="h-2 mb-4" />

      {next && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs sm:text-sm text-muted-foreground mb-4"
        >
          ✨ Next step: <span className="font-semibold text-foreground">{next.label}</span> (+{next.weight}%)
        </motion.div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {checks.map((c) => (
          <div
            key={c.key}
            className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
              c.done
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-200"
                : "bg-muted/20 border-border/40 text-foreground/80"
            }`}
          >
            {c.done ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <Circle className="h-3.5 w-3.5 shrink-0" />}
            <span className="truncate">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};
