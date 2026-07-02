import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBrainDuelCredits } from '@/hooks/useBrainDuelCredits';
import { Brain, Plus, Sparkles } from 'lucide-react';
import { BuyCreditsDialog } from './BuyCreditsDialog';
import { motion } from 'framer-motion';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const BrainDuelCreditsDisplay = () => {
  const { credits, isLoading } = useBrainDuelCredits();
  const [showBuyDialog, setShowBuyDialog] = useState(false);

  if (isLoading) return null;

  return (
    <>
      <FloatingHowItWorks title={"Brain Duel Credits Display - How it works"} steps={[{ title: 'Open', desc: 'Access the Brain Duel Credits Display section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Brain Duel Credits Display.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-4 backdrop-blur-xl bg-card/80 border-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.div
                className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Brain className="h-5 w-5 text-primary" />
              </motion.div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Virtual Credits
                </p>
                <p className="text-2xl font-black">{credits}</p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowBuyDialog(true)}
              variant="outline"
              className="gap-2 border-primary/20 hover:bg-primary/10"
            >
              <Plus className="h-4 w-4" />
              Buy
            </Button>
          </div>
          
          <p className="relative text-[10px] text-muted-foreground mt-2">
            Virtual currency for entertainment only • No real money value
          </p>
        </Card>
      </motion.div>

      <BuyCreditsDialog 
        open={showBuyDialog} 
        onOpenChange={setShowBuyDialog}
      />
    </>
    </>
  );
};