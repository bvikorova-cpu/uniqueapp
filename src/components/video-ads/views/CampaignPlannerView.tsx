import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function CampaignPlannerView({ onBack }: Props) {
  const [product, setProduct] = useState("");
  const [budget, setBudget] = useState("");
  const [campaignDuration, setCampaignDuration] = useState("");
  const [goal, setGoal] = useState("");
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
        body: { action: "campaign_planner", product, budget, campaignDuration, goal, market },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success(`Campaign plan ready! (${data.credits_used} credits)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Campaign Planner View - How it works"} steps={[{ title: 'Open', desc: 'Access the Campaign Planner View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Campaign Planner View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg"><Target className="w-6 h-6 text-white" /></div>
          <div><h2 className="text-2xl font-black">AI Campaign Planner</h2><p className="text-muted-foreground text-sm">Complete campaign strategy with phases & KPIs</p></div>
          <Badge className="ml-auto bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-0"><Sparkles className="w-3 h-3 mr-1" />4 Credits</Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Campaign Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-semibold mb-1.5 block">Product *</label><Input placeholder="e.g. Mobile app launch" value={product} onChange={e => setProduct(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Budget</label><Input placeholder="e.g. €5,000/month" value={budget} onChange={e => setBudget(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Campaign Duration</label><Input placeholder="e.g. 3 months" value={campaignDuration} onChange={e => setCampaignDuration(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Goal</label><Input placeholder="e.g. 10,000 app downloads" value={goal} onChange={e => setGoal(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Target Market</label><Input placeholder="e.g. Europe, US" value={market} onChange={e => setMarket(e.target.value)} /></div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Planning...</> : <><Target className="w-4 h-4 mr-2" />Create Campaign Plan (4 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Campaign Plan" : "Results"}</CardTitle>
            {result && <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}</Button>}
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto text-sm">
                <div className="p-3 bg-primary/10 rounded-lg text-center">
                  <h3 className="font-bold text-lg">{result.campaignName}</h3>
                  <p className="text-muted-foreground">{result.objective}</p>
                  {result.expectedROI && <Badge className="mt-2">Expected ROI: {result.expectedROI}</Badge>}
                </div>
                {result.phases?.map((p: any, i: number) => (
                  <Card key={i} className="bg-muted/30"><CardContent className="pt-4">
                    <div className="flex justify-between mb-2"><span className="font-bold">{p.name}</span><Badge variant="outline">{p.duration}</Badge></div>
                    <p className="text-muted-foreground">{p.budget}</p>
                    <p><strong>Platforms:</strong> {p.platforms}</p>
                    <p><strong>KPIs:</strong> {p.kpis}</p>
                  </CardContent></Card>
                ))}
                {result.scalingStrategy && <div className="p-3 bg-muted/20 rounded-lg"><h4 className="font-semibold">📈 Scaling Strategy</h4><p className="text-muted-foreground">{result.scalingStrategy}</p></div>}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">Enter campaign details to create your plan</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
