import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Plus, Sparkles, Zap } from "lucide-react";
import { useCharacterCredits } from "@/hooks/useCharacterCredits";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const CharacterCreditsDisplay = () => {
  const { credits, isLoading, purchaseCredits } = useCharacterCredits();

  const handlePurchase = async (amount: number) => {
    const url = await purchaseCredits(amount);
    if (url) { const __w = window.open(url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = url; }
  };

  if (isLoading) return <div className="animate-pulse h-24 bg-card/50 rounded-xl" />;

  return (
    <>
      <FloatingHowItWorks title={"Character Credits Display - How it works"} steps={[{ title: 'Open', desc: 'Access the Character Credits Display section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Character Credits Display.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="relative overflow-hidden border-border/30 bg-card/90 backdrop-blur-xl p-4 sm:p-5">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600"
          >
            <Coins className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <p className="text-muted-foreground text-xs font-medium">Battle Credits</p>
            <p className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              {credits?.credits_remaining || 0}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => handlePurchase(50)} variant="outline" className="border-amber-500/30 hover:bg-amber-500/10 text-foreground text-sm gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" /> 50 Credits — €9.99
          </Button>
          <Button onClick={() => handlePurchase(200)} variant="outline" className="border-purple-500/30 hover:bg-purple-500/10 text-foreground text-sm gap-2">
            <Zap className="h-4 w-4 text-purple-400" /> 200 Credits — €29.99
          </Button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border/20 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        <Badge variant="outline" className="text-[10px] border-border/30">Basic: 5cr</Badge>
        <Badge variant="outline" className="text-[10px] border-border/30">Premium: 15cr</Badge>
        <Badge variant="outline" className="text-[10px] border-border/30">Battle: 2cr</Badge>
        <Badge variant="outline" className="text-[10px] border-border/30">Fusion: 30cr</Badge>
        <Badge variant="outline" className="text-[10px] border-border/30">Raid: 5-25cr</Badge>
      </div>
    </Card>
    </>
  );
};
