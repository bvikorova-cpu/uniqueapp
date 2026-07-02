import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Sparkles, FlaskConical } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ScienceLimitBannerProps {
  creditsRemaining: number;
  creditsPerRun: number;
  onBuyCredits: () => void;
}

export const ScienceLimitBanner = ({
  creditsRemaining,
  creditsPerRun,
  onBuyCredits,
}: ScienceLimitBannerProps) => {
  const canRun = creditsRemaining >= creditsPerRun;
  const runsLeft = Math.floor(creditsRemaining / creditsPerRun);

  if (!canRun) {
    return (
    <>
      <FloatingHowItWorks title={"Science Limit Banner - How it works"} steps={[{ title: 'Open', desc: 'Access the Science Limit Banner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Science Limit Banner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-foreground mb-1">
                {creditsRemaining === 0 ? "No Science credits left" : "Not enough Science credits"}
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                You have <strong>{creditsRemaining}</strong> credits. Each AI analysis costs{" "}
                <strong>{creditsPerRun}</strong>. Buy credits to continue.
              </p>
              <Button
                onClick={onBuyCredits}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Buy Science credits
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
  }

  return (
    <Card className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/40">
      <CardContent className="py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-6 w-6 text-emerald-600" />
          <div>
            <p className="font-semibold text-foreground">
              {creditsRemaining} Science credits
            </p>
            <p className="text-sm text-muted-foreground">
              ≈ {runsLeft} AI analys{runsLeft === 1 ? "is" : "es"} left ({creditsPerRun} credits each)
            </p>
          </div>
        </div>
        <Button onClick={onBuyCredits} variant="outline" size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Buy more
        </Button>
      </CardContent>
    </Card>
  );
};
