import { Moon, Sun, Brain, Heart } from "lucide-react";
import type { Mood } from "@/hooks/useMatchMeta";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const MOODS: Array<{ id: Mood; label: string; icon: any; gradient: string }> = [
  { id: "mysterious", label: "Mysterious", icon: Moon, gradient: "from-violet-500 to-primary" },
  { id: "playful", label: "Playful", icon: Sun, gradient: "from-amber-500 to-orange-500" },
  { id: "deep", label: "Deep", icon: Brain, gradient: "from-cyan-500 to-blue-500" },
  { id: "flirty", label: "Flirty", icon: Heart, gradient: "from-pink-500 to-rose-500" },
];

interface Props {
  current: Mood | null;
  onChange: (mood: Mood) => void;
}

export const MoodSelector = ({ current, onChange }: Props) => (
  <div className="p-3 rounded-2xl bg-card/60 backdrop-blur-md border border-border/40">
    <p className="text-xs font-bold uppercase tracking-wide mb-2">Your mood</p>
    <div className="grid grid-cols-4 gap-1.5">
      {MOODS.map(m => {
        const active = current === m.id;
        return (
          <button
            key={m.id}
            onClick={() =>
      <FloatingHowItWorks
        title={"Mood Selector"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />
 onChange(m.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
              active
                ? `bg-gradient-to-br ${m.gradient} text-white border-transparent shadow-lg scale-105`
                : "bg-muted/30 text-muted-foreground border-border/40 hover:border-primary/40"
            }`}
          >
            <m.icon className="h-4 w-4" />
            <span className="text-[9px] font-semibold">{m.label}</span>
          </button>
        );
      })}
    </div>
  </div>
);
