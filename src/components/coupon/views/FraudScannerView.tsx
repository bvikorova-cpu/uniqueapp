import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CouponToolLayout } from "../CouponToolLayout";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function FraudScannerView({ onBack }: Props) {
  const [title, setTitle] = useState("");
  const [storeName, setStoreName] = useState("");
  const [originalValue, setOriginalValue] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [description, setDescription] = useState("");
  const [sellerInfo, setSellerInfo] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const discount = originalValue && sellingPrice ? Math.round(((parseFloat(originalValue) - parseFloat(sellingPrice)) / parseFloat(originalValue)) * 100) : 0;

  const generate = async () => {
    if (!title.trim()) { toast.error("Enter listing title"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("coupon-ai", {
        body: { action: "fraud-scanner", title, storeName, originalValue, sellingPrice, discount: discount.toString(), description, sellerInfo },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success(`Fraud scan complete! (${data.credits_used} credits used)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Fraud Scanner View - How it works"} steps={[{ title: 'Open', desc: 'Access the Fraud Scanner View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Fraud Scanner View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <CouponToolLayout onBack={onBack} title="AI Fraud Scanner" subtitle="Detect fake coupons, expired codes & scam patterns instantly" credits={4} icon={ShieldAlert} gradientFrom="#ef4444" gradientTo="#f97316" borderColor="red" formTitle="Listing to Scan" resultTitle="Fraud Analysis" emptyText="Paste a suspicious listing to get AI fraud analysis" result={result} loading={loading}>
      <div><label className="text-sm font-semibold mb-1.5 block">Listing Title *</label><Input placeholder="e.g., 50% off Nike - Too Good?" value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Store Name</label><Input placeholder="e.g., Nike" value={storeName} onChange={e => setStoreName(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-semibold mb-1.5 block">Original Value (€)</label><Input type="number" placeholder="100" value={originalValue} onChange={e => setOriginalValue(e.target.value)} /></div>
        <div><label className="text-sm font-semibold mb-1.5 block">Selling Price (€)</label><Input type="number" placeholder="30" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} /></div>
      </div>
      {discount > 0 && <p className="text-sm text-muted-foreground">Discount: <span className="font-bold text-primary">{discount}%</span></p>}
      <div><label className="text-sm font-semibold mb-1.5 block">Description</label><Textarea placeholder="Paste the listing description..." value={description} onChange={e => setDescription(e.target.value)} rows={3} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Seller Info (optional)</label><Input placeholder="Account age, reviews..." value={sellerInfo} onChange={e => setSellerInfo(e.target.value)} /></div>
      <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-lg">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Scanning...</> : <><ShieldAlert className="w-4 h-4 mr-2" />Scan for Fraud (4 CR)</>}
      </Button>
    </CouponToolLayout>
    </>
  );
}
