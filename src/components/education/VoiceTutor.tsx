import { useState } from "react";
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useTutoringCredits } from "@/hooks/useTutoringCredits";
import { toast } from "sonner";

// Browser SpeechRecognition types (vendor-prefixed)
const SR: any =
  (typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));

const VoiceTutor = () => {
  const { credits, spendCredit, refundCredit, isUsingCredit } = useTutoringCredits();
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [recognition, setRecognition] = useState<any>(null);

  const supported = !!SR && typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = (text: string) => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.error(e);
    }
  };

  const askAI = async (text: string) => {
    if (credits < 1) {
      toast.error("Out of tutoring credits");
      return;
    }
    setThinking(true);
    setReply("");
    let credited = false;
    try {
      await spendCredit();
      credited = true;
      const { data, error } = await supabase.functions.invoke("tutoring-chat", {
        body: { message: text, history: [] },
      });
      if (error) throw error;
      const answer = (data as any)?.message || (data as any)?.reply || (data as any)?.response || "";
      if (!answer) throw new Error("Empty AI reply");
      setReply(answer);
      speak(answer);
    } catch (e: any) {
      if (credited) await refundCredit("voice-tutor failed");
      toast.error(e?.message || "AI failed");
    } finally {
      setThinking(false);
    }
  };

  const startListening = () => {
    if (!SR) {
      toast.error("Voice recognition not supported. Try Chrome on desktop.");
      return;
    }
    const r = new SR();
    r.lang = "en-US";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (ev: any) => {
      const t = ev.results[0]?.[0]?.transcript || "";
      setTranscript(t);
      if (t.trim()) askAI(t);
    };
    r.onerror = (ev: any) => {
      toast.error(`Mic error: ${ev.error}`);
      setListening(false);
    };
    r.onend = () => setListening(false);
    r.start();
    setRecognition(r);
    setListening(true);
    setReply("");
    setTranscript("");
  };

  const stopListening = () => {
    recognition?.stop();
    setListening(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mic className="h-5 w-5 text-primary" /> Voice Tutor
          <span className="ml-auto text-xs text-muted-foreground font-normal">1 credit per question</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!supported && (
          <Badge variant="destructive" className="w-full justify-center py-2">
            Browser does not support voice. Use Chrome.
          </Badge>
        )}

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={listening ? stopListening : startListening}
            disabled={!supported || thinking || isUsingCredit}
            className={`h-24 w-24 rounded-full ${listening ? "bg-destructive hover:bg-destructive/90 animate-pulse" : "bg-primary"}`}
          >
            {listening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {listening
            ? "🎙️ Listening… speak your question"
            : thinking
            ? "🤔 Thinking…"
            : "Tap mic and ask anything"}
        </p>

        {transcript && (
          <div className="p-3 rounded-lg bg-muted/40 border text-sm">
            <p className="font-semibold mb-1">You said:</p>
            <p className="text-muted-foreground">{transcript}</p>
          </div>
        )}

        {thinking && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Generating answer…
          </div>
        )}

        {reply && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Tutor:</p>
              <Button size="sm" variant="ghost" onClick={() => speak(reply)} className="h-7 gap-1">
                <Volume2 className="h-3.5 w-3.5" /> Replay
              </Button>
            </div>
            <p className="text-muted-foreground whitespace-pre-wrap">{reply}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceTutor;
