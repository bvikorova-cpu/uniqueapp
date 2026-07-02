import { Button } from "@/components/ui/button";
import { Heart, Shield, Users, Sun } from "lucide-react";
import { useToggleReaction } from "@/hooks/useSafetyExtras";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const REACTIONS = [
  { type: "hug", icon: Heart, label: "Hug", color: "text-pink-400" },
  { type: "strength", icon: Shield, label: "Strength", color: "text-teal-400" },
  { type: "relate", icon: Users, label: "Relate", color: "text-violet-400" },
  { type: "hope", icon: Sun, label: "Hope", color: "text-amber-400" },
];

export function WallReactions({ messageId, counts }: { messageId: string; counts: Record<string, number> }) {
  const toggle = useToggleReaction();
  return (
    <>
      <FloatingHowItWorks title={"Wall Reactions - How it works"} steps={[{ title: 'Open', desc: 'Access the Wall Reactions section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Wall Reactions.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex flex-wrap gap-1 mt-2">
      {REACTIONS.map((r) => {
        const Icon = r.icon;
        const count = counts?.[r.type] || 0;
        return (
          <Button
            key={r.type}
            variant="ghost"
            size="sm"
            className="h-7 px-2 gap-1 hover:bg-card/80 border border-border/40"
            onClick={() => toggle.mutate({ message_id: messageId, reaction_type: r.type })}
          >
            <Icon className={`h-3 w-3 ${r.color}`} />
            <span className="text-xs">{count}</span>
          </Button>
        );
      })}
    </div>
    </>
  );
}
