import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mic, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function VoiceoverScriptView({ onBack }: Props) {
  const [product, setProduct] = useState("");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("professional");
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
        body: { action: "voiceover_script", product, message, tone, duration, platform },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success(`Voiceover script ready! (${data.credits_used} credits)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Voiceover Script View - How it works"} steps={[{ title: 'Open', desc: 'Access the Voiceover Script View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Voiceover Script View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg"><Mic className="w-6 h-6 text-white" /></div>
          <div><h2 className="text-2xl font-black">AI Voiceover Script</h2><p className="text-muted-foreground text-sm">Professional voiceover direction with casting tips</p></div>
          <Badge className="ml-auto bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0"><Sparkles className="w-3 h-3 mr-1" />2 Credits</Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Voiceover Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-semibold mb-1.5 block">Product *</label><Input placeholder="e.g. Luxury skincare" value={product} onChange={e => setProduct(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Message</label><Textarea placeholder="What the voiceover should convey..." value={message} onChange={e => setMessage(e.target.value)} rows={3} /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-sm font-semibold mb-1.5 block">Tone</label>
                <Select value={tone} onValueChange={setTone}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="professional">Professional</SelectItem><SelectItem value="warm">Warm</SelectItem><SelectItem value="energetic">Energetic</SelectItem><SelectItem value="authoritative">Authoritative</SelectItem></SelectContent></Select></div>
              <div><label className="text-sm font-semibold mb-1.5 block">Duration</label>
                <Select value={duration} onValueChange={setDuration}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15">15s</SelectItem><SelectItem value="30">30s</SelectItem><SelectItem value="60">60s</SelectItem></SelectContent></Select></div>
              <div><label className="text-sm font-semibold mb-1.5 block">Platform</label>
                <Select value={platform} onValueChange={setPlatform}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="youtube">YouTube</SelectItem><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="tiktok">TikTok</SelectItem><SelectItem value="tv">TV</SelectItem></SelectContent></Select></div>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Writing...</> : <><Mic className="w-4 h-4 mr-2" />Generate Voiceover (2 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Voiceover Script" : "Results"}</CardTitle>
            {result && <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}</Button>}
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto text-sm">
                <div className="p-3 bg-muted/30 rounded-lg whitespace-pre-wrap">{result.script}</div>
                {result.voiceProfile && (
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <h4 className="font-semibold mb-1">🎙️ Voice Profile</h4>
                    <p>Gender: {result.voiceProfile.gender} | Age: {result.voiceProfile.ageRange}</p>
                    <p>Accent: {result.voiceProfile.accent} | Pace: {result.voiceProfile.paceWPM} WPM</p>
                  </div>
                )}
                {result.directions?.map((d: any, i: number) => (
                  <div key={i} className="p-2 bg-muted/20 rounded-lg">
                    <div className="flex justify-between"><span className="font-medium">{d.timestamp}</span><Badge variant="outline">{d.emotion}</Badge></div>
                    <p className="text-muted-foreground mt-1">{d.text}</p>
                  </div>
                ))}
                {result.recordingTips && <div className="p-3 bg-muted/30 rounded-lg"><h4 className="font-semibold">💡 Recording Tips</h4><p className="text-muted-foreground">{result.recordingTips}</p></div>}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">Set up voiceover parameters to generate your script</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
