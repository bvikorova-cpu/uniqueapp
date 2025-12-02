import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CREDIT_PACKAGES } from "@/hooks/useSecretSanta";
import { CreditCard, Sparkles, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const SecretSantaCredits = () => {
  const { toast } = useToast();
  const [loadingPackage, setLoadingPackage] = useState<number | null>(null);

  const handlePurchase = async (credits: number, price: number) => {
    setLoadingPackage(credits);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-secret-santa-payment", {
        body: { credits, price },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      toast({
        title: "Failed to start payment",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoadingPackage(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/30 to-yellow-500/30 flex items-center justify-center">
          <CreditCard className="h-8 w-8 text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Get More Credits</h2>
        <p className="text-white/60">
          Purchase credits to send amazing gifts to your friends
        </p>
      </div>

      {/* Credit packages */}
      <div className="grid gap-4 sm:grid-cols-2">
        {CREDIT_PACKAGES.map((pkg) => (
          <div
            key={pkg.credits}
            className={`relative overflow-hidden rounded-2xl p-5 border transition-all hover:scale-[1.02] ${
              pkg.bestValue
                ? "bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-orange-500/20 border-amber-500/50"
                : pkg.popular
                ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/40"
                : "bg-white/5 border-white/10 hover:border-white/20"
            }`}
          >
            {/* Badge */}
            {(pkg.bestValue || pkg.popular) && (
              <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold ${
                pkg.bestValue
                  ? "bg-amber-500 text-black"
                  : "bg-purple-500 text-white"
              }`}>
                {pkg.bestValue ? "BEST VALUE" : "POPULAR"}
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-white font-semibold text-lg">{pkg.label}</h3>
            </div>

            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-bold text-amber-300">💎 {pkg.credits}</span>
              <span className="text-white/40 text-sm mb-1">credits</span>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold text-white">€{pkg.price}</span>
              <span className="text-white/40 text-sm ml-1">
                (€{(pkg.price / pkg.credits).toFixed(2)}/credit)
              </span>
            </div>

            {/* Features */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Check className="h-4 w-4 text-green-400" />
                <span>Instant delivery</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Check className="h-4 w-4 text-green-400" />
                <span>Never expires</span>
              </div>
              {pkg.credits >= 100 && (
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Exclusive gifts unlocked</span>
                </div>
              )}
            </div>

            <Button
              onClick={() => handlePurchase(pkg.credits, pkg.price)}
              disabled={loadingPackage !== null}
              className={`w-full py-5 font-bold rounded-xl ${
                pkg.bestValue
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
              }`}
            >
              {loadingPackage === pkg.credits ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                `Buy for €${pkg.price}`
              )}
            </Button>

            {/* Decorative */}
            {pkg.bestValue && (
              <>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />
                <div className="absolute -top-10 -left-10 w-24 h-24 bg-yellow-500/20 rounded-full blur-2xl" />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
        <p className="text-white/50 text-sm">
          💳 Secure payment via Stripe • All payments in EUR
        </p>
      </div>
    </div>
  );
};
