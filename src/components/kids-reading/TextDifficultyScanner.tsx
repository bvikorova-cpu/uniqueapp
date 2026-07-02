import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  text: string;
}

export const TextDifficultyScanner = ({ text }: Props) => {
  if (!text.trim()) return null;

  const words = text.trim().split(/\s+/);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / wordCount;
  const longWords = words.filter((w) => w.length > 6).length;

  // Simple readability heuristic
  const complexityScore = Math.min(
    100,
    Math.round((avgWordLength * 10 + (longWords / wordCount) * 50 + sentences * 0.5))
  );

  const difficulty =
    complexityScore < 30
      ? { label: "Easy", color: "bg-green-500", emoji: "🟢", desc: "Great for beginners!" }
      : complexityScore < 60
      ? { label: "Medium", color: "bg-yellow-500", emoji: "🟡", desc: "Moderate challenge" }
      : { label: "Hard", color: "bg-red-500", emoji: "🔴", desc: "Advanced reading" };

  const readingTime = Math.max(1, Math.ceil(wordCount / 150));

  return (
    <>
      <FloatingHowItWorks title={"Text Difficulty Scanner - How it works"} steps={[{ title: 'Open', desc: 'Access the Text Difficulty Scanner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Text Difficulty Scanner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mb-4 p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Text Analysis
        </span>
        <span className="flex items-center gap-1 text-xs font-bold">
          {difficulty.emoji} {difficulty.label}
        </span>
      </div>

      {/* Difficulty bar */}
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${complexityScore}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`absolute inset-y-0 left-0 rounded-full ${difficulty.color}`}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-background/60">
          <div className="font-black text-sm">{wordCount}</div>
          <div className="text-[10px] text-muted-foreground">Words</div>
        </div>
        <div className="p-2 rounded-lg bg-background/60">
          <div className="font-black text-sm">{sentences}</div>
          <div className="text-[10px] text-muted-foreground">Sentences</div>
        </div>
        <div className="p-2 rounded-lg bg-background/60">
          <div className="font-black text-sm">~{readingTime}m</div>
          <div className="text-[10px] text-muted-foreground">Read Time</div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">{difficulty.desc}</p>
    </motion.div>
    </>
  );
};
