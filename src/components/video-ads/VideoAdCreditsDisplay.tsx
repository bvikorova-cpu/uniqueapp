import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVideoAdCredits } from '@/hooks/useVideoAdCredits';
import { Video, Plus } from 'lucide-react';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";
import { useState } from 'react';

export const VideoAdCreditsDisplay = () => {
  const { credits, isLoading, purchaseCredits } = useVideoAdCredits();
  const [purchasing, setPurchasing] = useState<number | null>(null);

  const handlePurchase = async (amount: number) => {
    if (purchasing) return;
    setPurchasing(amount);

    // Open immediately from the tap/click event so mobile browsers and the
    // Lovable preview iframe do not block Stripe after the async checkout call.
    const checkoutTab = window.open("", "_blank");
    if (checkoutTab) {
      checkoutTab.document.write("<p>Opening secure Stripe checkout…</p>");
      checkoutTab.document.close();
    }

    try {
      const url = await purchaseCredits(amount);
      if (!url) {
        checkoutTab?.close();
        return;
      }

      if (checkoutTab && !checkoutTab.closed) {
        checkoutTab.location.assign(url);
        checkoutTab.opener = null;
      } else {
        window.location.assign(url);
      }
    } finally {
      setPurchasing(null);
    }
  };


  if (isLoading) return null;

  return (
    <>
      <FloatingHowItWorks title={"Video Ad Credits Display - How it works"} steps={[{ title: 'Open', desc: 'Access the Video Ad Credits Display section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Video Ad Credits Display.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Video className="h-8 w-8 text-primary shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Available Credits</p>
            <p className="text-3xl font-bold">{credits?.credits_remaining || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tier: {credits?.tier || 'Free'}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            onClick={() => handlePurchase(10)}
            disabled={purchasing !== null}
            variant="outline"
            size="sm"
            className="w-full justify-center sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {purchasing === 10 ? "Opening Stripe…" : "10 Credits - €8"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePurchase(25)}
            disabled={purchasing !== null}
            className="w-full justify-center sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {purchasing === 25 ? "Opening Stripe…" : "25 Credits - €18"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePurchase(50)}
            disabled={purchasing !== null}
            className="w-full justify-center sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {purchasing === 50 ? "Opening Stripe…" : "50 Credits - €30"}
          </Button>
        </div>
      </div>
    </Card>

    </>
  );
};
