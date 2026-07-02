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

  if (storiesRemaining === 0) {
    return (
      <Card className="border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-red-500/10">
        <CardContent className="py-4 px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <BookOpen className="h-6 w-6 text-orange-500 mt-1" />
              <div>
                <p className="font-semibold text-orange-500">Monthly Limit Reached</p>
                <p className="text-sm text-muted-foreground">
                  You've created {storiesCreatedThisMonth}/{monthlyLimit} story this month
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/kids-story-pricing")} className="whitespace-nowrap">
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardContent className="py-4 px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <BookOpen className="h-6 w-6 text-primary mt-1" />
            <div>
              <p className="font-semibold">Free Plan</p>
              <p className="text-sm text-muted-foreground">
                {storiesRemaining} story remaining this month ({storiesCreatedThisMonth}/{monthlyLimit} created)
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/kids-story-pricing")} variant="outline" className="whitespace-nowrap">
            <Sparkles className="mr-2 h-4 w-4" />
            Unlock Unlimited
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
