import { motion } from "framer-motion";
import { Award, MessageSquare, Clock, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  messageCount: number;
  matchAgeHours: number;
  voiceMessageSent: boolean;
}

export const ConversationMilestones = ({ messageCount, matchAgeHours, voiceMessageSent }: Props) => {
  const milestones = [
    { icon: Clock, label: "First Hour", unlocked: matchAgeHours >= 1, gradient: "from-amber-500 to-orange-500" },
    { icon: MessageSquare, label: "10 Messages", unlocked: messageCount >= 10, gradient: "from-cyan-500 to-blue-500" },
    { icon: Sparkles, label: "Voice Note", unlocked: voiceMessageSent, gradient: "from-violet-500 to-primary" },
    { icon: Award, label: "100 Messages", unlocked: messageCount >= 100, gradient: "from-pink-500 to-rose-500" },
    { icon: Award, label: "24h Together", unlocked: matchAgeHours >= 24, gradient: "from-emerald-500 to-teal-500" },
  ];

  return (
    <div className="p-3 rounded-2xl bg-card/60 backdrop-blur-md border border-border/40">
      <FloatingHowItWorks
        title={"Conversation Milestones"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <p className="text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <Award className="h-3.5 w-3.5 text-amber-400" /> Milestones
      </p>
      <div className="flex flex-wrap gap-1.5">
        {milestones.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold border ${
              m.unlocked
                ? `bg-gradient-to-r ${m.gradient} text-white border-transparent`
                : "bg-muted/30 text-muted-foreground border-border/40 opacity-50"
            }`}
          >
            <m.icon className="h-3 w-3" />
            {m.label}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
