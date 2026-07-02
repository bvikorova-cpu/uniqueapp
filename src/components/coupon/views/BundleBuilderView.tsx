import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Package, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CouponToolLayout } from "../CouponToolLayout";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function BundleBuilderView({ onBack }: Props) {
  const [availableCoupons, setAvailableCoupons] = useState("");
  const [budget, setBudget] = useState("");
  const [targetCategory, setTargetCategory] = useState("");
  const [occasion, setOccasion] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!availableCoupons.trim()) { toast.error("Enter available coupons"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("coupon-ai", {
        body: { action: "bundle-builder", availableCoupons, budget, targetCategory, occasion },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success(`Bundle strategy ready! (${data.credits_used} credits used)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Bundle Builder View - How it works"} steps={[{ title: 'Open', desc: 'Access the Bundle Builder View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Bundle Builder View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <CouponToolLayout onBack={onBack} title="Coupon Bundle Builder" subtitle="AI-optimized bundle deals for maximum savings & resale value" credits={4} icon={Package} gradientFrom="#3b82f6" gradientTo="#06b6d4" borderColor="blue" formTitle="Bundle Parameters" resultTitle="Bundle Strategy" emptyText="Enter coupons to get AI-optimized bundle recommendations" result={result} loading={loading}>
      <div><label className="text-sm font-semibold mb-1.5 block">Available Coupons *</label>
        <Textarea placeholder="List coupons to bundle. E.g.:&#10;Nike €30 gift card&#10;Adidas 25% off&#10;Foot Locker €20 voucher" value={availableCoupons} onChange={e => setAvailableCoupons(e.target.value)} rows={5} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Budget (€)</label>
        <Input type="number" placeholder="e.g., 100" value={budget} onChange={e => setBudget(e.target.value)} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Target Category</label>
        <Input placeholder="e.g., Fashion, Food, Electronics" value={targetCategory} onChange={e => setTargetCategory(e.target.value)} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Occasion (optional)</label>
        <Input placeholder="e.g., Birthday gift, Holiday shopping" value={occasion} onChange={e => setOccasion(e.target.value)} /></div>
      <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Building...</> : <><Package className="w-4 h-4 mr-2" />Build Bundle (4 CR)</>}
      </Button>
    </CouponToolLayout>
    </>
  );
}
