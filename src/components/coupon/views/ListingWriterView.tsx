import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Wand2, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
  const [copied, setCopied] = useState(false);

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
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Listing Writer</h2>
            <p className="text-muted-foreground text-sm">Write compelling coupon descriptions · 3 CR</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-violet-500 to-pink-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />3 Credits
          </Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-violet-500/10">
          <CardHeader><CardTitle>Coupon Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
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
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-violet-500 to-pink-600 hover:from-violet-600 hover:to-pink-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Writing...</> : <><Wand2 className="w-4 h-4 mr-2" />Write Listing (3 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className={result ? "border-violet-500/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Your Listing" : "Results"}</CardTitle>
            {result && <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}</Button>}
          </CardHeader>
          <CardContent>{result ? <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-xl p-5 border">{result}</div> : <p className="text-muted-foreground text-sm text-center py-12">Enter coupon details to get a professionally written listing</p>}</CardContent>
        </Card>
      </div>
    </div>
  );
}
