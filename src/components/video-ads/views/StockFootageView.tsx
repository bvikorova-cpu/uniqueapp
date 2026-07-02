import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Library, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface StockResult {
  scenes: Array<{ sceneNumber: number; description: string; keywords: string[]; pexelsUrl: string; pixabayUrl: string; unsplashUrl: string; shotType: string; motionStyle: string; durationSeconds: number }>;
  generalKeywords: string[]; avoidKeywords: string[]; proTips: string[];
}

export const StockFootageView = ({ onBack }: { onBack: () => void }) => {
  const [script, setScript] = useState("");
  const [mood, setMood] = useState("energetic");
  const [loading, setLoading] = useState(false);
  const [r, setR] = useState<StockResult | null>(null);

  const go = async () => {
    if (!script.trim()) { toast.error("Zadaj script"); return; }
    setLoading(true); setR(null);
    try {
      const { data, error } = await supabase.functions.invoke('video-ad-tools', {
        body: { action: 'stock_footage', script, mood },
      });
      if (error || data?.error) { handleEdgeError(error || data, { context: 'Stock Footage' }); return; }
      setR(data.result);
      toast.success(`${data.result.scenes.length} scenes matched (${data.credits_used} CR)`);
    } catch (e) { handleEdgeError(e, { context: 'Stock Footage' }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Stock Footage View - How it works"} steps={[{ title: 'Open', desc: 'Access the Stock Footage View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Stock Footage View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"><Library className="w-6 h-6 text-white" /></div>
        <div><h2 className="text-2xl font-black">Stock Footage Matcher</h2><p className="text-sm text-muted-foreground">Pexels / Pixabay / Unsplash auto-pair</p></div>
        <Badge className="ml-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white">3 CR</Badge>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Script / scenes *</Label><Textarea rows={6} value={script} onChange={e => setScript(e.target.value)} /></div>
            <div><Label>Mood</Label><input className="w-full mt-1 p-2 rounded-md border bg-background" value={mood} onChange={e => setMood(e.target.value)} placeholder="energetic, calm, dramatic..." /></div>
            <Button onClick={go} disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Find footage (3 CR)'}
            </Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Matched scenes</CardTitle></CardHeader>
          <CardContent className="max-h-[700px] overflow-y-auto space-y-3">
            {!r ? <p className="text-muted-foreground text-center py-12">Insert script for matching</p> : (
              <>
                <div className="flex flex-wrap gap-1">{r.generalKeywords.map((k, i) => <Badge key={i} variant="secondary">{k}</Badge>)}</div>
                {r.scenes.map(s => (
                  <Card key={s.sceneNumber} className="bg-muted/30"><CardContent className="pt-3 space-y-2">
                    <div className="font-bold">Scene {s.sceneNumber} <Badge variant="outline" className="ml-2">{s.shotType}</Badge> <Badge variant="outline">{s.motionStyle}</Badge> <Badge variant="outline">{s.durationSeconds}s</Badge></div>
                    <p className="text-sm">{s.description}</p>
                    <div className="flex flex-wrap gap-1">{s.keywords.map((k, i) => <Badge key={i} variant="secondary" className="text-xs">{k}</Badge>)}</div>
                    <div className="flex flex-wrap gap-2">
                      <a href={s.pexelsUrl} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline"><ExternalLink className="w-3 h-3 mr-1" />Pexels</Button></a>
                      <a href={s.pixabayUrl} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline"><ExternalLink className="w-3 h-3 mr-1" />Pixabay</Button></a>
                      <a href={s.unsplashUrl} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline"><ExternalLink className="w-3 h-3 mr-1" />Unsplash</Button></a>
                    </div>
                  </CardContent></Card>
                ))}
                <div><h4 className="font-semibold mb-1">⚠️ Avoid</h4><div className="flex flex-wrap gap-1">{r.avoidKeywords.map((k, i) => <Badge key={i} variant="destructive" className="text-xs">{k}</Badge>)}</div></div>
                <div><h4 className="font-semibold mb-1">💡 Pro tipy</h4><ul className="text-sm">{r.proTips.map((t, i) => <li key={i}>• {t}</li>)}</ul></div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
