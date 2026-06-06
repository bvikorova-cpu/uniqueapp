import { Button } from "@/components/ui/button";
import { Flame, Star, Sparkles, Crown } from "lucide-react";

export type DiscoveryMode = "deck" | "top_picks" | "standouts" | "most_compatible";

const TABS: { id: DiscoveryMode; label: string; icon: any }[] = [
  { id: "deck", label: "Deck", icon: Flame },
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
          onClick={() => onChange(t.id)} className="gap-1 whitespace-nowrap flex-shrink-0">
          <Icon className="h-3 w-3" /> {t.label}
        </Button>
      );
    })}
  </div>
);
