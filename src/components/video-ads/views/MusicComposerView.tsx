import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Music, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function MusicComposerView({ onBack }: Props) {
  const [product, setProduct] = useState("");
  const [tone, setTone] = useState("upbeat");
  const [emotion, setEmotion] = useState("excitement");
  const [duration, setDuration] = useState("30");
  const [platform, setPlatform] = useState("youtube");
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
        body: { action: "music_composer", product, tone, emotion, duration, platform },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success(`Music direction ready! (${data.credits_used} credits)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Music Composer View - How it works"} steps={[{ title: 'Open', desc: 'Access the Music Composer View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Music Composer View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg"><Music className="w-6 h-6 text-white" /></div>
          <div><h2 className="text-2xl font-black">AI Music Director</h2><p className="text-muted-foreground text-sm">Music composition & sound design for ads</p></div>
          <Badge className="ml-auto bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0"><Sparkles className="w-3 h-3 mr-1" />3 Credits</Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Music Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-semibold mb-1.5 block">Product *</label><Input placeholder="e.g. Sports car brand" value={product} onChange={e => setProduct(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-sm font-semibold mb-1.5 block">Tone</label>
                <Select value={tone} onValueChange={setTone}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="upbeat">Upbeat</SelectItem><SelectItem value="dramatic">Dramatic</SelectItem><SelectItem value="calm">Calm</SelectItem><SelectItem value="epic">Epic</SelectItem><SelectItem value="playful">Playful</SelectItem></SelectContent></Select></div>
              <div><label className="text-sm font-semibold mb-1.5 block">Target Emotion</label>
                <Select value={emotion} onValueChange={setEmotion}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="excitement">Excitement</SelectItem><SelectItem value="trust">Trust</SelectItem><SelectItem value="nostalgia">Nostalgia</SelectItem><SelectItem value="urgency">Urgency</SelectItem><SelectItem value="joy">Joy</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-sm font-semibold mb-1.5 block">Duration</label>
                <Select value={duration} onValueChange={setDuration}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15">15s</SelectItem><SelectItem value="30">30s</SelectItem><SelectItem value="60">60s</SelectItem></SelectContent></Select></div>
              <div><label className="text-sm font-semibold mb-1.5 block">Platform</label>
                <Select value={platform} onValueChange={setPlatform}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="youtube">YouTube</SelectItem><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="tiktok">TikTok</SelectItem><SelectItem value="tv">TV</SelectItem></SelectContent></Select></div>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Composing...</> : <><Music className="w-4 h-4 mr-2" />Compose Music (3 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Music Direction" : "Results"}</CardTitle>
            {result && <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}</Button>}
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto text-sm">
                {result.mainTrack && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2">🎵 Main Track</h4>
                    <p><strong>Genre:</strong> {result.mainTrack.genre}</p>
                    <p><strong>Tempo:</strong> {result.mainTrack.tempo} BPM</p>
                    <p><strong>Mood:</strong> {result.mainTrack.mood}</p>
                    <p><strong>Instruments:</strong> {result.mainTrack.instruments}</p>
                    <p className="mt-2"><strong>Structure:</strong> {result.mainTrack.structureBreakdown}</p>
                  </div>
                )}
                {result.alternatives?.map((a: any, i: number) => (
                  <div key={i} className="p-3 bg-muted/20 rounded-lg">
                    <h4 className="font-semibold">Alternative {i + 1}</h4>
                    <p className="text-muted-foreground">{typeof a === 'string' ? a : JSON.stringify(a)}</p>
                  </div>
                ))}
                {result.soundEffects && <div><h4 className="font-semibold mb-1">🔊 Sound Effects</h4><ul>{result.soundEffects.map((s: any, i: number) => (<li key={i} className="text-muted-foreground">• {typeof s === 'string' ? s : `${s.timestamp}: ${s.effect || s.description}`}</li>))}</ul></div>}
                {result.emotionalArc && <div className="p-3 bg-primary/5 rounded-lg"><h4 className="font-semibold">🎭 Emotional Arc</h4><p className="text-muted-foreground">{result.emotionalArc}</p></div>}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">Configure music settings to get composition direction</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
