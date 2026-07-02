import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UserCircle2, Image as ImageIcon, Play, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface AvatarPlan {
  avatarDescription: string; voiceCharacter: string; recommendedVoiceId: string;
  scriptForAvatar: string; pacing: string; gestures: string[]; backgroundType: string; dressCode: string;
}

export const AvatarTalkingHeadView = ({ onBack }: { onBack: () => void }) => {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<AvatarPlan | null>(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [portrait, setPortrait] = useState<string | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [voiceLoading, setVoiceLoading] = useState(false);

  const generatePlan = async () => {
    if (!product.trim()) { toast.error("Zadaj produkt"); return; }
    setLoading(true); setPlan(null); setPortrait(null); setAudio(null);
    try {
      const { data, error } = await supabase.functions.invoke('video-ad-tools', {
        body: { action: 'avatar_plan', product, audience, tone },
      });
      if (error || data?.error) { handleEdgeError(error || data, { context: 'Avatar Plan' }); return; }
      setPlan(data.result);
      toast.success(`Avatar plan prepared (${data.credits_used} CR)`);
    } catch (e) { handleEdgeError(e, { context: 'Avatar Plan' }); }
    finally { setLoading(false); }
  };

  const generatePortrait = async () => {
    if (!plan) return;
    setImgLoading(true); setPortrait(null);
    try {
      const { data, error } = await supabase.functions.invoke('video-ad-scenes', {
        body: { scenes: [`Talking head portrait, photorealistic, professional lighting, eye contact with camera. ${plan.avatarDescription}. Background: ${plan.backgroundType}. Attire: ${plan.dressCode}.`], aspectRatio: '9:16' },
      });
      if (error || data?.error) { handleEdgeError(error || data, { context: 'Avatar Portrait' }); return; }
      setPortrait(`data:image/png;base64,${data.frames[0].b64}`);
      toast.success(`Portrait created (${data.credits_used} CR)`);
    } catch (e) { handleEdgeError(e, { context: 'Avatar Portrait' }); }
    finally { setImgLoading(false); }
  };

  const generateVoice = async () => {
    if (!plan) return;
    setVoiceLoading(true); setAudio(null);
    try {
      const { data, error } = await supabase.functions.invoke('video-ad-tts', {
        body: { text: plan.scriptForAvatar, voiceId: plan.recommendedVoiceId },
      });
      if (error || data?.error) { handleEdgeError(error || data, { context: 'Avatar Voice' }); return; }
      setAudio(`data:${data.mimeType};base64,${data.audioBase64}`);
      toast.success(`Voiceover created (${data.credits_used} CR)`);
    } catch (e) { handleEdgeError(e, { context: 'Avatar Voice' }); }
    finally { setVoiceLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Avatar Talking Head View - How it works"} steps={[{ title: 'Open', desc: 'Access the Avatar Talking Head View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Avatar Talking Head View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center"><UserCircle2 className="w-6 h-6 text-white" /></div>
        <div><h2 className="text-2xl font-black">AI Avatar / Talking Head</h2><p className="text-sm text-muted-foreground">Synthesia/HeyGen-style digital presenter</p></div>
        <Badge className="ml-auto bg-gradient-to-r from-sky-500 to-indigo-600 text-white">3+5+5 CR</Badge>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Product / service *</Label><Textarea rows={3} value={product} onChange={e => setProduct(e.target.value)} /></div>
            <div><Label>Target audience</Label><Input value={audience} onChange={e => setAudience(e.target.value)} /></div>
            <div><Label>Tone</Label><Input value={tone} onChange={e => setTone(e.target.value)} placeholder="professional, friendly, energetic..." /></div>
            <Button onClick={generatePlan} disabled={loading} className="w-full bg-gradient-to-r from-sky-500 to-indigo-600">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '1) Generate plan (3 CR)'}
            </Button>
            {plan && (
              <>
                <Button onClick={generatePortrait} disabled={imgLoading} variant="outline" className="w-full">
                  {imgLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ImageIcon className="mr-2 h-4 w-4" />2) Avatar portrait (5 CR)</>}
                </Button>
                <Button onClick={generateVoice} disabled={voiceLoading} variant="outline" className="w-full">
                  {voiceLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Play className="mr-2 h-4 w-4" />3) Voiceover (5 CR)</>}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Talking Head</CardTitle></CardHeader>
          <CardContent className="max-h-[700px] overflow-y-auto space-y-4">
            {!plan ? <p className="text-muted-foreground text-center py-12">Generate plan</p> : (
              <>
                {portrait && (
                  <div className="relative w-64 mx-auto rounded-xl overflow-hidden">
                    <img src={portrait} alt="Avatar" className="w-full" />
                    {audio && <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60"><audio src={audio} controls className="w-full h-8" /></div>}
                  </div>
                )}
                {audio && !portrait && <audio src={audio} controls className="w-full" />}
                <div><h4 className="font-semibold mb-1">🎭 Avatar</h4><p className="text-sm">{plan.avatarDescription}</p></div>
                <div className="grid grid-cols-2 gap-2 text-xs"><Badge variant="outline">🎙 {plan.voiceCharacter}</Badge><Badge variant="outline">⚡ {plan.pacing}</Badge><Badge variant="outline">🏛 {plan.backgroundType}</Badge><Badge variant="outline">👔 {plan.dressCode}</Badge></div>
                <div><h4 className="font-semibold mb-1">📝 Script</h4><p className="text-sm whitespace-pre-wrap p-3 bg-muted rounded">{plan.scriptForAvatar}</p></div>
                <div><h4 className="font-semibold mb-1">👋 Gestures</h4><ul className="text-sm">{plan.gestures.map((g, i) => <li key={i}>• {g}</li>)}</ul></div>
                {audio && <Button variant="outline" onClick={() => { const a = document.createElement('a'); a.href = audio; a.download = `avatar-vo-${Date.now()}.mp3`; a.click(); }}><Download className="mr-2 h-4 w-4" />MP3</Button>}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
