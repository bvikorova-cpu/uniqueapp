import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

export function StoreReputationView({ onBack }: Props) {
  const [storeName, setStoreName] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [couponTypes, setCouponTypes] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
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
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Store Reputation Score</h2>
            <p className="text-muted-foreground text-sm">AI trust & reliability analysis for stores · 3 CR</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />3 Credits
          </Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-amber-500/10">
          <CardHeader><CardTitle>Store Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-semibold mb-1.5 block">Store Name *</label>
              <Input placeholder="e.g., Nike, Amazon, Shein" value={storeName} onChange={e => setStoreName(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Store Website (optional)</label>
              <Input placeholder="e.g., nike.com" value={storeUrl} onChange={e => setStoreUrl(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Coupon Types Available</label>
              <Input placeholder="e.g., Gift cards, discount codes, vouchers" value={couponTypes} onChange={e => setCouponTypes(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Additional Info</label>
              <Textarea placeholder="Any specific concerns or things to check?" value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)} rows={2} /></div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><Building2 className="w-4 h-4 mr-2" />Get Reputation Score (3 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className={result ? "border-amber-500/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Reputation Report" : "Results"}</CardTitle>
            {result && <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}</Button>}
          </CardHeader>
          <CardContent>{result ? <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-xl p-5 border">{result}</div> : <p className="text-muted-foreground text-sm text-center py-12">Enter a store name to get AI reputation analysis</p>}</CardContent>
        </Card>
      </div>
    </div>
  );
}
