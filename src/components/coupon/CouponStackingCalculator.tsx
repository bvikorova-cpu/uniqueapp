import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calculator, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useCouponStacking } from "@/hooks/useCouponStacking";
import { useCouponCompare } from "@/hooks/useCouponCompare";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function CouponStackingCalculator() {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null)); }, []);
  const { ids } = useCouponCompare(userId);
  const { loading, result, calculate } = useCouponStacking();

  return (
    <>
      <FloatingHowItWorks title={"Coupon Stacking Calculator - How it works"} steps={[{ title: 'Open', desc: 'Access the Coupon Stacking Calculator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coupon Stacking Calculator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-4 space-y-3 border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5">
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-primary" />
        <h3 className="font-bold">Coupon Stacking Calculator</h3>
        <span className="text-xs text-muted-foreground ml-auto">3 AI credits</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Add coupons via Compare widget, then calculate the best stack.
      </p>
      <Button
        size="sm"
        disabled={loading || ids.length < 2}
        onClick={() => calculate(ids)}
        className="w-full gap-1.5"
      >
        <Sparkles className="w-3.5 h-3.5" />
        {loading ? "Calculating…" : `Calculate (${ids.length} coupons)`}
      </Button>
      {result?.result && (
        <div className="text-xs space-y-1 p-3 rounded-lg bg-background/60 border">
          <div className="font-bold">Final price: €{result.result.final_price}</div>
          <div className="text-emerald-500">Saved: €{result.result.total_savings}</div>
          {result.result.warnings?.map((w: string, i: number) => (
            <div key={i} className="text-amber-500">⚠ {w}</div>
          ))}
        </div>
      )}
    </Card>
    </>
  );
}
