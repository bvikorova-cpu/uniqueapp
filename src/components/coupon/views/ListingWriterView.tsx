import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CouponToolLayout } from "../CouponToolLayout";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function ListingWriterView({ onBack }: Props) {
  const [storeName, setStoreName] = useState("");
  const [couponType, setCouponType] = useState("");
  const [originalValue, setOriginalValue] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [details, setDetails] = useState("");
  const [terms, setTerms] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!storeName.trim()) { toast.error("Enter store name"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("coupon-ai", {
        body: { action: "listing-writer", storeName, couponType, originalValue, sellingPrice, expiryDate, details, terms },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success(`Listing written! (${data.credits_used} credits used)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Listing Writer View - How it works"} steps={[{ title: 'Open', desc: 'Access the Listing Writer View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Listing Writer View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <CouponToolLayout onBack={onBack} title="AI Listing Writer" subtitle="Write compelling coupon listing descriptions that sell fast" credits={3} icon={Wand2} gradientFrom="#8b5cf6" gradientTo="#ec4899" borderColor="violet" formTitle="Coupon Info" resultTitle="Your Listing" emptyText="Enter coupon details to get a professionally written listing" result={result} loading={loading}>
      <div><label className="text-sm font-semibold mb-1.5 block">Store Name *</label><Input placeholder="e.g., Amazon" value={storeName} onChange={e => setStoreName(e.target.value)} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Coupon Type</label>
        <Select value={couponType} onValueChange={setCouponType}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>
          <SelectItem value="discount_code">Discount Code</SelectItem><SelectItem value="gift_card">Gift Card</SelectItem><SelectItem value="voucher">Voucher</SelectItem><SelectItem value="cashback">Cashback</SelectItem><SelectItem value="bogo">Buy One Get One</SelectItem>
        </SelectContent></Select></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-semibold mb-1.5 block">Original Value (€)</label><Input type="number" placeholder="50" value={originalValue} onChange={e => setOriginalValue(e.target.value)} /></div>
        <div><label className="text-sm font-semibold mb-1.5 block">Selling Price (€)</label><Input type="number" placeholder="35" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} /></div>
      </div>
      <div><label className="text-sm font-semibold mb-1.5 block">Expiry Date</label><Input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Details</label><Textarea placeholder="What the coupon is for, restrictions..." value={details} onChange={e => setDetails(e.target.value)} rows={2} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Terms & Conditions</label><Input placeholder="Any specific terms..." value={terms} onChange={e => setTerms(e.target.value)} /></div>
      <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-violet-500 to-pink-600 hover:from-violet-600 hover:to-pink-700 text-white shadow-lg">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Writing...</> : <><Wand2 className="w-4 h-4 mr-2" />Write Listing (3 CR)</>}
      </Button>
    </CouponToolLayout>
    </>
  );
}
