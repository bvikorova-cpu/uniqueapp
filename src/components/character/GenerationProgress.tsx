import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Loader2, Check } from "lucide-react";
import { motion } from "framer-motion";

interface GenerationProgressProps {
  active: boolean;
  steps: string[];
  /** Approximate seconds per step used to advance the indicator. */
  stepSeconds?: number;
  title?: string;
}

/**
 * Purely presentational progress indicator for long-running AI image
 * generation. Advances through the given steps on a timer while `active`
 * and holds on the last step until the request resolves.
 */
export const GenerationProgress = ({
  active,
  steps,
  stepSeconds = 6,
  title = "Generating image...",
}: GenerationProgressProps) => {
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) {
      setIndex(0);
      setElapsed(0);
      return;
    }
    const id = window.setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const next = Math.min(Math.floor(elapsed / stepSeconds), steps.length - 1);
    setIndex(next);
  }, [elapsed, active, stepSeconds, steps.length]);

  if (!active) return null;

  // Cap at 95% — the final 5% lands when the request actually resolves.
  const value = Math.min(95, ((index + 0.5) / steps.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/40 bg-card/70 backdrop-blur-sm p-4 space-y-3"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm font-bold text-foreground">{title}</span>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">{elapsed}s</span>
      </div>

      <Progress value={value} className="h-2" />

      <ul className="space-y-1.5">
        {steps.map((step, i) => (
          <li key={step} className="flex items-center gap-2 text-xs">
            {i < index ? (
              <Check className="h-3.5 w-3.5 text-primary shrink-0" />
            ) : i === index ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
            ) : (
              <span className="h-3.5 w-3.5 rounded-full border border-border/60 shrink-0" />
            )}
            <span className={i <= index ? "text-foreground" : "text-muted-foreground"}>{step}</span>
          </li>
        ))}
      </ul>

      <p className="text-[11px] text-muted-foreground">
        This can take up to a minute. Please keep this page open.
      </p>
    </motion.div>
  );
};
