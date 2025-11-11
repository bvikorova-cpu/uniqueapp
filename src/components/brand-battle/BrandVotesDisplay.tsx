import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBrandVotes } from '@/hooks/useBrandVotes';
import { Vote, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { BuyVotesDialog } from './BuyVotesDialog';

export const BrandVotesDisplay = () => {
  const { data: votes, isLoading } = useBrandVotes();
  const [showBuyDialog, setShowBuyDialog] = useState(false);

  if (isLoading) return null;

  return (
    <>
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Vote className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Dostupné hlasy dnes</p>
              <p className="text-2xl font-bold">
                {votes?.remaining || 0} / {votes?.total || 1}
              </p>
              {votes && votes.purchased > 0 && (
                <p className="text-xs text-muted-foreground">
                  (vrátane {votes.purchased} zakúpených)
                </p>
              )}
            </div>
          </div>
          
          <Button 
            onClick={() => setShowBuyDialog(true)}
            variant="outline"
            className="gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Kúpiť hlasy
          </Button>
        </div>
        
        {votes && votes.remaining === 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Použil si všetky hlasy. Kúp si extra hlasy alebo počkaj do zajtra.
          </p>
        )}
      </Card>

      <BuyVotesDialog 
        open={showBuyDialog} 
        onOpenChange={setShowBuyDialog}
      />
    </>
  );
};
