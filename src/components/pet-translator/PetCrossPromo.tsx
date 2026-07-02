import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gamepad2, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  /** Where the user currently is — promo points to the OTHER side. */
  side: "translator" | "virtual";
}

export default function PetCrossPromo({ side }: Props) {
  const target =
    side === "translator"
      ? { to: "/virtual-pet", icon: Gamepad2, title: "Try Virtual Pet", text: "Raise, train and battle a digital companion." }
      : { to: "/pet-translator", icon: Sparkles, title: "Try AI Pet Translator", text: "Decode your real pet's barks, meows and moods with AI." };
  const Icon = target.icon;

  return (
    <>
      <FloatingHowItWorks title="How Pet Cross Promo works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <Card className="p-4 border-primary/30 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent">
      <Link to={target.to} className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold">{target.title}</div>
          <div className="text-xs text-muted-foreground truncate">{target.text}</div>
        </div>
        <Button size="sm" variant="ghost" className="group-hover:translate-x-1 transition-transform">
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </Card>
    </>
    );
}
