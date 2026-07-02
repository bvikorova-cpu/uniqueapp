import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bell, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CouponToolLayout } from "../CouponToolLayout";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function ExpiryAlertView({ onBack }: Props) {
  const [coupons, setCoupons] = useState("");
  const [notifyDays, setNotifyDays] = useState("7");
  const [shoppingHabits, setShoppingHabits] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!coupons.trim()) { toast.error("Enter your coupon details"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("coupon-ai", {
        body: { action: "expiry-alert", coupons, notifyDays, shoppingHabits },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success(`Alert analysis ready! (${data.credits_used} credits used)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Expiry Alert View - How it works"} steps={[{ title: 'Open', desc: 'Access the Expiry Alert View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Expiry Alert View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <CouponToolLayout onBack={onBack} title="AI Expiry Alert System" subtitle="Smart expiry tracking & usage recommendations before coupons expire" credits={3} icon={Bell} gradientFrom="#ef4444" gradientTo="#eab308" borderColor="red" formTitle="Your Coupons" resultTitle="Expiry Alert Report" emptyText="Enter your coupons to get expiry alerts and usage strategies" result={result} loading={loading}>
      <div><label className="text-sm font-semibold mb-1.5 block">Coupon Details *</label>
        <Textarea placeholder="List your coupons with store names, values, and expiry dates. E.g.:&#10;Nike - €50 gift card - expires May 15&#10;Amazon - 20% off - expires April 30&#10;Starbucks - €25 voucher - no expiry" value={coupons} onChange={e => setCoupons(e.target.value)} rows={6} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Alert Window (days before expiry)</label>
        <Input type="number" placeholder="7" value={notifyDays} onChange={e => setNotifyDays(e.target.value)} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Shopping Habits (optional)</label>
        <Textarea placeholder="What do you usually shop for? How often?" value={shoppingHabits} onChange={e => setShoppingHabits(e.target.value)} rows={2} /></div>
      <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-white shadow-lg">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><Bell className="w-4 h-4 mr-2" />Analyze Expiry Risk (3 CR)</>}
      </Button>
    </CouponToolLayout>
    </>
  );
}
