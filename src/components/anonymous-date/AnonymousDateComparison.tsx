import { Card } from "@/components/ui/card";
import { Check, X, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const features = [
  { name: "Anonymous Profile", basic: true, standard: true, premium: true },
  { name: "Interest Matching", basic: true, standard: true, premium: true },
  { name: "Text Messages", basic: true, standard: true, premium: true },
  { name: "Voice Messages", basic: false, standard: true, premium: true },
  { name: "Profile Hints", basic: false, standard: true, premium: true },
  { name: "Virtual Gifts", basic: false, standard: false, premium: true },
  { name: "Early Reveal", basic: false, standard: false, premium: true },
  { name: "Priority Matching", basic: false, standard: false, premium: true },
];

export const AnonymousDateComparison = () => {
  return (
    <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
      <FloatingHowItWorks
        title={"Anonymous Date Comparison"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-pink-500" />
        Package Comparison
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left py-2 text-muted-foreground font-medium">Feature</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Basic</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Std</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Prem</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f) => (
              <tr key={f.name} className="border-b border-border/10">
                <td className="py-1.5 text-muted-foreground">{f.name}</td>
                <td className="text-center">{f.basic ? <Check className="h-3 w-3 text-pink-500 mx-auto" /> : <X className="h-3 w-3 text-muted-foreground/30 mx-auto" />}</td>
                <td className="text-center">{f.standard ? <Check className="h-3 w-3 text-pink-500 mx-auto" /> : <X className="h-3 w-3 text-muted-foreground/30 mx-auto" />}</td>
                <td className="text-center">{f.premium ? <Check className="h-3 w-3 text-pink-500 mx-auto" /> : <X className="h-3 w-3 text-muted-foreground/30 mx-auto" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
