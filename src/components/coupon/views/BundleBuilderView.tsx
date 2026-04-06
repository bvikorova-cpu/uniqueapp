import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

export function BundleBuilderView({ onBack }: Props) {
  const [availableCoupons, setAvailableCoupons] = useState("");
  const [budget, setBudget] = useState("");
  const [targetCategory, setTargetCategory] = useState("");
  const [occasion, setOccasion] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Coupon Bundle Builder</h2>
            <p className="text-muted-foreground text-sm">AI-optimized bundle deals for maximum savings · 4 CR</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />4 Credits
          </Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-blue-500/10">
          <CardHeader><CardTitle>Bundle Parameters</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-semibold mb-1.5 block">Available Coupons *</label>
              <Textarea placeholder="List coupons to bundle. E.g.:&#10;Nike €30 gift card&#10;Adidas 25% off&#10;Foot Locker €20 voucher" value={availableCoupons} onChange={e => setAvailableCoupons(e.target.value)} rows={5} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Budget (€)</label>
              <Input type="number" placeholder="e.g., 100" value={budget} onChange={e => setBudget(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Target Category</label>
              <Input placeholder="e.g., Fashion, Food, Electronics" value={targetCategory} onChange={e => setTargetCategory(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Occasion (optional)</label>
              <Input placeholder="e.g., Birthday gift, Holiday shopping" value={occasion} onChange={e => setOccasion(e.target.value)} /></div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Building...</> : <><Package className="w-4 h-4 mr-2" />Build Bundle (4 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className={result ? "border-blue-500/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Bundle Strategy" : "Results"}</CardTitle>
            {result && <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}</Button>}
          </CardHeader>
          <CardContent>{result ? <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-xl p-5 border">{result}</div> : <p className="text-muted-foreground text-sm text-center py-12">Enter coupons to get AI-optimized bundle recommendations</p>}</CardContent>
        </Card>
      </div>
    </div>
  );
}
