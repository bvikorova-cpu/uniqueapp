import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calculator, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function RoiCalculatorView({ onBack }: Props) {
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [budget, setBudget] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [conversionRate, setConversionRate] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!product.trim()) { toast.error("Enter product name"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }
      const { data, error } = await supabase.functions.invoke("video-ad-tools", {
        body: { action: "roi_calculator", product, price, budget, platform, conversionRate },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success(`ROI calculated! (${data.credits_used} credits)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Roi Calculator View - How it works"} steps={[{ title: 'Open', desc: 'Access the Roi Calculator View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Roi Calculator View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg"><Calculator className="w-6 h-6 text-white" /></div>
          <div><h2 className="text-2xl font-black">AI ROI Calculator</h2><p className="text-muted-foreground text-sm">Predict return on ad investment</p></div>
          <Badge className="ml-auto bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"><Sparkles className="w-3 h-3 mr-1" />2 Credits</Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>ROI Parameters</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-semibold mb-1.5 block">Product *</label><Input placeholder="e.g. Online course" value={product} onChange={e => setProduct(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-sm font-semibold mb-1.5 block">Product Price</label><Input placeholder="e.g. €99" value={price} onChange={e => setPrice(e.target.value)} /></div>
              <div><label className="text-sm font-semibold mb-1.5 block">Ad Budget</label><Input placeholder="e.g. €2,000" value={budget} onChange={e => setBudget(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-sm font-semibold mb-1.5 block">Platform</label>
                <Select value={platform} onValueChange={setPlatform}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="youtube">YouTube</SelectItem><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="tiktok">TikTok</SelectItem><SelectItem value="facebook">Facebook</SelectItem></SelectContent></Select></div>
              <div><label className="text-sm font-semibold mb-1.5 block">Conv. Rate</label><Input placeholder="e.g. 3%" value={conversionRate} onChange={e => setConversionRate(e.target.value)} /></div>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Calculating...</> : <><Calculator className="w-4 h-4 mr-2" />Calculate ROI (2 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "ROI Analysis" : "Results"}</CardTitle>
            {result && <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}</Button>}
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto text-sm">
                <div className="text-center p-4 bg-primary/10 rounded-xl">
                  <div className="text-3xl font-black text-primary">{result.projectedROI}</div>
                  <p className="text-muted-foreground">Projected ROI</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-muted/20 rounded-lg"><span className="text-muted-foreground">Break Even:</span><div className="font-bold">{result.breakEvenPoint}</div></div>
                  <div className="p-3 bg-muted/20 rounded-lg"><span className="text-muted-foreground">CPA:</span><div className="font-bold">{result.costPerAcquisition}</div></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-emerald-500/10 rounded-lg"><h4 className="font-semibold text-xs">Best Case</h4><p className="text-muted-foreground">{result.bestCaseScenario}</p></div>
                  <div className="p-3 bg-red-500/10 rounded-lg"><h4 className="font-semibold text-xs">Worst Case</h4><p className="text-muted-foreground">{result.worstCaseScenario}</p></div>
                </div>
                <div><h4 className="font-semibold mb-1">💡 Recommendations</h4><ul>{result.recommendations?.map((r: string, i: number) => (<li key={i} className="text-muted-foreground">• {r}</li>))}</ul></div>
                <div><h4 className="font-semibold mb-1">⚡ Optimization Tips</h4><ul>{result.optimizationTips?.map((t: string, i: number) => (<li key={i} className="text-muted-foreground">• {t}</li>))}</ul></div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">Enter your parameters to calculate ROI</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
