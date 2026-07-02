import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Bot, ShieldCheck, AlertOctagon } from "lucide-react";
import { useDeepfakeCheck } from "@/hooks/useLieDetectorTuning";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const VoiceCloneDetectorCard = () => {
  const [recording, setRecording] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [mime, setMime] = useState("audio/webm");
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const dfk = useDeepfakeCheck();
  const r = dfk.data?.results;

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType });
        setMime(mr.mimeType);
        const buf = await blob.arrayBuffer();
        const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        setAudioBase64(b64);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      recRef.current = mr;
      setRecording(true);
    } catch {
      alert("Microphone access denied");
    }
  };
  const stop = () => { recRef.current?.stop(); setRecording(false); };

  const onFile = async (f: File) => {
    setMime(f.type || "audio/mpeg");
    const buf = await f.arrayBuffer();
    setAudioBase64(btoa(String.fromCharCode(...new Uint8Array(buf))));
  };

  return (
    <>
      <FloatingHowItWorks title={"Voice Clone Detector Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Voice Clone Detector Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Voice Clone Detector Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-br from-cyan-950/40 via-card/80 to-red-950/30 border-cyan-500/30 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-300" />
          Voice Clone / Deepfake Check
          <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-500/40 text-[10px]">12 cr</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">Detect AI-generated / cloned voice in suspicious audio.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          {!recording ? (
            <Button size="sm" variant="outline" onClick={start} className="flex-1 border-cyan-500/30">
              <Mic className="w-3 h-3 mr-1" /> Record
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={stop} className="flex-1 animate-pulse">
              <Square className="w-3 h-3 mr-1" /> Stop
            </Button>
          )}
          <label className="flex-1">
            <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            <Button size="sm" variant="outline" className="w-full border-cyan-500/30" asChild>
              <span>Upload Audio</span>
            </Button>
          </label>
        </div>
        {audioBase64 && (
          <p className="text-[10px] text-emerald-300 font-mono">✓ Audio ready ({Math.round(audioBase64.length / 1024)}kb)</p>
        )}
        <Button
          className="w-full bg-gradient-to-r from-cyan-600 to-red-600 hover:from-cyan-700 hover:to-red-700"
          disabled={!audioBase64 || dfk.isPending}
          onClick={() => audioBase64 && dfk.mutate({ audio_base64: audioBase64, mime })}
        >
          {dfk.isPending ? "Scanning..." : "Run Deepfake Scan"}
        </Button>

        {r && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 pt-2 border-t border-cyan-500/20">
            <div className={`p-3 rounded-lg border ${r.is_synthetic ? "bg-red-500/15 border-red-500/40" : "bg-emerald-500/15 border-emerald-500/40"}`}>
              <div className="flex items-center gap-2 mb-1">
                {r.is_synthetic ? <AlertOctagon className="w-4 h-4 text-red-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                <span className={`font-bold text-sm ${r.is_synthetic ? "text-red-100" : "text-emerald-100"}`}>
                  {r.is_synthetic ? "Likely AI-Generated" : "Likely Authentic"}
                </span>
                <Badge variant="outline" className="ml-auto text-[10px]">{r.confidence}% conf</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{r.analysis}</p>
            </div>
            {r.indicators?.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-cyan-300 mb-1 font-mono">Synthetic Indicators</p>
                <ul className="text-xs space-y-1">
                  {r.indicators.map((it: string, i: number) => <li key={i} className="text-red-200">• {it}</li>)}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
