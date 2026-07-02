import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Coins, Gem } from "lucide-react";
import { useHorseCurrency, usePurchaseCurrency } from "@/hooks/useHorseRacing";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const HorseCurrencyDisplay = () => {
  const { currency, isLoading } = useHorseCurrency();
  const purchaseCurrency = usePurchaseCurrency();
  const [showBuyCoins, setShowBuyCoins] = useState(false);
  const [showBuyGems, setShowBuyGems] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  if (isLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Horse Currency Display - How it works"} steps={[{ title: 'Open', desc: 'Access the Horse Currency Display section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Horse Currency Display.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="p-8 text-center">
        <div className="inline-flex items-center gap-2 text-emerald-400/60 font-mono text-sm uppercase tracking-wider">
          <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
          Loading Currency...
        </div>
      </div>
    </>
  );
  }

  const handlePurchase = (packageType: string) => {
    if (!currency) {
      toast.error("Unable to load currency. Please refresh the page.");
      return;
    }
    setSelectedPackage(packageType);
    purchaseCurrency.mutate(packageType, {
      onSettled: () => {
        setSelectedPackage(null);
        setShowBuyCoins(false);
        setShowBuyGems(false);
      },
      onError: () => {
        toast.error("Purchase failed. Please try again.");
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Card className="relative overflow-hidden bg-slate-900/60 border-emerald-500/20 backdrop-blur-sm p-4 sm:p-6">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Coins className="h-7 w-7 text-amber-400" />
                <div className="absolute -inset-2 bg-amber-400/10 rounded-full blur-md" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-emerald-400/40 uppercase tracking-wider">Coins</p>
                <p className="text-2xl font-bold font-mono text-white">{currency?.coins || 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Gem className="h-7 w-7 text-violet-400" />
                <div className="absolute -inset-2 bg-violet-400/10 rounded-full blur-md" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-emerald-400/40 uppercase tracking-wider">Gems</p>
                <p className="text-2xl font-bold font-mono text-white">{currency?.gems || 0}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog open={showBuyCoins} onOpenChange={setShowBuyCoins}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-slate-800/40 border-amber-500/20 text-amber-400 hover:bg-amber-950/40 font-mono uppercase tracking-wider text-xs"
                >
                  <Coins className="mr-2 h-4 w-4" />
                  Buy Coins
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-emerald-500/20">
                <DialogHeader>
                  <DialogTitle className="font-mono text-white">Buy Coins</DialogTitle>
                  <DialogDescription className="text-emerald-400/50 font-mono text-xs">
                    Select a coin package for training and breeding
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start p-4 bg-slate-800/40 border-emerald-500/20 hover:border-amber-400/40 hover:bg-amber-950/20 transition-all"
                    onClick={() => handlePurchase("coins_100")}
                    disabled={purchaseCurrency.isPending}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Coins className="h-5 w-5 text-amber-400" />
                      <span className="font-bold font-mono text-white">
                        {selectedPackage === "coins_100" && purchaseCurrency.isPending ? "Processing..." : "100 Coins"}
                      </span>
                    </div>
                    <span className="text-sm text-emerald-400/50 font-mono">€1.99</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start p-4 bg-slate-800/40 border-amber-500/30 hover:border-amber-400/50 hover:bg-amber-950/20 transition-all"
                    onClick={() => handlePurchase("coins_500")}
                    disabled={purchaseCurrency.isPending}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Coins className="h-5 w-5 text-amber-400" />
                      <span className="font-bold font-mono text-white">
                        {selectedPackage === "coins_500" && purchaseCurrency.isPending ? "Processing..." : "500 Coins"}
                      </span>
                      <span className="text-[10px] bg-gradient-to-r from-emerald-600 to-amber-600 text-white px-2 py-0.5 rounded font-mono uppercase">
                        Bonus
                      </span>
                    </div>
                    <span className="text-sm text-emerald-400/50 font-mono">€8.99</span>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showBuyGems} onOpenChange={setShowBuyGems}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white border border-emerald-400/30 shadow-lg shadow-emerald-500/20 font-mono uppercase tracking-wider text-xs">
                  <Gem className="mr-2 h-4 w-4" />
                  Buy Gems
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-emerald-500/20">
                <DialogHeader>
                  <DialogTitle className="font-mono text-white">Buy Gems</DialogTitle>
                  <DialogDescription className="text-emerald-400/50 font-mono text-xs">
                    Select a gem package for exclusive colors and options
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start p-4 bg-slate-800/40 border-emerald-500/20 hover:border-violet-400/40 hover:bg-violet-950/20 transition-all"
                    onClick={() => handlePurchase("gems_50")}
                    disabled={purchaseCurrency.isPending}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Gem className="h-5 w-5 text-violet-400" />
                      <span className="font-bold font-mono text-white">
                        {selectedPackage === "gems_50" && purchaseCurrency.isPending ? "Processing..." : "50 Gems"}
                      </span>
                    </div>
                    <span className="text-sm text-emerald-400/50 font-mono">€4.99</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start p-4 bg-slate-800/40 border-violet-500/30 hover:border-violet-400/50 hover:bg-violet-950/20 transition-all"
                    onClick={() => handlePurchase("gems_200")}
                    disabled={purchaseCurrency.isPending}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Gem className="h-5 w-5 text-violet-400" />
                      <span className="font-bold font-mono text-white">200 Gems</span>
                      <span className="text-[10px] bg-gradient-to-r from-emerald-600 to-amber-600 text-white px-2 py-0.5 rounded font-mono uppercase">
                        Bonus
                      </span>
                    </div>
                    <span className="text-sm text-emerald-400/50 font-mono">€18.99</span>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-emerald-500/10">
          <p className="text-[10px] text-emerald-400/40 font-mono">
            ⚖️ <strong className="text-emerald-400/60">Legal Notice:</strong> Virtual currency cannot be exchanged for real money. All purchases are final and for entertainment purposes only.
          </p>
        </div>
      </Card>
    </motion.div>
  );
};
