import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CouponToolLayout } from "../CouponToolLayout";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function PriceHistoryView({ onBack }: Props) {
  const [storeName, setStoreName] = useState("");
  const [couponType, setCouponType] = useState("");
  const [originalValue, setOriginalValue] = useState("");
  const [timeframe, setTimeframe] = useState("3months");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!storeName.trim()) { toast.error("Enter store name"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("coupon-ai", {
        body: { action: "price-history", storeName, couponType, originalValue, timeframe },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success(`Price analysis ready! (${data.credits_used} credits used)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Price History View - How it works"} steps={[{ title: 'Open', desc: 'Access the Price History View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Price History View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <CouponToolLayout onBack={onBack} title="Price History Charts" subtitle="Market price trends & optimal buy/sell timing analysis" credits={3} icon={TrendingUp} gradientFrom="#22c55e" gradientTo="#059669" borderColor="green" formTitle="Price Analysis Parameters" resultTitle="Price Trend Report" emptyText="Enter details to get price history analysis and trends" result={result} loading={loading}>
      <div><label className="text-sm font-semibold mb-1.5 block">Store Name *</label>
        <Input placeholder="e.g., Nike, Amazon, Sephora" value={storeName} onChange={e => setStoreName(e.target.value)} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Coupon Type</label>
        <Select value={couponType} onValueChange={setCouponType}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>
          <SelectItem value="discount_code">Discount Code</SelectItem><SelectItem value="gift_card">Gift Card</SelectItem><SelectItem value="voucher">Voucher</SelectItem><SelectItem value="cashback">Cashback</SelectItem>
        </SelectContent></Select></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Face Value (€)</label>
        <Input type="number" placeholder="e.g., 100" value={originalValue} onChange={e => setOriginalValue(e.target.value)} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Analysis Timeframe</label>
        <Select value={timeframe} onValueChange={setTimeframe}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
          <SelectItem value="1month">Last Month</SelectItem><SelectItem value="3months">Last 3 Months</SelectItem><SelectItem value="6months">Last 6 Months</SelectItem><SelectItem value="1year">Last Year</SelectItem>
        </SelectContent></Select></div>
      <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><TrendingUp className="w-4 h-4 mr-2" />Analyze Prices (3 CR)</>}
      </Button>
    </CouponToolLayout>
    </>
  );
}
