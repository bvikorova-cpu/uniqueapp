import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Coins, Gem } from "lucide-react";
import { useF1Currency } from "@/hooks/useF1Racing";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const packages = [
  { id: "coins_100", name: "100 Coins", coins: 100, gems: 0, price: 1.99 },
  { id: "coins_500", name: "500 Coins", coins: 500, gems: 0, price: 7.99 },
  { id: "coins_1000", name: "1000 Coins", coins: 1000, gems: 0, price: 14.99 },
  { id: "gems_50", name: "50 Gems", coins: 0, gems: 50, price: 4.99 },
  { id: "gems_200", name: "200 Gems", coins: 0, gems: 200, price: 14.99 },
  { id: "bundle_starter", name: "Starter Bundle", coins: 500, gems: 100, price: 9.99 },
];

export function F1CurrencyDisplay() {
  const { currency, isLoading } = useF1Currency();
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async (packageId: string) => {
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

  if (isLoading) {
    return <div className="h-12 bg-muted animate-pulse rounded-lg" />;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-red-900/50 to-black rounded-lg border border-red-500">
      <div className="flex items-center gap-2">
        <Coins className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
        <span className="font-bold text-lg sm:text-xl text-white">{currency?.coins || 0}</span>
        <span className="text-gray-300 text-sm sm:text-base">Coins</span>
      </div>

      <div className="w-px h-6 sm:h-8 bg-gray-600" />

      <div className="flex items-center gap-2">
        <Gem className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
        <span className="font-bold text-lg sm:text-xl text-white">{currency?.gems || 0}</span>
        <span className="text-gray-300 text-sm sm:text-base">Gems</span>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="default" size="sm" className="ml-auto bg-red-600 hover:bg-red-700 text-xs sm:text-sm">
            <Coins className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Buy
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl bg-black/95 border-red-500">
          <DialogHeader>
            <DialogTitle className="text-white">🏎️ F1 Racing Shop</DialogTitle>
            <DialogDescription>
              Purchase coins and gems for your F1 racing career
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-4 border border-red-500/50 rounded-lg bg-gradient-to-b from-red-900/30 to-black hover:border-red-500 transition-colors"
              >
                <h3 className="font-bold text-lg text-white">{pkg.name}</h3>
                <div className="flex flex-col gap-1 mt-2 text-sm">
                  {pkg.coins > 0 && (
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <span className="text-white">{pkg.coins} Coins</span>
                    </div>
                  )}
                  {pkg.gems > 0 && (
                    <div className="flex items-center gap-1">
                      <Gem className="h-4 w-4 text-purple-500" />
                      <span className="text-white">{pkg.gems} Gems</span>
                    </div>
                  )}
                </div>
                <Button
                  className="w-full mt-3 bg-red-600 hover:bg-red-700"
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={purchasing}
                >
                  ${pkg.price}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
