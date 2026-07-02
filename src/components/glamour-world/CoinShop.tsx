import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Coins, Loader2, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const packages = [
  { coins: 50, price: 4.99, label: "Starter Pack", popular: false },
  { coins: 150, price: 9.99, label: "Glamour Pack", popular: true },
  { coins: 350, price: 19.99, label: "Princess Pack", popular: false },
  { coins: 800, price: 39.99, label: "Royal Pack", popular: false },
  { coins: 2000, price: 79.99, label: "Queen Pack", popular: false },
];

export function CoinShop({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<number | null>(null);

  const { data: balance } = useQuery({
    queryKey: ["glamour-coins"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;
      const { data } = await supabase.from("glamour_coins").select("balance").eq("user_id", user.id).maybeSingle();
      return data?.balance || 0;
    },
  });

  const purchase = async (pkg: typeof packages[0], idx: number) => {
    setLoading(idx);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          productName: `Glamour World - ${pkg.label}`,
          amount: Math.round(pkg.price * 100),
          successUrl: `${window.location.origin}/glamour-world?payment=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/glamour-world?payment=canceled`,
          metadata: { type: "glamour_coins", coins: pkg.coins },
        },
      });
      if (error) throw error;
      if (data?.url) {
        // Use direct navigation — mobile WebViews block window.open popups
        window.location.href = data.url;
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(null); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Coin Shop - How it works"} steps={[{ title: 'Open', desc: 'Access the Coin Shop section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coin Shop.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <div className="text-center">
        <h2 className="text-2xl font-black">💰 Coin Shop</h2>
        <p className="text-muted-foreground">Buy coins to unlock all AI features</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/30 rounded-full px-6 py-3">
          <Coins className="h-5 w-5 text-pink-400" />
          <span className="text-xl font-black">{balance || 0}</span>
          <span className="text-sm text-muted-foreground">coins</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg, idx) => (
          <div key={idx} className={`relative bg-gradient-to-br from-pink-500/10 to-purple-500/10 border ${pkg.popular ? "border-pink-400" : "border-pink-400/20"} rounded-xl p-6 text-center`}>
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
            )}
            <Crown className="h-8 w-8 text-pink-400 mx-auto mb-2" />
            <p className="font-bold text-lg">{pkg.label}</p>
            <p className="text-3xl font-black text-pink-400 my-2">{pkg.coins}</p>
            <p className="text-xs text-muted-foreground mb-4">coins</p>
            <Button onClick={() => purchase(pkg, idx)} disabled={loading !== null} className="w-full bg-gradient-to-r from-pink-500 to-purple-500">
              {loading === idx ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              €{pkg.price}
            </Button>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
