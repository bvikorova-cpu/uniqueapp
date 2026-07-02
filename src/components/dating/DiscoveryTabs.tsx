import { Button } from "@/components/ui/button";
import { Flame, Star, Sparkles, Crown, Brain } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export type DiscoveryMode = "deck" | "top_picks" | "standouts" | "most_compatible" | "ai_smart";

const TABS: { id: DiscoveryMode; label: string; icon: any }[] = [
  { id: "deck", label: "Deck", icon: Flame },
  { id: "ai_smart", label: "AI Smart", icon: Brain },
  { id: "most_compatible", label: "Compatible", icon: Sparkles },
  { id: "top_picks", label: "Top Picks", icon: Crown },
  { id: "standouts", label: "Standouts", icon: Star },
];

export const DiscoveryTabs = ({ mode, onChange }: { mode: DiscoveryMode; onChange: (m: DiscoveryMode) => void }) => (
  <div className="flex gap-1 overflow-x-auto pb-1">
    {TABS.map(t => {
      const Icon = t.icon;
      const active = mode === t.id;
      return (
        <Button key={t.id} variant={active ? "default" : "outline"} size="sm"
          onClick={() =>
      <FloatingHowItWorks
        title={"Discovery Tabs"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />
 onChange(t.id)} className="gap-1 whitespace-nowrap flex-shrink-0">
          <Icon className="h-3 w-3" /> {t.label}
        </Button>
      );
    })}
  </div>
);
