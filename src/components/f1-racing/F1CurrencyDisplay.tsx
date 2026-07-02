import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Coins, Gem, ShoppingCart, Zap } from "lucide-react";
import { useF1Currency } from "@/hooks/useF1Racing";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const packages = [
  { id: "coins_100", name: "100 Coins", coins: 100, gems: 0, price: 5.99, popular: false },
  { id: "coins_500", name: "500 Coins", coins: 500, gems: 0, price: 12.99, popular: false },
  { id: "coins_1000", name: "1000 Coins", coins: 1000, gems: 0, price: 22.99, popular: true },
  { id: "gems_50", name: "50 Gems", coins: 0, gems: 50, price: 8.99, popular: false },
  { id: "gems_200", name: "200 Gems", coins: 0, gems: 200, price: 24.99, popular: false },
  { id: "bundle_starter", name: "Starter Bundle", coins: 500, gems: 100, price: 15.99, popular: true },
];

export function F1CurrencyDisplay() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currency, isLoading } = useF1Currency();
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      toast.error("Please login to purchase");
      navigate('/auth');
      return;
    }

    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-f1-currency-checkout",
        { body: { packageType: packageId } }
      );

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      toast.error("Failed to start purchase");
      console.error(error);
    } finally {
      setPurchasing(false);
    }
  };

  if (isLoading && user) {
    return <div className="h-16 bg-cyan-950/20 animate-pulse rounded-xl border border-cyan-500/20" />;
  }

  const displayCoins = user ? (currency?.coins || 0) : 500;
  const displayGems = user ? (currency?.gems || 0) : 50;

  const handleBuyClick = () => {
    if (!user) {
      toast.error("Please login to purchase");
      navigate('/auth');
      return;
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"F1 Currency Display - How it works"} steps={[{ title: 'Open', desc: 'Access the F1 Currency Display section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in F1 Currency Display.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-r from-slate-900/90 via-cyan-950/40 to-slate-900/90 backdrop-blur-sm"
    >
      {/* Animated scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
      </div>

      <div className="relative flex flex-wrap items-center gap-3 sm:gap-6 p-3 sm:p-4">
        {/* HUD Label */}
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-cyan-400/60 font-mono">
          <Zap className="h-3 w-3" />
          <span>Resources</span>
        </div>

        {/* Coins */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="relative">
            <Coins className="h-5 w-5 text-amber-400" />
            <div className="absolute -inset-1 bg-amber-400/20 rounded-full blur-sm" />
          </div>
          <span className="font-mono font-bold text-lg text-amber-300">{displayCoins.toLocaleString()}</span>
          <span className="text-amber-400/60 text-xs uppercase tracking-wider">Coins</span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />

        {/* Gems */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
          <div className="relative">
            <Gem className="h-5 w-5 text-violet-400" />
            <div className="absolute -inset-1 bg-violet-400/20 rounded-full blur-sm" />
          </div>
          <span className="font-mono font-bold text-lg text-violet-300">{displayGems.toLocaleString()}</span>
          <span className="text-violet-400/60 text-xs uppercase tracking-wider">Gems</span>
        </div>

        {/* Buy Button */}
        {user ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="ml-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/30 shadow-lg shadow-cyan-500/20 font-mono uppercase tracking-wider text-xs"
              >
                <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                Acquire
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-slate-950/95 border-cyan-500/30 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="text-cyan-300 font-mono uppercase tracking-wider flex items-center gap-2">
                  <Zap className="h-5 w-5 text-cyan-400" />
                  Resource Acquisition Center
                </DialogTitle>
                <DialogDescription className="text-cyan-400/60">
                  Select a resource package to enhance your racing capabilities
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {packages.map((pkg) => (
                  <motion.div
                    key={pkg.id}
                    whileHover={{ scale: 1.02 }}
                    className={`relative p-4 rounded-xl border transition-all duration-300 ${
                      pkg.popular 
                        ? "bg-gradient-to-b from-cyan-950/50 to-blue-950/50 border-cyan-400/50 shadow-lg shadow-cyan-500/10" 
                        : "bg-slate-900/50 border-cyan-500/20 hover:border-cyan-500/40"
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-cyan-500 text-[10px] font-mono uppercase tracking-wider text-white rounded-full">
                        Popular
                      </div>
                    )}
                    <h3 className="font-mono font-bold text-sm text-white">{pkg.name}</h3>
                    <div className="flex flex-col gap-1 mt-2 text-sm">
                      {pkg.coins > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Coins className="h-3.5 w-3.5 text-amber-400" />
                          <span className="text-amber-300 font-mono">{pkg.coins}</span>
                        </div>
                      )}
                      {pkg.gems > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Gem className="h-3.5 w-3.5 text-violet-400" />
                          <span className="text-violet-300 font-mono">{pkg.gems}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      className="w-full mt-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/20 font-mono text-xs"
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={purchasing}
                    >
                      €{pkg.price}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button 
            size="sm" 
            className="ml-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/30 font-mono uppercase tracking-wider text-xs"
            onClick={handleBuyClick}
          >
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            Acquire
          </Button>
        )}
      </div>
    </motion.div>
    </>
  );
}
