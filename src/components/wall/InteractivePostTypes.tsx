import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Clock, Users, Music2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface QuickPollProps {
  question: string;
  options: PollOption[];
  totalVotes: number;
  onVote?: (optionId: string) => void;
  voted?: string | null;
}

export const QuickPoll = ({ question, options, totalVotes, onVote, voted }: QuickPollProps) => {
  const [selected, setSelected] = useState<string | null>(voted || null);

  const handleVote = (optionId: string) => {
    if (selected) return;
    setSelected(optionId);
    onVote?.(optionId);
  };

  return (
    <div className="rounded-xl bg-accent/20 backdrop-blur-sm border border-white/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">{question}</span>
      </div>
      <div className="space-y-2">
        {options.map((option) => {
          const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          return (
            <motion.button
              key={option.id}
              whileHover={!selected ? { scale: 1.01 } : {}}
              whileTap={!selected ? { scale: 0.99 } : {}}
              onClick={() => handleVote(option.id)}
              className={`w-full relative rounded-lg overflow-hidden transition-all ${
                selected ? 'cursor-default' : 'cursor-pointer hover:ring-1 hover:ring-primary/30'
              } ${selected === option.id ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="relative z-10 flex justify-between items-center px-3 py-2.5">
                <span className="text-sm font-medium">{option.text}</span>
                {selected && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs font-bold text-primary"
                  >
                    {percentage}%
                  </motion.span>
                )}
              </div>
              {selected && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-primary/15 rounded-lg"
                />
              )}
              {!selected && (
                <div className="absolute inset-0 bg-accent/30 rounded-lg" />
              )}
            </motion.button>
          );
        })}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Users className="w-3 h-3" />
        <span>{totalVotes} votes</span>
        <Clock className="w-3 h-3 ml-2" />
        <span>23h left</span>
      </div>
    </div>
  );
};

interface CountdownTimerProps {
  label: string;
  targetDate: Date;
}

export const CountdownTimer = ({ label, targetDate }: CountdownTimerProps) => {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));

  return (
    <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <div className="flex gap-3 justify-center">
        {[
          { value: days, label: "Days" },
          { value: hours, label: "Hours" },
          { value: minutes, label: "Min" },
        ].map((unit) => (
          <div key={unit.label} className="text-center">
            <motion.div
              key={unit.value}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-black text-primary tabular-nums"
            >
              {String(unit.value).padStart(2, '0')}
            </motion.div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
