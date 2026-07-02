import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Loader2, Sparkles } from "lucide-react";
import { useVoiceDiary, useVoiceDiaryHistory } from "@/hooks/useHandwritingPremium";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const VoiceDiaryCard = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<any>(null);
  const recognitionRef = useRef<any>(null);
  const diary = useVoiceDiary();
  const history = useVoiceDiaryHistory();

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      let finalTxt = "";
      for (let i = 0; i < e.results.length; i++) {
        finalTxt += e.results[i][0].transcript + " ";
      }
      setTranscript(finalTxt.trim());
    };
    rec.onerror = (e: any) => {
      toast.error("Mic error: " + e.error);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
  }, []);

  const toggle = () => {
    const rec = recognitionRef.current;
    if (!rec) return toast.error("Speech recognition not supported in this browser. Try Chrome.");
    if (listening) { rec.stop(); setListening(false); }
    else { setTranscript(""); rec.start(); setListening(true); }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onloadend = () => setImageUrl(r.result as string); r.readAsDataURL(f);
  };

  const submit = () => {
    if (!imageUrl) return toast.error("Upload a handwriting sample");
    if (!transcript.trim()) return toast.error("Record or type your reflection");
    diary.mutate({ imageUrl, transcript }, {
      onSuccess: (d: any) => setResult(d.result),
    });
  };

  return (
    <Card className="bg-gradient-to-br from-violet-50/80 via-purple-50/60 to-fuchsia-50/40 border-violet-300/40 dark:from-violet-950/30 dark:via-purple-950/20 dark:to-fuchsia-950/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-violet-700" />
            Voice Diary
          </span>
          <Badge className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-0">8 cr</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-[11px] text-muted-foreground italic">
          Speak your thoughts while uploading today's handwriting — AI cross-references your voice tone with your script for a deeper emotional reading.
        </p>

        <div>
          <Label className="text-xs">Today's handwriting</Label>
          <Input type="file" accept="image/*" onChange={onFile} className="text-xs" />
          {imageUrl && <img src={imageUrl} className="max-h-20 mt-1 rounded border" alt="sample" />}
        </div>

        <div>
          <Label className="text-xs flex items-center justify-between">
            <span>Voice reflection</span>
            <Button size="sm" variant={listening ? "destructive" : "outline"} className="h-6 text-[10px] gap-1" onClick={toggle}>
              {listening ? <><MicOff className="w-3 h-3" /> Stop</> : <><Mic className="w-3 h-3" /> Record</>}
            </Button>
          </Label>
          <Textarea
            placeholder="Tap Record and speak, or type your thoughts here…"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="text-xs min-h-[80px]"
          />
        </div>

        <Button
          onClick={submit}
          disabled={diary.isPending || !imageUrl || !transcript.trim()}
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
        >
          {diary.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing…</> : <><Sparkles className="w-4 h-4 mr-2" /> Save & analyze (8 cr)</>}
        </Button>

        {result && (
          <div className="space-y-2 pt-2">
            <div className="p-3 rounded-lg bg-gradient-to-r from-violet-100/60 to-fuchsia-100/60 dark:from-violet-900/30 dark:to-fuchsia-900/30 border border-violet-300/40">
              <div className="text-xs uppercase text-violet-900/70 dark:text-violet-300/70">Mood alignment</div>
              <div className="text-3xl font-black text-violet-800 dark:text-violet-200">{result.alignment_score}%</div>
              <div className="text-[10px] text-violet-700/70 dark:text-violet-300/70">voice ↔ handwriting coherence</div>
            </div>
            {result.detected_mood && <div className="text-xs"><strong>Mood:</strong> {result.detected_mood}</div>}
            {result.insight && <p className="text-xs italic">{result.insight}</p>}
          </div>
        )}

        {(history.data as any[])?.length > 0 && (
          <div className="pt-2 border-t border-violet-300/30">
            <div className="text-[10px] uppercase text-muted-foreground mb-1">Recent entries</div>
            <div className="space-y-1 max-h-24 overflow-auto">
              {(history.data as any[]).slice(0, 5).map((d: any) => (
                <div key={d.id} className="text-[10px] p-1.5 rounded bg-card/40 border">
                  <span className="text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</span>
                  {" · "}
                  <span className="font-semibold">{d.detected_mood ?? "—"}</span>
                  {" · "}
                  <span>{d.alignment_score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
