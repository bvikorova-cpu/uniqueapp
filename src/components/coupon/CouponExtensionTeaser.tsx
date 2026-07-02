import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Chrome, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function CouponExtensionTeaser() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);

  const join = async () => {
    if (!email.includes("@")) { toast.error("Enter a valid email"); return; }
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    const browser = navigator.userAgent.includes("Chrome") ? "chrome" :
      navigator.userAgent.includes("Firefox") ? "firefox" : "other";
    const { error } = await supabase.from("coupon_extension_waitlist" as any).insert({
      email, user_id: user?.id ?? null, browser,
    });
    setBusy(false);
    if (error && !error.message.includes("duplicate")) {
      toast.error(error.message); return;
    }
    setJoined(true);
    toast.success("You're on the waitlist!");
  };

  return (
    <>
      <FloatingHowItWorks title={"Coupon Extension Teaser - How it works"} steps={[{ title: 'Open', desc: 'Access the Coupon Extension Teaser section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coupon Extension Teaser.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-5 space-y-3 border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-pink-500/5 to-purple-500/10">
      <div className="flex items-center gap-2">
        <Chrome className="w-5 h-5 text-orange-500" />
        <h3 className="font-bold">Browser Extension <span className="text-xs text-muted-foreground">(Coming soon)</span></h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Auto-apply the best coupon at checkout on 10,000+ stores. Join the waitlist for early access + 50 free credits.
      </p>
      {!joined ? (
        <div className="flex gap-2">
          <Input placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          <Button onClick={join} disabled={busy} className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Notify me
          </Button>
        </div>
      ) : (
        <div className="text-sm text-emerald-500 font-bold">✓ You're on the list!</div>
      )}
    </Card>
    </>
  );
}
