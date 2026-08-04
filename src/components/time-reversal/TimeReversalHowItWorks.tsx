import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, Sparkles, Images, Swords, BookOpen, CreditCard, Brain, Film } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";
import { TIME_REVERSAL_COSTS } from "@/hooks/useTimeReversalCredits";
import { HOLO_COSTS } from "@/hooks/useHolographicCredits";

interface Props { onBack: () => void; }

export function TimeReversalHowItWorks({ onBack }: Props) {
  return (
    <>
      <FloatingHowItWorks
        title="Time Reversal - How it works"
        steps={[
          { title: "Upload a photo", desc: "Add one clear face photo in Time-Lapse Creator." },
          { title: "Generate a collage", desc: `AI builds all age frames into one collage for ${TIME_REVERSAL_COSTS.timelapse} credits.` },
          { title: "Public gallery", desc: "Every finished collage is published automatically for everyone to browse." },
          { title: "Battle for XP", desc: "Spend credits in Age Battle Arena to win XP." },
        ]}
      />
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back"><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">How It Works</h2>
            <p className="text-sm text-muted-foreground">Complete guide to Time Reversal</p>
          </div>
        </div>

        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="pt-6">
            <h3 className="text-xl font-black text-primary mb-4">What is Time Reversal?</h3>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              Time Reversal turns a single photo into a complete AI age-progression collage — from a small child all the way
              to a very elderly version of the same face. Every generated collage is published automatically to the public
              gallery, where anyone can browse the results.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              There is no subscription and no profile to maintain. You pay only with AI credits for what you generate, and
              you can also spend credits in the Age Battle Arena to win XP.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Upload, title: "1. Upload your photo", desc: "Open Time-Lapse Creator and add one clear, well-lit face photo." },
            { icon: Sparkles, title: "2. Choose the age range", desc: "Set the start and end age plus how many frames the collage should contain." },
            { icon: Film, title: "3. Generate the collage", desc: `AI renders every age frame and merges them into one collage for ${TIME_REVERSAL_COSTS.timelapse} credits. Failed generations are not charged.` },
            { icon: Images, title: "4. Public gallery", desc: "The finished collage appears automatically in the public gallery — images only, no names and no likes." },
            { icon: Swords, title: "5. Battle for XP", desc: `Age Battle Arena: 1v1 duel (${HOLO_COSTS.battle_1v1} credits), Survival (${HOLO_COSTS.battle_survival}) or Tournament (${HOLO_COSTS.battle_tournament}). Wins pay out XP, not credits.` },
            { icon: BookOpen, title: "6. Reverse Life Story", desc: `Let AI write your biography backwards for ${TIME_REVERSAL_COSTS.life_story} credits.` },
            { icon: CreditCard, title: "7. Top up credits", desc: "Credits are shared across every AI tool on the platform — buy more anytime in the AI Credits store." },
          ].map((step, i) => (
            <Card key={i} className="border-border/40 hover:border-primary/30 transition-all">
              <CardContent className="pt-4 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-amber-500/30">
          <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-amber-500" /> Tips for the best results</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {[
                "Use a sharp, well-lit photo with the face looking straight at the camera",
                "Avoid sunglasses, hats and heavy filters — they confuse the age transformation",
                "A wider age range (for example 5 to 90) gives a far more dramatic collage",
                "More frames means a richer collage, but generation takes a little longer",
                "Check your credit balance before generating so the run is not interrupted",
                "Browsing the public gallery is free and costs no credits",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold text-xs mt-0.5">💡</span>
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
