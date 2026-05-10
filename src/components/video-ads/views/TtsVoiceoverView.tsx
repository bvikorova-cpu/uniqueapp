import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mic2, Download, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { handleEdgeError } from "@/lib/handleEdgeError";

const VOICES = [
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George (M, warm)' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (F, soft)' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie (M, casual)' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda (F, bright)' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica (F, expressive)' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian (M, narrator)' },
];

export const TtsVoiceoverView = ({ onBack }: { onBack: () => void }) => {
  const [text, setText] = useState("");
  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [customVoiceId, setCustomVoiceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const generate = async () => {
    if (!text.trim()) { toast.error("Zadaj text"); return; }
    if (text.length > 5000) { toast.error("Max 5000 znakov"); return; }
    setLoading(true); setAudioUrl(null);
    try {
      const { data, error } = await supabase.functions.invoke('video-ad-tts', {
        body: { text, voiceId },
      });
      if (error || data?.error) { handleEdgeError(error || data, { context: 'TTS Voiceover' }); return; }
      const url = `data:${data.mimeType};base64,${data.audioBase64}`;
      setAudioUrl(url);
      toast.success(`Hlas vygenerovaný (${data.credits_used} CR)`);
    } catch (e) { handleEdgeError(e, { context: 'TTS Voiceover' }); }
    finally { setLoading(false); }
  };

  const download = () => {
    if (!audioUrl) return;
    const a = document.createElement('a'); a.href = audioUrl; a.download = `voiceover-${Date.now()}.mp3`; a.click();
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Späť</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center"><Mic2 className="w-6 h-6 text-white" /></div>
        <div><h2 className="text-2xl font-black">AI Voiceover (Real Voice)</h2><p className="text-sm text-muted-foreground">ElevenLabs - profesionálny hlas pre tvoje ad</p></div>
        <Badge className="ml-auto bg-gradient-to-r from-pink-500 to-rose-600 text-white">5 CR</Badge>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Text na nahovorenie *</Label><Textarea rows={6} maxLength={5000} placeholder="Vlož script alebo voiceover text..." value={text} onChange={e => setText(e.target.value)} /><p className="text-xs text-muted-foreground mt-1">{text.length}/5000</p></div>
            <div><Label>Hlas</Label>
              <select className="w-full mt-1 p-2 rounded-md border bg-background" value={voiceId} onChange={e => setVoiceId(e.target.value)}>
                {VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-rose-600">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generujem...</> : <><Play className="mr-2 h-4 w-4" />Generovať hlas (5 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Audio výstup</CardTitle></CardHeader>
          <CardContent>
            {!audioUrl ? <p className="text-muted-foreground text-center py-12">Vygeneruj hlas pre výstup</p> : (
              <div className="space-y-4">
                <audio src={audioUrl} controls className="w-full" />
                <Button onClick={download} variant="outline" className="w-full"><Download className="mr-2 h-4 w-4" />Stiahnuť MP3</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
