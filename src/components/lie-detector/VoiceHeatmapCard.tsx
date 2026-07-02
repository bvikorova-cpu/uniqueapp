import { useRef, useState } from "react";
import { Mic, Loader2, Square } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useVoiceHeatmap } from "@/hooks/useLieDetectorPro";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function VoiceHeatmapCard() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const m = useVoiceHeatmap();

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      chunksRef.current = [];
      r.ondataavailable = (e) => chunksRef.current.push(e.data);
      r.onstop = () => { setAudioBlob(new Blob(chunksRef.current, { type: "audio/webm" })); stream.getTracks().forEach(t => t.stop()); };
      r.start();
      recorderRef.current = r;
      setRecording(true);
    } catch { toast.error("Microphone access denied"); }
  };
  const stop = () => { recorderRef.current?.stop(); setRecording(false); };

  const analyze = async () => {
    if (!audioBlob) return;
    const buf = await audioBlob.arrayBuffer();
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    m.mutate({ audio_base64: b64, mime: "audio/webm" });
  };

  const colorMap: Record<string, string> = { green: "bg-green-500", yellow: "bg-yellow-500", orange: "bg-orange-500", red: "bg-red-500" };

  return (
    <>
      <FloatingHowItWorks title={"Voice Heatmap Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Voice Heatmap Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Voice Heatmap Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-orange-500/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-orange-400">
          <Mic className="w-5 h-5" /> Voice Stress Heatmap
          <Badge variant="outline" className="ml-auto text-[10px] border-orange-500/40 text-orange-300">10 cr</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          {!recording ? (
            <Button onClick={start} disabled={m.isPending} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
              <Mic className="w-4 h-4 mr-2" /> Record
            </Button>
          ) : (
            <Button onClick={stop} variant="destructive" className="flex-1">
              <Square className="w-4 h-4 mr-2" /> Stop
            </Button>
          )}
          {audioBlob && !recording && (
            <Button onClick={analyze} disabled={m.isPending} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
              {m.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze (10 cr)"}
            </Button>
          )}
        </div>
        {m.data && (
          <div className="space-y-2 pt-2 border-t border-orange-500/20">
            <div className="text-xs font-bold text-orange-400">Overall Stress: {m.data.overall_score}%</div>
            <div className="space-y-1">
              {(m.data.segments || []).slice(0, 8).map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <div className={`w-3 h-3 rounded-full ${colorMap[s.color] || "bg-gray-500"} shrink-0`} />
                  <span className="text-muted-foreground tabular-nums shrink-0">{Math.round(s.start)}s</span>
                  <span className="truncate flex-1">{s.text}</span>
                  <span className="font-mono text-orange-300">{s.stress_score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
