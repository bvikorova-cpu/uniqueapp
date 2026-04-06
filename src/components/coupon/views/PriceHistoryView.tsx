import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

export function PriceHistoryView({ onBack }: Props) {
  const [storeName, setStoreName] = useState("");
  const [couponType, setCouponType] = useState("");
  const [originalValue, setOriginalValue] = useState("");
  const [timeframe, setTimeframe] = useState("3months");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Price History Charts</h2>
            <p className="text-muted-foreground text-sm">Market price trends & optimal timing analysis · 3 CR</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />3 Credits
          </Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-green-500/10">
          <CardHeader><CardTitle>Price Analysis Parameters</CardTitle></CardHeader>
          <CardContent className="space-y-4">
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
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><TrendingUp className="w-4 h-4 mr-2" />Analyze Prices (3 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className={result ? "border-green-500/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Price Trend Report" : "Results"}</CardTitle>
            {result && <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}</Button>}
          </CardHeader>
          <CardContent>{result ? <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-xl p-5 border">{result}</div> : <p className="text-muted-foreground text-sm text-center py-12">Enter details to get price history analysis and trends</p>}</CardContent>
        </Card>
      </div>
    </div>
  );
}
