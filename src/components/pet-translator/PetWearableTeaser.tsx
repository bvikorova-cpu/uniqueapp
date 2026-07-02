import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Watch, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function PetWearableTeaser({ onBack }: { onBack: () => void }) {
  return (
    <>
      <FloatingHowItWorks title="How Pet Wearable Teaser works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <div className="flex items-center gap-2 mb-2"><Watch className="w-5 h-5 text-primary" /><h2 className="text-xl font-bold">Smart Pet Collar</h2><Badge>Coming 2026</Badge></div>
        <p className="text-sm text-muted-foreground mb-4">
          Real-time emotion + activity tracking via accelerometer + microphone. Sync with the app for live alerts.
        </p>
        <ul className="space-y-2 text-sm mb-4">
          <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-primary mt-0.5" />24/7 mood + stress monitoring</li>
          <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-primary mt-0.5" />Bark/meow translation on the go</li>
          <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-primary mt-0.5" />GPS + activity tracking</li>
          <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-primary mt-0.5" />Health alerts to your phone</li>
        </ul>
        <Button className="w-full" disabled>Join the waitlist (soon)</Button>
      </Card>
    </div>
    </>
    );
}
