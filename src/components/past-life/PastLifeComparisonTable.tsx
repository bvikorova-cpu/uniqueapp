import { Card } from "@/components/ui/card";
import { Check, X, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const features = [
  { name: "Past Life Story", basic: true, full: true, soulmate: true },
  { name: "Historical Period", basic: true, full: true, soulmate: true },
  { name: "AI Illustrations", basic: false, full: true, soulmate: true },
  { name: "Multiple Lives (3)", basic: false, full: true, soulmate: true },
  { name: "Karmic Theme", basic: true, full: true, soulmate: true },
  { name: "Soul Evolution", basic: false, full: true, soulmate: true },
  { name: "Partner Analysis", basic: false, full: false, soulmate: true },
  { name: "Shared Past Lives", basic: false, full: false, soulmate: true },
];

export const PastLifeComparisonTable = () => {
  return (
    <>
      <FloatingHowItWorks
        title='Past Life Comparison Table'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Past Life Comparison Table panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        Reading Comparison
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left py-2 text-muted-foreground font-medium">Feature</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Basic</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Full</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Soul</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f) => (
              <tr key={f.name} className="border-b border-border/10">
                <td className="py-1.5 text-muted-foreground">{f.name}</td>
                <td className="text-center">{f.basic ? <Check className="h-3 w-3 text-primary mx-auto" /> : <X className="h-3 w-3 text-muted-foreground/30 mx-auto" />}</td>
                <td className="text-center">{f.full ? <Check className="h-3 w-3 text-primary mx-auto" /> : <X className="h-3 w-3 text-muted-foreground/30 mx-auto" />}</td>
                <td className="text-center">{f.soulmate ? <Check className="h-3 w-3 text-primary mx-auto" /> : <X className="h-3 w-3 text-muted-foreground/30 mx-auto" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
    </>
  );
};
