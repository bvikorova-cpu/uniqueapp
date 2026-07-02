import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CREDIT_PACKAGES } from "@/hooks/useSecretSanta";
import { CreditCard, Sparkles, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
    <>
      <FloatingHowItWorks title={"Secret Santa Credits - How it works"} steps={[{ title: 'Open', desc: 'Access the Secret Santa Credits section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Secret Santa Credits.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-6 text-center shadow-lg">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center shadow-sm">
          <CreditCard className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Get More Credits</h2>
        <p className="text-gray-500">
          Purchase credits to send amazing gifts to your friends
        </p>
      </div>

      {/* Credit packages */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {CREDIT_PACKAGES.map((pkg) => (
          <div
            key={pkg.credits}
            className={`relative overflow-hidden rounded-2xl p-5 border transition-all hover:scale-[1.02] shadow-lg ${
              pkg.bestValue
                ? "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-amber-400"
                : pkg.popular
                ? "bg-gradient-to-br from-rose-50 to-pink-50 border-rose-300"
                : "bg-white border-gray-200 hover:border-amber-300"
            }`}
          >
            {/* Badge */}
            {(pkg.bestValue || pkg.popular) && (
              <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold ${
                pkg.bestValue
                  ? "bg-amber-500 text-white"
                  : "bg-rose-500 text-white"
              }`}>
                {pkg.bestValue ? "BEST VALUE" : "POPULAR"}
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-gray-800 font-semibold text-lg">{pkg.label}</h3>
            </div>

            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-bold text-amber-600">💎 {pkg.credits}</span>
              <span className="text-gray-400 text-sm mb-1">credits</span>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-800">€{pkg.price}</span>
              <span className="text-gray-400 text-sm ml-1">
                (€{(pkg.price / pkg.credits).toFixed(2)}/credit)
              </span>
            </div>

            {/* Features */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>Instant delivery</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>Never expires</span>
              </div>
              {pkg.credits >= 100 && (
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Exclusive gifts unlocked</span>
                </div>
              )}
            </div>

            <Button
              onClick={() => handlePurchase(pkg.credits, pkg.price)}
              disabled={loadingPackage !== null}
              className={`w-full py-5 font-bold rounded-xl ${
                pkg.bestValue
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200"
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
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl" />
                <div className="absolute -top-10 -left-10 w-24 h-24 bg-yellow-200/30 rounded-full blur-2xl" />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-4 text-center shadow-sm">
        <p className="text-gray-500 text-sm">
          💳 Secure payment via Stripe • All payments in EUR
        </p>
      </div>
    </div>
    </>
  );
};
