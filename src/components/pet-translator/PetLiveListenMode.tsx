import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mic, MicOff, Radio } from "lucide-react";
import { toast } from "sonner";

// Always-listening mode: detects loud sounds (peak above threshold) and notifies.
// Lightweight client-side detector — no recording uploaded; just notification.
export default function PetLiveListenMode({ onBack, onDetected }: { onBack: () => void; onDetected?: () => void }) {
  const [listening, setListening] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const stop = () => {
    setListening(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close().catch(() => {});
    streamRef.current = null; ctxRef.current = null;
  };
  useEffect(() => () => stop(), []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.fftSize);
      let lastFire = 0;
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let peak = 0;
        for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i] - 128));
        if (peak > 60 && Date.now() - lastFire > 3000) {
          lastFire = Date.now();
          const ts = new Date().toLocaleTimeString();
          setEvents((e) => [`${ts} — sound detected (peak ${peak})`, ...e].slice(0, 20));
          onDetected?.();
          if ("Notification" in window && Notification.permission === "granted") new Notification("🐾 Pet sound detected", { body: ts });
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
      setListening(true);
      if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold flex items-center gap-2"><Radio className="w-5 h-5 text-primary" /> Live Listen Mode</h2>
          <Badge variant={listening ? "default" : "outline"}>{listening ? "ACTIVE" : "OFF"}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Always-on local detector. When your pet vocalizes, you get a notification. Audio is never uploaded.</p>
        {listening
          ? <Button onClick={stop} variant="destructive" className="w-full"><MicOff className="w-4 h-4 mr-2" />Stop</Button>
          : <Button onClick={start} className="w-full"><Mic className="w-4 h-4 mr-2" />Start Listening</Button>}
        {events.length > 0 && (
          <div className="mt-4 space-y-1 text-sm font-mono max-h-48 overflow-auto">
            {events.map((e, i) => <div key={i} className="text-muted-foreground">{e}</div>)}
          </div>
        )}
      </Card>
    </div>
  );
}
