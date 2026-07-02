import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface HookResult {
  hookScore: number; attentionGrab: number; clarity: number; curiosityGap: number; emotionalImpact: number;
  strengths: string[]; weaknesses: string[]; improvedHooks: string[]; bestHook: string; patternsUsed: string[];
  platformFit: { tiktok: number; youtube: number; instagram: number; facebook: number };
  retention3sEstimate: string; recommendation: string;
}

export const HookAnalyzerView = ({ onBack }: { onBack: () => void }) => {
  const [hook, setHook] = useState(""); const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false); const [r, setR] = useState<HookResult | null>(null);
  const go = async () => {
    if (!hook.trim()) { toast.error("Zadaj hook"); return; }
    setLoading(true); setR(null);
    try {
      const { data, error } = await supabase.functions.invoke('video-ad-tools', { body: { action: 'hook_analyzer', hook, audience, platform: 'all' } });
      if (error || data?.error) { handleEdgeError(error || data, { context: 'Hook' }); return; }
      setR(data.result); toast.success(`Score: ${data.result.hookScore}/100 (${data.credits_used} CR)`);
    } catch (e) { handleEdgeError(e, { context: 'Hook' }); } finally { setLoading(false); }
  };
  return (
    <>
      <FloatingHowItWorks title={"Hook Analyzer View - How it works"} steps={[{ title: 'Open', desc: 'Access the Hook Analyzer View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Hook Analyzer View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center"><Flame className="w-6 h-6 text-white" /></div>
        <div><h2 className="text-2xl font-black">Hook Analyzer (First 3s)</h2><p className="text-sm text-muted-foreground">Analyze and improve the first 3 seconds</p></div>
        <Badge className="ml-auto bg-gradient-to-r from-red-500 to-orange-600 text-white">3 CR</Badge>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card><CardHeader><CardTitle>Your hook</CardTitle></CardHeader><CardContent className="space-y-4">
          <div><Label>Hook (first 3s) *</Label><Input value={hook} onChange={e => setHook(e.target.value)} placeholder={`e.g. "POV: It's 2am..."`} /></div>
          <div><Label>Target audience</Label><Input value={audience} onChange={e => setAudience(e.target.value)} /></div>
          <Button onClick={go} disabled={loading} className="w-full bg-gradient-to-r from-red-500 to-orange-600">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Analyze (3 CR)'}</Button>
        </CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><CardTitle>Analysis</CardTitle></CardHeader><CardContent className="max-h-[700px] overflow-y-auto">
          {!r ? <p className="text-muted-foreground text-center py-12">Insert hook for analysis</p> : (
            <div className="space-y-4">
              <div className="text-center"><div className="text-6xl font-black bg-gradient-to-r from-red-500 to-orange-600 bg-clip-text text-transparent">{r.hookScore}</div><p className="text-sm text-muted-foreground">Hook Score / 100</p></div>
              <div className="grid grid-cols-4 gap-2">{[['Attention',r.attentionGrab],['Clarity',r.clarity],['Curiosity',r.curiosityGap],['Emotion',r.emotionalImpact]].map(([l,v]) => <Card key={l as string} className="bg-muted/30"><CardContent className="pt-3 text-center"><div className="text-2xl font-bold">{v}/10</div><p className="text-xs">{l}</p></CardContent></Card>)}</div>
              <div><h4 className="font-semibold mb-2">📱 Platform fit</h4><div className="grid grid-cols-4 gap-2 text-xs">{Object.entries(r.platformFit).map(([p, s]) => <Badge key={p} variant="outline">{p}: {s}</Badge>)}</div></div>
              <div><h4 className="font-semibold mb-1">✅ Strengths</h4><ul className="text-sm">{r.strengths.map((s, i) => <li key={i}>• {s}</li>)}</ul></div>
              <div><h4 className="font-semibold mb-1">⚠️ Weaknesses</h4><ul className="text-sm">{r.weaknesses.map((s, i) => <li key={i}>• {s}</li>)}</ul></div>
              <div><h4 className="font-semibold mb-2">🚀 Better hooks</h4>{r.improvedHooks.map((h, i) => <p key={i} className="text-sm pl-3 border-l-2 border-red-500 mb-1">{h}</p>)}</div>
              <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10"><CardContent className="pt-4"><p className="text-sm font-semibold mb-1">💡 Best Hook:</p><p className="text-base">"{r.bestHook}"</p></CardContent></Card>
              <p className="text-sm"><strong>Retention 3s:</strong> {r.retention3sEstimate}</p>
              <div className="flex flex-wrap gap-1">{r.patternsUsed.map((p, i) => <Badge key={i} variant="secondary">{p}</Badge>)}</div>
              <p className="text-sm italic">{r.recommendation}</p>
            </div>
          )}
        </CardContent></Card>
      </div>
    </div>
    </>
  );
};
