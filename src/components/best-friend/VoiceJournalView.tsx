import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mic, Square, Loader2, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const VoiceJournalView = () => {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size < 1000) { toast.error("Recording too short"); return; }
        await upload(blob);
      };
      mr.start(); mediaRef.current = mr; setRecording(true);
    } catch (e: any) { toast.error("Mic permission denied"); }
  };

  const stop = () => { mediaRef.current?.stop(); setRecording(false); };

  const upload = async (blob: Blob) => {
    setProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sign in");
      const fd = new FormData();
      fd.append("audio", blob, "journal.webm");
      const resp = await fetch(`https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/best-friend-voice-journal`, {
        method: "POST", headers: { Authorization: `Bearer ${session.access_token}` }, body: fd,
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed");
      setResult(data);
      toast.success("Journal entry processed!");
    } catch (e: any) { toast.error(e.message); }
    finally { setProcessing(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Voice Journal View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
          <Mic className="h-8 w-8 text-white"/>
        </div>
        <h2 className="text-3xl font-black">Voice Journal</h2>
        <p className="text-muted-foreground mt-2">Speak your mind — AI summarizes & gives insight</p>
      </div>

      <Card><CardContent className="p-8 text-center space-y-4">
        {!recording && !processing && (
          <Button size="lg" onClick={start} className="rounded-full h-24 w-24 bg-gradient-to-br from-rose-500 to-pink-600">
            <Mic className="h-10 w-10"/>
          </Button>
        )}
        {recording && (
          <Button size="lg" onClick={stop} variant="destructive" className="rounded-full h-24 w-24 animate-pulse">
            <Square className="h-10 w-10"/>
          </Button>
        )}
        {processing && <Loader2 className="h-12 w-12 animate-spin mx-auto text-rose-400"/>}
        <p className="text-sm text-muted-foreground">
          {processing ? "Transcribing & analyzing..." : recording ? "Recording... tap to stop" : "Tap to start recording"}
        </p>
      </CardContent></Card>

      {result && (
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-rose-400"/> Insights</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {result.mood && <Badge className="bg-rose-500/20 text-rose-300">Mood: {result.mood}</Badge>}
            <div><div className="text-xs font-bold text-muted-foreground mb-1">Transcript</div><p className="text-sm italic">"{result.transcript}"</p></div>
            <div><div className="text-xs font-bold text-muted-foreground mb-1">Summary</div><p className="text-sm">{result.summary}</p></div>
            <div><div className="text-xs font-bold text-muted-foreground mb-1">Insight</div><p className="text-sm">{result.insight}</p></div>
            <div><div className="text-xs font-bold text-muted-foreground mb-1">Next Step</div><p className="text-sm">{result.next_step}</p></div>
          </CardContent></Card>
      )}
    </div>
  );
};
