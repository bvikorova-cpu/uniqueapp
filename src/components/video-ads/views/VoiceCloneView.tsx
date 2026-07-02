import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mic, Upload, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const VoiceCloneView = ({ onBack }: { onBack: () => void }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [testText, setTestText] = useState("Hello! This is my cloned voice for video ads.");
  const [testAudio, setTestAudio] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const clone = async () => {
    if (!name.trim() || !file) { toast.error("Zadaj meno a nahraj sample"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; }
    setLoading(true); setVoiceId(null); setTestAudio(null);
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let bin = ""; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      const audioBase64 = btoa(bin);
      const { data, error } = await supabase.functions.invoke('video-ad-voice-clone', {
        body: { name, description, audioBase64, mimeType: file.type || 'audio/mpeg' },
      });
      if (error || data?.error) { handleEdgeError(error || data, { context: 'Voice Clone' }); return; }
      setVoiceId(data.voiceId);
      try {
        const KEY = 'video-ad:cloned-voices';
        const list = JSON.parse(localStorage.getItem(KEY) || '[]');
        if (!list.find((v: any) => v.voiceId === data.voiceId)) {
          list.unshift({ voiceId: data.voiceId, name, description, createdAt: Date.now() });
          localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)));
          window.dispatchEvent(new Event('cloned-voices-updated'));
        }
      } catch {}
      toast.success(`Voice cloned (${data.credits_used} CR) — automatically available in Final Composer`);
    } catch (e) { handleEdgeError(e, { context: 'Voice Clone' }); }
    finally { setLoading(false); }
  };

  const test = async () => {
    if (!voiceId) return;
    setTesting(true); setTestAudio(null);
    try {
      const { data, error } = await supabase.functions.invoke('video-ad-tts', { body: { text: testText, voiceId } });
      if (error || data?.error) { handleEdgeError(error || data, { context: 'Test Voice' }); return; }
      setTestAudio(`data:${data.mimeType};base64,${data.audioBase64}`);
    } catch (e) { handleEdgeError(e, { context: 'Test Voice' }); }
    finally { setTesting(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Voice Clone View - How it works"} steps={[{ title: 'Open', desc: 'Access the Voice Clone View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Voice Clone View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center"><Mic className="w-6 h-6 text-white" /></div>
        <div><h2 className="text-2xl font-black">Voice Cloning</h2><p className="text-sm text-muted-foreground">Naklonuj svoj hlas pre video ads</p></div>
        <Badge className="ml-auto bg-gradient-to-r from-rose-500 to-purple-600 text-white">10 CR</Badge>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Meno hlasu *</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="napr. My Brand Voice" /></div>
            <div><Label>Popis</Label><Textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} /></div>
            <div>
              <Label>Audio sample (1-3 min, MP3/WAV/M4A) *</Label>
              <input ref={inputRef} type="file" accept="audio/*" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
              <Button variant="outline" onClick={() => inputRef.current?.click()} className="w-full mt-1"><Upload className="mr-2 h-4 w-4" />{file ? file.name : 'Select a file'}</Button>
            </div>
            <Button onClick={clone} disabled={loading} className="w-full bg-gradient-to-r from-rose-500 to-purple-600">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Clone (10 CR)'}
            </Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Result</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {!voiceId ? <p className="text-muted-foreground text-center py-12">Nahraj sample a naklonuj hlas</p> : (
              <>
                <div className="p-3 bg-muted rounded-lg"><p className="text-sm">✅ Voice ID: <code className="font-mono">{voiceId}</code></p>
                  <p className="text-xs text-muted-foreground mt-1">Use this ID in TTS Voiceover (insert via "custom voiceId").</p></div>
                <div><Label>Test text</Label><Textarea rows={3} value={testText} onChange={e => setTestText(e.target.value)} /></div>
                <Button onClick={test} disabled={testing} variant="outline" className="w-full">
                  {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Play className="mr-2 h-4 w-4" />Test voice (5 CR)</>}
                </Button>
                {testAudio && <audio src={testAudio} controls className="w-full" />}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
