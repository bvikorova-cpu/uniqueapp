import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVideoAdCredits } from '@/hooks/useVideoAdCredits';
import { Video, Plus } from 'lucide-react';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const VideoAdCreditsDisplay = () => {
  const { credits, isLoading, purchaseCredits } = useVideoAdCredits();

  const handlePurchase = async (amount: number) => {
    const url = await purchaseCredits(amount);
    if (url) {
      { const __w = window.open(url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = url; }
    }
  };

  if (isLoading) return null;

  return (
    <>
      <FloatingHowItWorks title={"Video Ad Credits Display - How it works"} steps={[{ title: 'Open', desc: 'Access the Video Ad Credits Display section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Video Ad Credits Display.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Video className="h-8 w-8 text-primary" />
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
            10 Credits - €8
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePurchase(25)}
          >
            <Plus className="mr-2 h-4 w-4" />
            25 Credits - €18
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePurchase(50)}
          >
            <Plus className="mr-2 h-4 w-4" />
            50 Credits - €30
          </Button>
        </div>
      </div>
    </Card>
    </>
  );
};
