import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBrandVotes } from '@/hooks/useBrandVotes';
import { Vote, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { BuyVotesDialog } from './BuyVotesDialog';
import { motion } from 'framer-motion';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const BrandVotesDisplay = () => {
  const { data: votes, isLoading } = useBrandVotes();
  const [showBuyDialog, setShowBuyDialog] = useState(false);

  if (isLoading) return null;

  const remaining = votes?.remaining || 0;
  const total = votes?.total || 1;
  const pct = Math.round((remaining / total) * 100);

  return (
    <>
      <FloatingHowItWorks title={"Brand Votes Display - How it works"} steps={[{ title: 'Open', desc: 'Access the Brand Votes Display section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Brand Votes Display.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-4 backdrop-blur-xl bg-card/80 border-primary/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Vote className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available votes today</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{remaining} / {total}</p>
                  {votes && votes.purchased > 0 && (
                    <span className="text-xs text-muted-foreground">(+{votes.purchased} purchased)</span>
                  )}
                </div>
                {/* Mini progress bar */}
                <div className="w-32 h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowBuyDialog(true)}
              variant="outline"
              className="gap-2 border-primary/20 hover:bg-primary/10"
            >
              <ShoppingCart className="h-4 w-4" />
              Buy Votes
            </Button>
          </div>

          {remaining === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              You've used all your votes. Buy extra votes or wait until tomorrow.
            </p>
          )}
        </Card>
      </motion.div>

      <BuyVotesDialog open={showBuyDialog} onOpenChange={setShowBuyDialog} />
    </>
    </>
  );
};
