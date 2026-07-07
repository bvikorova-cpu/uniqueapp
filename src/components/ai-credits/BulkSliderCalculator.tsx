import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

// Tier pricing per credit (€)
function pricePerCredit(qty: number): number {
  if (qty >= 500) return 0.22;
  if (qty >= 200) return 0.27;
  if (qty >= 100) return 0.30;
  if (qty >= 50) return 0.35;
  if (qty >= 20) return 0.42;
  return 0.50;
}

export function BulkSliderCalculator() {
  const [qty, setQty] = useState(100);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { perCredit, total, savings } = useMemo(() => {
    const pc = pricePerCredit(qty);
    const t = Math.round(qty * pc * 100) / 100;
    const baseline = qty * 0.5;
    const sv = Math.round(((baseline - t) / baseline) * 100);
    return { perCredit: pc, total: t, savings: sv };
  }, [qty]);

  const buy = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Sign in required", description: "Please sign in to purchase credits.", variant: "destructive" });
        window.location.href = `/auth?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          product: "ai_credits",
          amount: Math.round(total * 100),
          productName: `${qty} AI Credits (custom)`,
          mode: "payment",
          metadata: { credits: String(qty) },
          successUrl: `${window.location.origin}/ai-credits-store?payment=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/ai-credits-store?payment=canceled`,
        },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Bulk Slider Calculator - How it works"} steps={[{ title: 'Open', desc: 'Access the Bulk Slider Calculator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Bulk Slider Calculator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="max-w-5xl mx-auto mb-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle>Build your custom pack</CardTitle>
        </div>
        <CardDescription>Slide to choose any amount. Bigger = cheaper per credit.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Slider value={[qty]} onValueChange={(v) => setQty(v[0])} min={10} max={1000} step={10} />
        <div className="grid grid-cols-3 gap-2 text-center">
          <div><p className="text-2xl font-black">{qty}</p><p className="text-xs text-muted-foreground">credits</p></div>
          <div><p className="text-2xl font-black">€{total}</p><p className="text-xs text-muted-foreground">€{perCredit}/credit</p></div>
          <div><p className="text-2xl font-black text-emerald-500">{savings > 0 ? `−${savings}%` : "—"}</p><p className="text-xs text-muted-foreground">saved</p></div>
        </div>
        <Button className="w-full" disabled={loading} onClick={buy}>
          {loading ? "Preparing..." : `Buy ${qty} credits for €${total}`}
        </Button>
      </CardContent>
    </Card>
    </>
  );
}
