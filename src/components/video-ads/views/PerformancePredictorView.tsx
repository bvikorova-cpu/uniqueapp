import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function PerformancePredictorView({ onBack }: Props) {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [message, setMessage] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [duration, setDuration] = useState("30");
  const [budget, setBudget] = useState("moderate");
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
        body: { action: "performance_predictor", product, audience, message, platform, duration, budget },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success(`Predictions ready! (${data.credits_used} credits)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Performance Predictor View - How it works"} steps={[{ title: 'Open', desc: 'Access the Performance Predictor View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Performance Predictor View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg"><BarChart3 className="w-6 h-6 text-white" /></div>
          <div><h2 className="text-2xl font-black">AI Performance Predictor</h2><p className="text-muted-foreground text-sm">Predict reach, engagement & conversions</p></div>
          <Badge className="ml-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0"><Sparkles className="w-3 h-3 mr-1" />3 Credits</Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Ad Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-semibold mb-1.5 block">Product *</label><Input placeholder="e.g. E-commerce store" value={product} onChange={e => setProduct(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Audience</label><Input placeholder="e.g. Online shoppers 25-45" value={audience} onChange={e => setAudience(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Message</label><Input placeholder="Key message of the ad" value={message} onChange={e => setMessage(e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-sm font-semibold mb-1.5 block">Platform</label>
                <Select value={platform} onValueChange={setPlatform}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="youtube">YouTube</SelectItem><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="tiktok">TikTok</SelectItem><SelectItem value="facebook">Facebook</SelectItem></SelectContent></Select></div>
              <div><label className="text-sm font-semibold mb-1.5 block">Duration</label>
                <Select value={duration} onValueChange={setDuration}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15">15s</SelectItem><SelectItem value="30">30s</SelectItem><SelectItem value="60">60s</SelectItem></SelectContent></Select></div>
              <div><label className="text-sm font-semibold mb-1.5 block">Budget</label>
                <Select value={budget} onValueChange={setBudget}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Predicting...</> : <><BarChart3 className="w-4 h-4 mr-2" />Predict Performance (3 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Predictions" : "Results"}</CardTitle>
            {result && <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}</Button>}
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto text-sm">
                {result.overallScore && (
                  <div className="text-center p-4 bg-muted/30 rounded-xl">
                    <div className="text-4xl font-black text-primary">{result.overallScore}/100</div>
                    <p className="text-muted-foreground">Overall Performance Score</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-muted/20 rounded-lg"><span className="text-muted-foreground">Reach:</span><div className="font-bold">{result.reachEstimate}</div></div>
                  <div className="p-3 bg-muted/20 rounded-lg"><span className="text-muted-foreground">Engagement:</span><div className="font-bold">{result.engagementRate}</div></div>
                  <div className="p-3 bg-muted/20 rounded-lg"><span className="text-muted-foreground">CTR:</span><div className="font-bold">{result.clickThroughRate}</div></div>
                  <div className="p-3 bg-muted/20 rounded-lg"><span className="text-muted-foreground">Conversion:</span><div className="font-bold">{result.conversionEstimate}</div></div>
                </div>
                <div><h4 className="font-semibold mb-1">✅ Best Elements</h4><ul>{result.bestPerformingElements?.map((e: string, i: number) => (<li key={i} className="text-muted-foreground">• {e}</li>))}</ul></div>
                <div><h4 className="font-semibold mb-1">⚠️ Weak Points</h4><ul>{result.weakPoints?.map((w: string, i: number) => (<li key={i} className="text-muted-foreground">• {w}</li>))}</ul></div>
                <div><h4 className="font-semibold mb-1">💡 Optimizations</h4><ul>{result.optimizationSuggestions?.map((o: string, i: number) => (<li key={i} className="text-muted-foreground">• {o}</li>))}</ul></div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">Enter ad details to predict performance</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
