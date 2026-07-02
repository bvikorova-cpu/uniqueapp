import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, AlertTriangle } from "lucide-react";
import { useVoiceLieDetection } from "@/hooks/useLieDetectorAdvanced";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const VoiceLieDetectionCard = () => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const detect = useVoiceLieDetection();

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch {
      alert("Microphone access denied");
    }
  };

  const stopRec = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const analyze = async () => {
    if (!audioBlob) return;
    const buf = await audioBlob.arrayBuffer();
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    detect.mutate(
      { audio_base64: b64, mime: "audio/webm" },
      { onSuccess: (d) => setResult(d) }
    );
  };

  return (
    <>
      <FloatingHowItWorks title={"Voice Lie Detection Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Voice Lie Detection Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Voice Lie Detection Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-br from-red-950/30 via-card/60 to-card/60 backdrop-blur-md border-red-900/40 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Mic className="h-4 w-4 text-red-400" /> Voice Lie Detection
          </CardTitle>
          <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-[10px]">15 cr</Badge>
        </div>
        <CardDescription className="text-xs">
          Record up to 60s. AI analyzes stress, hesitation, micro-pauses, and content.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          {!recording ? (
            <Button onClick={startRec} className="flex-1 bg-red-600 hover:bg-red-500 text-white" disabled={detect.isPending}>
              <Mic className="h-4 w-4 mr-2" /> {audioBlob ? "Re-record" : "Start Recording"}
            </Button>
          ) : (
            <Button onClick={stopRec} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white animate-pulse">
              <Square className="h-4 w-4 mr-2" /> Stop
            </Button>
          )}
        </div>
        {audioUrl && (
          <audio src={audioUrl} controls className="w-full h-10" />
        )}
        {audioBlob && (
          <Button onClick={analyze} disabled={detect.isPending} className="w-full bg-gradient-to-r from-red-600 to-amber-600 text-white">
            {detect.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing voice…</> : "Analyze for deception"}
          </Button>
        )}
        {result?.results && (
          <div className="mt-2 p-3 rounded-lg bg-black/40 border border-red-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Truthfulness</span>
              <span className="text-xl font-black text-red-300">{result.results.truthfulness_score}%</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30">
                <div className="text-amber-300 font-bold">Stress: {result.results.stress_score}%</div>
              </div>
              <div className="p-2 rounded bg-red-500/10 border border-red-500/30">
                <div className="text-red-300 font-bold">Hesitation: {result.results.hesitation_score}%</div>
              </div>
            </div>
            {result.results.deception_indicators?.length > 0 && (
              <div className="text-[11px] text-foreground/85">
                <div className="flex items-center gap-1 text-red-300 mb-1 font-bold">
                  <AlertTriangle className="h-3 w-3" /> Indicators
                </div>
                <ul className="list-disc list-inside space-y-0.5">
                  {result.results.deception_indicators.slice(0, 4).map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {result.transcript && (
              <p className="text-[10px] italic text-muted-foreground border-t border-border/40 pt-2">"{result.transcript.slice(0, 200)}{result.transcript.length > 200 ? "…" : ""}"</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
