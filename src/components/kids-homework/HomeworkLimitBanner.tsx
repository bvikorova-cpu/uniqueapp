import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Sparkles, BookOpen } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface HomeworkLimitBannerProps {
  creditsRemaining: number;
  creditsPerQuestion: number;
  onBuyCredits: () => void;
}

export const HomeworkLimitBanner = ({
  creditsRemaining,
  creditsPerQuestion,
  onBuyCredits,
}: HomeworkLimitBannerProps) => {
  const canAsk = creditsRemaining >= creditsPerQuestion;
  const questionsLeft = Math.floor(creditsRemaining / creditsPerQuestion);

  if (!canAsk) {
    return (
    <>
      <FloatingHowItWorks title={"Homework Limit Banner - How it works"} steps={[{ title: 'Open', desc: 'Access the Homework Limit Banner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Homework Limit Banner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-foreground mb-1">
                {creditsRemaining === 0 ? "No Homework credits left" : "Not enough Homework credits"}
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                You have <strong>{creditsRemaining}</strong> credits. Each AI question costs{" "}
                <strong>{creditsPerQuestion}</strong>. Buy credits to continue learning.
              </p>
              <Button
                onClick={onBuyCredits}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Buy Homework credits
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/40">
      <CardContent className="py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <div>
            <p className="font-semibold text-foreground">
              {creditsRemaining} Homework credits
            </p>
            <p className="text-sm text-muted-foreground">
              ≈ {questionsLeft} question{questionsLeft === 1 ? "" : "s"} left ({creditsPerQuestion} credits each)
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
