import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShieldAlert, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
  const [copied, setCopied] = useState(false);

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
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Fraud Scanner</h2>
            <p className="text-muted-foreground text-sm">Detect fake coupons & scam patterns · 4 CR</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />4 Credits
          </Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-red-500/10">
          <CardHeader><CardTitle>Listing to Scan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-semibold mb-1.5 block">Listing Title *</label><Input placeholder="e.g., 50% off Nike - Too Good?" value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Store Name</label><Input placeholder="e.g., Nike" value={storeName} onChange={e => setStoreName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-semibold mb-1.5 block">Original Value (€)</label><Input type="number" placeholder="100" value={originalValue} onChange={e => setOriginalValue(e.target.value)} /></div>
              <div><label className="text-sm font-semibold mb-1.5 block">Selling Price (€)</label><Input type="number" placeholder="30" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} /></div>
            </div>
            {discount > 0 && <p className="text-sm text-muted-foreground">Discount: <span className="font-bold text-primary">{discount}%</span></p>}
            <div><label className="text-sm font-semibold mb-1.5 block">Description</label><Textarea placeholder="Paste the listing description..." value={description} onChange={e => setDescription(e.target.value)} rows={3} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Seller Info (optional)</label><Input placeholder="Account age, reviews..." value={sellerInfo} onChange={e => setSellerInfo(e.target.value)} /></div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Scanning...</> : <><ShieldAlert className="w-4 h-4 mr-2" />Scan for Fraud (4 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className={result ? "border-red-500/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Fraud Analysis" : "Results"}</CardTitle>
            {result && <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}</Button>}
          </CardHeader>
          <CardContent>{result ? <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-xl p-5 border">{result}</div> : <p className="text-muted-foreground text-sm text-center py-12">Paste a suspicious listing to get a fraud analysis</p>}</CardContent>
        </Card>
      </div>
    </div>
  );
}
