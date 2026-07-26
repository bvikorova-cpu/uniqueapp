import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface StoryLimitBannerProps {
  storiesCreatedThisMonth: number;
  isPremium: boolean;
}

export const StoryLimitBanner = ({ storiesCreatedThisMonth, isPremium }: StoryLimitBannerProps) => {
  const navigate = useNavigate();
  const monthlyLimit = 1;
  const storiesRemaining = Math.max(0, monthlyLimit - storiesCreatedThisMonth);

  if (isPremium) {
    return (
    <>
      <FloatingHowItWorks title={"Story Limit Banner - How it works"} steps={[{ title: 'Open', desc: 'Access the Story Limit Banner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Story Limit Banner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardContent className="py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold text-primary">Premium Member</p>
                <p className="text-sm text-muted-foreground">Unlimited stories, library access & PDF export</p>
              </div>
            </div>
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </>
  );
  }

  // Non-premium users are gated purely by the credit system (see CreditBanner).
  // The legacy "1 free story / month" banner is intentionally hidden to avoid
  // conflicting messaging with the credit balance.
  return null;
};
