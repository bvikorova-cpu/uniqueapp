import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CouponToolLayout } from "../CouponToolLayout";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function CouponValuatorView({ onBack }: Props) {
  const [storeName, setStoreName] = useState("");
  const [couponType, setCouponType] = useState("");
  const [originalValue, setOriginalValue] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!storeName.trim()) { toast.error("Enter store name"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("coupon-ai", {
        body: { action: "coupon-valuator", storeName, couponType, originalValue, askingPrice, expiryDate, description },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success(`Valuation ready! (${data.credits_used} credits used)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Coupon Valuator View - How it works"} steps={[{ title: 'Open', desc: 'Access the Coupon Valuator View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coupon Valuator View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <CouponToolLayout onBack={onBack} title="AI Coupon Valuator" subtitle="Get fair market price & expiry risk analysis for any coupon" credits={3} icon={DollarSign} gradientFrom="#9333ea" gradientTo="#f59e0b" borderColor="purple" formTitle="Coupon Details" resultTitle="Valuation Report" emptyText="Enter coupon details to get a fair market valuation" result={result} loading={loading}>
      <div><label className="text-sm font-semibold mb-1.5 block">Store Name *</label><Input placeholder="e.g., Nike, Amazon, Starbucks" value={storeName} onChange={e => setStoreName(e.target.value)} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Coupon Type</label>
        <Select value={couponType} onValueChange={setCouponType}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>
          <SelectItem value="discount_code">Discount Code</SelectItem><SelectItem value="gift_card">Gift Card</SelectItem><SelectItem value="voucher">Voucher</SelectItem><SelectItem value="cashback">Cashback</SelectItem><SelectItem value="bogo">Buy One Get One</SelectItem>
        </SelectContent></Select></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-semibold mb-1.5 block">Original Value (€)</label><Input type="number" placeholder="e.g., 50" value={originalValue} onChange={e => setOriginalValue(e.target.value)} /></div>
        <div><label className="text-sm font-semibold mb-1.5 block">Asking Price (€)</label><Input type="number" placeholder="e.g., 35" value={askingPrice} onChange={e => setAskingPrice(e.target.value)} /></div>
      </div>
      <div><label className="text-sm font-semibold mb-1.5 block">Expiry Date</label><Input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Description</label><Textarea placeholder="Any details about the coupon..." value={description} onChange={e => setDescription(e.target.value)} rows={2} /></div>
      <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white shadow-lg">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><DollarSign className="w-4 h-4 mr-2" />Get Valuation (3 CR)</>}
      </Button>
    </CouponToolLayout>
    </>
  );
}
