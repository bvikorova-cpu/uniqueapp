import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Zap } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const features = [
  { name: "Single Message Analysis", basic: true, premium: true },
  { name: "Conversation Thread", basic: false, premium: true },
  { name: "Psychological Profile", basic: false, premium: true },
  { name: "Emotional Analysis", basic: true, premium: true },
  { name: "Manipulation Detection", basic: false, premium: true },
  { name: "Detailed Reports", basic: false, premium: true },
  { name: "Analysis History", basic: true, premium: true },
  { name: "Priority Processing", basic: false, premium: true },
];

export const LieDetectorComparisonTable = () => {
  return (
    <>
      <FloatingHowItWorks title={"Lie Detector Comparison Table - How it works"} steps={[{ title: 'Open', desc: 'Access the Lie Detector Comparison Table section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Lie Detector Comparison Table.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Basic vs Premium
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-muted-foreground pb-1 border-b border-border/30">
            <span>Feature</span>
            <span className="text-center">Basic</span>
            <span className="text-center text-primary">Premium</span>
          </div>
          {features.map((f) => (
            <div key={f.name} className="grid grid-cols-3 gap-2 text-[10px] py-1">
              <span className="text-muted-foreground">{f.name}</span>
              <span className="flex justify-center">
                {f.basic ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <X className="w-3 h-3 text-muted-foreground/30" />
                )}
              </span>
              <span className="flex justify-center">
                <Check className="w-3 h-3 text-primary" />
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
  );
};
