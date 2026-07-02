import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function PromoCodeInput({ onApplied }: { onApplied?: () => void }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const apply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const upper = code.trim().toUpperCase();
      const { data: promo, error: pErr } = await supabase
        .from("ai_credit_promo_codes")
        .select("*")
        .eq("code", upper)
        .eq("active", true)
        .maybeSingle();
      if (pErr) throw pErr;
      if (!promo) throw new Error("Invalid or expired code");
      if (promo.expires_at && new Date(promo.expires_at) < new Date()) throw new Error("Code expired");
      if (promo.max_redemptions && promo.redemption_count >= promo.max_redemptions) throw new Error("Code fully redeemed");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");

      const { error: redErr } = await supabase.from("ai_credit_promo_redemptions").insert({
        code: upper, user_id: user.id, bonus_credits: promo.bonus_credits,
      });
      if (redErr) {
        if (redErr.code === "23505") throw new Error("You already used this code");
        throw redErr;
      }

      if (promo.bonus_credits > 0) {
        const { data: existing } = await supabase
          .from("ai_credits")
          .select("credits_remaining")
          .eq("user_id", user.id)
          .maybeSingle();
        if (existing) {
          await supabase.from("ai_credits").update({
            credits_remaining: (existing.credits_remaining || 0) + promo.bonus_credits,
          }).eq("user_id", user.id);
        } else {
          await supabase.from("ai_credits").insert({
            user_id: user.id, credits_remaining: promo.bonus_credits, total_credits_purchased: 0,
          });
        }
      }

      toast({ title: "Promo applied!", description: `+${promo.bonus_credits} bonus credits` });
      setCode("");
      onApplied?.();
    } catch (e: any) {
      toast({ title: "Couldn't apply", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Promo Code Input - How it works"} steps={[{ title: 'Open', desc: 'Access the Promo Code Input section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Promo Code Input.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="max-w-md mx-auto mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Have a promo code?</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" className="uppercase" />
          <Button onClick={apply} disabled={loading || !code}>{loading ? "..." : "Apply"}</Button>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
