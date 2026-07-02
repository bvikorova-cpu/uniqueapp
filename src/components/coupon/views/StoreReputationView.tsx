import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CouponToolLayout } from "../CouponToolLayout";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function StoreReputationView({ onBack }: Props) {
  const [storeName, setStoreName] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [couponTypes, setCouponTypes] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!storeName.trim()) { toast.error("Enter store name"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("coupon-ai", {
        body: { action: "store-reputation", storeName, storeUrl, couponTypes, additionalInfo },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success(`Reputation report ready! (${data.credits_used} credits used)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Store Reputation View - How it works"} steps={[{ title: 'Open', desc: 'Access the Store Reputation View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Store Reputation View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <CouponToolLayout onBack={onBack} title="Store Reputation Score" subtitle="AI trust & reliability analysis for any retail store" credits={3} icon={Building2} gradientFrom="#f59e0b" gradientTo="#ea580c" borderColor="amber" formTitle="Store Details" resultTitle="Reputation Report" emptyText="Enter a store name to get AI reputation analysis" result={result} loading={loading}>
      <div><label className="text-sm font-semibold mb-1.5 block">Store Name *</label>
        <Input placeholder="e.g., Nike, Amazon, Shein" value={storeName} onChange={e => setStoreName(e.target.value)} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Store Website (optional)</label>
        <Input placeholder="e.g., nike.com" value={storeUrl} onChange={e => setStoreUrl(e.target.value)} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Coupon Types Available</label>
        <Input placeholder="e.g., Gift cards, discount codes, vouchers" value={couponTypes} onChange={e => setCouponTypes(e.target.value)} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Additional Info</label>
        <Textarea placeholder="Any specific concerns or things to check?" value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)} rows={2} /></div>
      <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><Building2 className="w-4 h-4 mr-2" />Get Reputation Score (3 CR)</>}
      </Button>
    </CouponToolLayout>
    </>
  );
}
