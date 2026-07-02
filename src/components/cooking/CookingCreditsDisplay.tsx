import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCookingCredits } from '@/hooks/useCookingCredits';
import { Coins, Plus } from 'lucide-react';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const CookingCreditsDisplay = () => {
  const { data: credits, isLoading, purchaseCredits } = useCookingCredits();

  const handlePurchase = async (amount: number) => {
    const url = await purchaseCredits(amount);
    if (url) {
      { const __w = window.open(url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = url; }
    }
  };

  if (isLoading) return null;

  return (
    <>
      <FloatingHowItWorks title="How Cooking Credits Display works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button
            onClick={() => handlePurchase(10)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            10 Credits - €5
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePurchase(25)}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            25 Credits - €10
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePurchase(50)}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            50 Credits - €15
          </Button>
        </div>
      </div>
    </Card>
    </>
    );
};
