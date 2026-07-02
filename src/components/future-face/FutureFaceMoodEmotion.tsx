import { useRef, useState } from "react";
import { getReadableUrl } from "@/lib/storageSigned";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, Smile } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { handleEdgeError, throwIfInvokeError } from "@/lib/handleEdgeError";
import BeforeAfterSlider from "./BeforeAfterSlider";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const COST = 5;
const MOODS = [
  { id: "joyful happiness", label: "😄 Joy" },
  { id: "deep sadness with tears in eyes", label: "😢 Sad" },
  { id: "intense anger", label: "😠 Angry" },
  { id: "genuine surprise", label: "😲 Surprise" },
  { id: "calm serenity and peace", label: "😌 Calm" },
  { id: "fearful anxiety", label: "😨 Fear" },
  { id: "confident smirk", label: "😏 Confident" },
  { id: "playful wink and smile", label: "😉 Playful" },
];

export default function FutureFaceMoodEmotion() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [mood, setMood] = useState(MOODS[0].id);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const upload = async (file: File) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    if (file.size > 8 * 1024 * 1024) { toast({ title: "Photo too large (max 8 MB)", variant: "destructive" }); return; }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${session.user.id}/mood-source-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("future-face-photos").upload(path, file, { contentType: file.type });
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
    setSourceUrl((await getReadableUrl("future-face-photos", path)));
    setResultUrl(null);
  };

  const generate = async () => {
    if (!sourceUrl) { toast({ title: "Upload a photo first", variant: "destructive" }); return; }
    try {
      setLoading(true); setResultUrl(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const res = await supabase.functions.invoke("future-face-image", {
        body: { action: "mood_emotion", sourceUrl, params: { mood } },
      });
      const data = throwIfInvokeError(res);
      setResultUrl(data.resultUrl);
      toast({ title: "Mood applied!", description: `Used ${data.creditsUsed} credits.` });
    } catch (err: any) {
      if (!handleEdgeError(err, { navigate, context: "Mood Emotion" })) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Future Face Mood Emotion - How it works"} steps={[{ title: 'Open', desc: 'Access the Future Face Mood Emotion section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Future Face Mood Emotion.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black">😊 Mood &amp; Emotion Studio</h2>
        <Badge className="bg-gradient-to-r from-yellow-500 to-pink-500 text-white">{COST} CR</Badge>
      </div>
      <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-pink-500/5">
        <CardContent className="p-4 space-y-4">
          {sourceUrl ? (
            <img src={sourceUrl} alt="Source" className="w-full max-w-xs mx-auto aspect-square object-cover rounded-lg border-2 border-yellow-500/30" />
          ) : (
            <div className="w-full max-w-xs mx-auto aspect-square rounded-lg border-2 border-dashed border-yellow-500/30 grid place-items-center bg-card/50">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => fileRef.current?.click()}>
            <Upload className="h-3 w-3 mr-1" /> Upload Photo
          </Button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />

          <div>
            <p className="text-xs font-bold mb-2">Choose Emotion</p>
            <div className="grid grid-cols-4 gap-1.5">
              {MOODS.map(m => (
                <Button
                  key={m.id}
                  size="sm"
                  variant={mood === m.id ? "default" : "outline"}
                  onClick={() => setMood(m.id)}
                  className={`h-auto py-2 text-[10px] ${mood === m.id ? "bg-gradient-to-br from-yellow-600 to-pink-600" : ""}`}
                >
                  {m.label}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={generate} disabled={loading || !sourceUrl} className="w-full bg-gradient-to-r from-yellow-600 to-pink-600">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Smile className="h-4 w-4 mr-2" />}
            {loading ? "Applying mood..." : `Apply Emotion (${COST} Credits)`}
          </Button>

          {resultUrl && sourceUrl && (
            <>
              <BeforeAfterSlider before={sourceUrl} after={resultUrl} />
              <Button asChild size="sm" variant="outline" className="w-full">
                <a href={resultUrl} download target="_blank" rel="noreferrer">Download</a>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
