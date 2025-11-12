import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBrainDuelCredits } from '@/hooks/useBrainDuelCredits';
import { Brain, Plus } from 'lucide-react';
import { BuyCreditsDialog } from './BuyCreditsDialog';

export const BrainDuelCreditsDisplay = () => {
  const { credits, isLoading } = useBrainDuelCredits();
  const [showBuyDialog, setShowBuyDialog] = useState(false);

  if (isLoading) return null;

  return (
    <>
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Virtual Credits</p>
              <p className="text-2xl font-bold">{credits}</p>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowBuyDialog(true)}
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Kúpiť
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          Virtual currency for entertainment only • No real money value
        </p>
      </Card>

      <BuyCreditsDialog 
        open={showBuyDialog} 
        onOpenChange={setShowBuyDialog}
      />
    </>
  );
};
