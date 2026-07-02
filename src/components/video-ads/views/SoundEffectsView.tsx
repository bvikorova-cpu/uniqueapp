import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Volume2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const PRESETS = [
  "Whoosh transition", "Cinematic boom impact", "Cash register ding", "Notification pop",
  "Crowd cheer applause", "Car engine revving", "Camera shutter click", "Glass shatter",
  "Coin drop", "Magical sparkle", "Heartbeat slow tense", "Phone ring modern",
];

export const SoundEffectsView = ({ onBack }: { onBack: () => void }) => {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(5);
  const [loading, setLoading] = useState(false);
  const [audio, setAudio] = useState<string | null>(null);

  const generate = async () => {
    if (!prompt.trim()) { toast.error("Zadaj popis SFX"); return; }
    setLoading(true); setAudio(null);
    try {
      const { data, error } = await supabase.functions.invoke('video-ad-sfx', {
        body: { prompt, durationSeconds: duration },
      });
      if (error || data?.error) { handleEdgeError(error || data, { context: 'SFX' }); return; }
      setAudio(`data:${data.mimeType};base64,${data.audioBase64}`);
      toast.success(`SFX generated (${data.credits_used} CR)`);
    } catch (e) { handleEdgeError(e, { context: 'SFX' }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Sound Effects View - How it works"} steps={[{ title: 'Open', desc: 'Access the Sound Effects View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Sound Effects View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime-500 to-emerald-600 flex items-center justify-center"><Volume2 className="w-6 h-6 text-white" /></div>
        <div><h2 className="text-2xl font-black">Sound Effects Library</h2><p className="text-sm text-muted-foreground">AI-generated SFX (ElevenLabs)</p></div>
        <Badge className="ml-auto bg-gradient-to-r from-lime-500 to-emerald-600 text-white">5 CR</Badge>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Popis SFX *</Label><Input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="napr. epic cinematic whoosh" /></div>
            <div><Label>Trvanie (s, max 22)</Label><Input type="number" min={0.5} max={22} step={0.5} value={duration} onChange={e => setDuration(Number(e.target.value) || 5)} /></div>
            <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-lime-500 to-emerald-600">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate SFX (5 CR)'}
            </Button>
            <div>
              <Label className="text-xs">Presety</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {PRESETS.map(p => <Badge key={p} variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => setPrompt(p)}>{p}</Badge>)}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Audio</CardTitle></CardHeader>
          <CardContent>
            {!audio ? <p className="text-muted-foreground text-center py-12">Vygeneruj SFX</p> : (
              <div className="space-y-4">
                <audio src={audio} controls className="w-full" autoPlay />
                <Button variant="outline" onClick={() => { const a = document.createElement('a'); a.href = audio; a.download = `sfx-${Date.now()}.mp3`; a.click(); }} className="w-full"><Download className="mr-2 h-4 w-4" />Download MP3</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
