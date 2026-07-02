import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function CompetitorAnalysisView({ onBack }: Props) {
  const [product, setProduct] = useState("");
  const [industry, setIndustry] = useState("");
  const [market, setMarket] = useState("");
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
        body: { action: "competitor_analysis", product, industry, market },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success(`Analysis complete! (${data.credits_used} credits)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Competitor Analysis View - How it works"} steps={[{ title: 'Open', desc: 'Access the Competitor Analysis View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Competitor Analysis View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg"><Search className="w-6 h-6 text-white" /></div>
          <div><h2 className="text-2xl font-black">AI Competitor Analyzer</h2><p className="text-muted-foreground text-sm">Competitive intelligence for video advertising</p></div>
          <Badge className="ml-auto bg-gradient-to-r from-red-500 to-rose-500 text-white border-0"><Sparkles className="w-3 h-3 mr-1" />4 Credits</Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Market Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-semibold mb-1.5 block">Product/Service *</label><Input placeholder="e.g. Project management tool" value={product} onChange={e => setProduct(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Industry</label><Input placeholder="e.g. SaaS / Technology" value={industry} onChange={e => setIndustry(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Target Market</label><Input placeholder="e.g. US, Europe" value={market} onChange={e => setMarket(e.target.value)} /></div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><Search className="w-4 h-4 mr-2" />Analyze Competitors (4 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Competitive Intel" : "Results"}</CardTitle>
            {result && <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}</Button>}
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto text-sm">
                {result.competitors?.map((c: any, i: number) => (
                  <Card key={i} className="bg-muted/30"><CardContent className="pt-4">
                    <h4 className="font-bold">{c.name}</h4>
                    <p className="text-muted-foreground">{c.adStrategy}</p>
                    <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                      <p><strong>Strengths:</strong> {c.strengths}</p>
                      <p><strong>Weaknesses:</strong> {c.weaknesses}</p>
                    </div>
                  </CardContent></Card>
                ))}
                <div><h4 className="font-semibold mb-1">🎯 Market Gaps</h4><ul>{result.marketGaps?.map((g: string, i: number) => (<li key={i} className="text-muted-foreground">• {g}</li>))}</ul></div>
                <div><h4 className="font-semibold mb-1">💡 Opportunities</h4><ul>{result.opportunities?.map((o: string, i: number) => (<li key={i} className="text-muted-foreground">• {o}</li>))}</ul></div>
                {result.recommendedStrategy && <div className="p-3 bg-primary/10 rounded-lg"><h4 className="font-semibold">📋 Recommended Strategy</h4><p className="text-muted-foreground">{result.recommendedStrategy}</p></div>}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">Enter market details for competitive analysis</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
