import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Trophy, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface LibAd { id: string; brand_name: string; ad_title: string; hook: string; full_script: string | null; industry: string; platform: string; why_it_works: string | null; performance_metrics: Record<string, string> | null; tags: string[] | null; }
interface Reco { matches: Array<{ brand: string; hook: string; whyItWorks: string; applyToYou: string; score: number }>; customStrategy: string; patternsToSteal: string[]; avoidMistakes: string[]; nextSteps: string[]; }

export const WinningAdsView = ({ onBack }: { onBack: () => void }) => {
  const [industry, setIndustry] = useState("saas");
  const [product, setProduct] = useState("");
  const [library, setLibrary] = useState<LibAd[]>([]);
  const [loadingLib, setLoadingLib] = useState(true);
  const [loadingReco, setLoadingReco] = useState(false);
  const [reco, setReco] = useState<Reco | null>(null);

  useEffect(() => {
    (async () => {
      setLoadingLib(true);
      const { data } = await supabase.from('winning_ads_library').select('*').eq('industry', industry).limit(20);
      setLibrary((data || []) as unknown as LibAd[]);
      setLoadingLib(false);
    })();
  }, [industry]);

  const getReco = async () => {
    if (!product.trim()) { toast.error("Zadaj produkt"); return; }
    setLoadingReco(true); setReco(null);
    try {
      const { data, error } = await supabase.functions.invoke('video-ad-tools', { body: { action: 'winning_ads_recommend', product, industry } });
      if (error || data?.error) { handleEdgeError(error || data, { context: 'Winning Ads' }); return; }
      setReco(data.result); toast.success(`Recommendations prepared (${data.credits_used} CR)`);
    } catch (e) { handleEdgeError(e, { context: 'Winning Ads' }); } finally { setLoadingReco(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Winning Ads View - How it works"} steps={[{ title: 'Open', desc: 'Access the Winning Ads View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Winning Ads View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center"><Trophy className="w-6 h-6 text-white" /></div>
        <div><h2 className="text-2xl font-black">Winning Ads Library</h2><p className="text-sm text-muted-foreground">Learn from the best</p></div>
        <Badge className="ml-auto bg-gradient-to-r from-yellow-500 to-amber-600 text-white">3 CR</Badge>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card><CardHeader><CardTitle>Filter & AI Reco</CardTitle></CardHeader><CardContent className="space-y-4">
          <div><Label>Odvetvie</Label>
            <select className="w-full mt-1 p-2 rounded-md border bg-background" value={industry} onChange={e => setIndustry(e.target.value)}>
              {['saas','fitness','ecommerce','food','finance','beauty','education','automotive'].map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div><Label>Your product</Label><Input value={product} onChange={e => setProduct(e.target.value)} placeholder="e.g. CRM for small businesses" /></div>
          <Button onClick={getReco} disabled={loadingReco} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600">
            {loadingReco ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="mr-2 h-4 w-4" />AI recommendations (3 CR)</>}
          </Button>
        </CardContent></Card>
        <div className="lg:col-span-2 space-y-4 max-h-[700px] overflow-y-auto">
          {reco && (
            <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30">
              <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-yellow-500" />AI Strategy pre teba</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{reco.customStrategy}</p>
                <div><h4 className="font-semibold mb-1">🎯 Patterns to adopt</h4><div className="flex flex-wrap gap-1">{reco.patternsToSteal.map((p, i) => <Badge key={i} variant="secondary">{p}</Badge>)}</div></div>
                <div><h4 className="font-semibold mb-1">⚠️ Avoid</h4><ul className="text-sm">{reco.avoidMistakes.map((m, i) => <li key={i}>• {m}</li>)}</ul></div>
                <div><h4 className="font-semibold mb-1">🚀 Next steps</h4><ol className="text-sm list-decimal pl-5">{reco.nextSteps.map((s, i) => <li key={i}>{s}</li>)}</ol></div>
              </CardContent>
            </Card>
          )}
          <h3 className="font-bold text-lg">📚 Library ({library.length})</h3>
          {loadingLib ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : library.map(ad => (
            <Card key={ad.id}><CardContent className="pt-4 space-y-2">
              <div className="flex items-start justify-between"><div><h4 className="font-bold">{ad.brand_name} — {ad.ad_title}</h4><div className="flex gap-1 mt-1"><Badge variant="outline">{ad.platform}</Badge><Badge variant="outline">{ad.industry}</Badge></div></div></div>
              <p className="text-base font-semibold italic">"{ad.hook}"</p>
              {ad.full_script && <p className="text-sm text-muted-foreground">{ad.full_script}</p>}
              {ad.why_it_works && <p className="text-sm"><strong>💡 Why it works:</strong> {ad.why_it_works}</p>}
              {ad.performance_metrics && <div className="flex flex-wrap gap-1 text-xs">{Object.entries(ad.performance_metrics).map(([k, v]) => <Badge key={k} variant="secondary">{k}: {v}</Badge>)}</div>}
              {ad.tags && <div className="flex flex-wrap gap-1">{ad.tags.map((t, i) => <Badge key={i} variant="outline" className="text-xs">#{t}</Badge>)}</div>}
            </CardContent></Card>
          ))}
          {!loadingLib && library.length === 0 && <p className="text-muted-foreground text-center py-8">No ads for this industry</p>}
        </div>
      </div>
    </div>
    </>
  );
};
