import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Sparkles, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HomeworkLimitBannerProps {
  questionsUsed: number;
  questionsLimit: number;
  isPremium: boolean;
}

export const HomeworkLimitBanner = ({ questionsUsed, questionsLimit, isPremium }: HomeworkLimitBannerProps) => {
  const navigate = useNavigate();

  if (isPremium) {
    return (
      <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/50">
        <CardContent className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-yellow-600" />
            <div>
              <p className="font-semibold text-foreground">Premium Member</p>
              <p className="text-sm text-muted-foreground">Unlimited questions every day!</p>
            </div>
          </div>
          <Sparkles className="h-8 w-8 text-yellow-600" />
        </CardContent>
      </Card>
    );
  }

  const isLimitReached = questionsUsed >= questionsLimit;

  if (isLimitReached) {
    return (
      <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-foreground mb-1">Daily Limit Reached</p>
              <p className="text-sm text-muted-foreground mb-3">
                You've used your free question for today. Upgrade to Premium for unlimited questions!
              </p>
              <Button 
                onClick={() => navigate('/kids-pricing')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/50">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">Free Plan</p>
            <p className="text-sm text-muted-foreground">
              {questionsLimit - questionsUsed} question{questionsLimit - questionsUsed !== 1 ? 's' : ''} remaining today
            </p>
          </div>
          <Button 
            onClick={() => navigate('/kids-pricing')}
            variant="outline"
            size="sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};