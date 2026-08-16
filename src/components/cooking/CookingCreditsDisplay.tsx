import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCookingCredits } from '@/hooks/useCookingCredits';
import { Coins, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const CookingCreditsDisplay = () => {
  const { data: credits, isLoading } = useCookingCredits();
  const navigate = useNavigate();

  if (isLoading) return null;

  return (
    <>
      <FloatingHowItWorks title="How Cooking Credits work" steps={[
          { title: 'Credits only', desc: 'Every culinary AI tool is paid per use from your AI credit balance — no subscriptions.' },
          { title: 'Generate', desc: 'Credits are deducted automatically when a tool generates a result.' },
          { title: 'Top up', desc: 'Buy more credits anytime in the AI Credits Store.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — results are saved to your account.' },
        ]} />
      <Card className="p-4 md:p-6 bg-gradient-to-r from-primary/10 to-primary/5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Coins className="h-8 w-8 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Available Credits</p>
            <p className="text-2xl md:text-3xl font-bold">{credits?.credits || 0}</p>
          </div>
        </div>

        <Button
          onClick={() => navigate('/ai-credits-store')}
          variant="outline"
          size="sm"
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Buy AI Credits
        </Button>
      </div>
    </Card>
    </>
    );
};
