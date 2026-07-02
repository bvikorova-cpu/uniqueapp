import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAnalyzerCredits } from '@/hooks/useAnalyzerCredits';
import { Eye, Plus } from 'lucide-react';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const AnalyzerCreditsDisplay = () => {
  const { credits, isLoading, purchaseCredits } = useAnalyzerCredits();

  const handlePurchase = async (amount: number) => {
    const url = await purchaseCredits(amount);
    if (url) {
      { const __w = window.open(url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = url; }
    }
  };

  if (isLoading) return null;

  return (
    <>
      <FloatingHowItWorks title={"Analyzer Credits Display - How it works"} steps={[{ title: 'Open', desc: 'Access the Analyzer Credits Display section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Analyzer Credits Display.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Available Credits</p>
            <p className="text-3xl font-bold">{credits?.credits_remaining || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tier: {credits?.tier || 'Free'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handlePurchase(10)}
            variant="outline"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            10 Credits - €6
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePurchase(30)}
          >
            <Plus className="mr-2 h-4 w-4" />
            30 Credits - €15
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePurchase(60)}
          >
            <Plus className="mr-2 h-4 w-4" />
            60 Credits - €25
          </Button>
        </div>
      </div>
    </Card>
    </>
  );
};
