import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, BarChart2, Sparkles, TrendingUp, TrendingDown, Target } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const AdAnalyticsDashboardView = ({ onBack }: { onBack: () => void }) => {
  const [product, setProduct] = useState("");
  const [campaignData, setCampaignData] = useState("");
  const [budget, setBudget] = useState("");
  const [platforms, setPlatforms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!product.trim()) { toast.error("Enter campaign details"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("video-ad-tools", {
        body: { action: "ad_analytics", product, campaignData, budget, platforms },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setResult(data.result);
      toast.success("Analytics generated! (3 CR)");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Ad Analytics Dashboard View - How it works"} steps={[{ title: 'Open', desc: 'Access the Ad Analytics Dashboard View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Ad Analytics Dashboard View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
            <BarChart2 className="w-6 h-6 text-white" />
          </div>
          <div><h2 className="text-2xl font-black">Ad Analytics Dashboard</h2><p className="text-muted-foreground text-sm">AI-powered campaign analytics & insights</p></div>
          <Badge className="ml-auto bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0"><Sparkles className="w-3 h-3 mr-1" />3 CR</Badge>
        </div>
      </motion.div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Campaign Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Product / Campaign *</Label><Input placeholder="e.g. Summer Sale Campaign" value={product} onChange={e => setProduct(e.target.value)} /></div>
            <div><Label>Campaign Data / Metrics</Label><Textarea placeholder="Paste your metrics: impressions, clicks, spend..." value={campaignData} onChange={e => setCampaignData(e.target.value)} rows={4} /></div>
            <div><Label>Total Budget Spent</Label><Input placeholder="e.g. $10,000" value={budget} onChange={e => setBudget(e.target.value)} /></div>
            <div><Label>Platforms Used</Label><Input placeholder="e.g. YouTube, Instagram" value={platforms} onChange={e => setPlatforms(e.target.value)} /></div>
            <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-green-600">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><BarChart2 className="mr-2 h-4 w-4" />Analyze (3 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Analytics Report</CardTitle></CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-center py-12 text-muted-foreground"><BarChart2 className="w-16 h-16 mx-auto mb-4 opacity-20" /><p>Enter campaign data for AI-powered analytics</p></div>
            ) : (
              <div className="space-y-5 max-h-[700px] overflow-y-auto pr-2">
                {result.overallPerformance && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(result.overallPerformance).map(([key, val]: any) => (
                      <Card key={key} className="bg-muted/30"><CardContent className="py-3 text-center">
                        <p className="text-lg font-bold">{val}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      </CardContent></Card>
                    ))}
                  </div>
                )}
                {result.strengths && (
                  <div><h4 className="font-bold mb-2 flex items-center gap-1"><TrendingUp className="w-4 h-4 text-green-500" />Strengths</h4>
                    <ul className="space-y-1">{result.strengths.map((s: string, i: number) => <li key={i} className="text-sm">✅ {s}</li>)}</ul>
                  </div>
                )}
                {result.weaknesses && (
                  <div><h4 className="font-bold mb-2 flex items-center gap-1"><TrendingDown className="w-4 h-4 text-red-500" />Weaknesses</h4>
                    <ul className="space-y-1">{result.weaknesses.map((w: string, i: number) => <li key={i} className="text-sm">⚠️ {w}</li>)}</ul>
                  </div>
                )}
                {result.recommendations && (
                  <div><h4 className="font-bold mb-2 flex items-center gap-1"><Target className="w-4 h-4" />Recommendations</h4>
                    <ul className="space-y-1">{result.recommendations.map((r: string, i: number) => <li key={i} className="text-sm">💡 {r}</li>)}</ul>
                  </div>
                )}
                {result.platformBreakdown && (
                  <div><h4 className="font-bold mb-2">Platform Breakdown</h4>
                    {result.platformBreakdown.map((p: any, i: number) => (
                      <Card key={i} className="bg-muted/30 mb-2"><CardContent className="py-3">
                        <div className="flex justify-between items-center"><span className="font-semibold text-sm">{p.platform}</span><Badge variant="outline">{p.score || p.performance}</Badge></div>
                        {p.notes && <p className="text-xs text-muted-foreground mt-1">{p.notes}</p>}
                      </CardContent></Card>
                    ))}
                  </div>
                )}
                {result.nextSteps && <div className="p-4 bg-primary/5 rounded-xl"><h4 className="font-bold mb-2">Next Steps</h4><p className="text-sm text-muted-foreground">{result.nextSteps}</p></div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
