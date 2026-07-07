import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Mic, Video, PhoneCall, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  onJoin: () => void;
  joining?: boolean;
  disabledReason?: string;
}

/**
 * Client-side prep before joining a WebRTC call:
 *  - Browser compatibility check (WebRTC + getUserMedia)
 *  - Camera & mic device pickers with live preview
 *  - Live mic level meter
 *  - Explicit "Join call" CTA — parent starts signalling only after user clicks
 */
export default function PreCallLobby({ onJoin, joining, disabledReason }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraId] = useState<string | undefined>();
  const [micId, setMicId] = useState<string | undefined>();
  const [permission, setPermission] = useState<"idle" | "asking" | "granted" | "denied">("idle");
  const [level, setLevel] = useState(0);
  const [browserOk, setBrowserOk] = useState(true);

  useEffect(() => {
    const ok = typeof window !== "undefined"
      && "RTCPeerConnection" in window
      && !!navigator.mediaDevices?.getUserMedia;
    setBrowserOk(ok);
  }, []);

  useEffect(() => () => stopPreview(), []);

  useEffect(() => {
    if (permission === "granted") startPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraId, micId]);

  function stopPreview() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function requestPermissions() {
    if (!browserOk) return;
    setPermission("asking");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // Enumerate after permission so labels are populated.
      const devs = await navigator.mediaDevices.enumerateDevices();
      setCameras(devs.filter((d) => d.kind === "videoinput"));
      setMics(devs.filter((d) => d.kind === "audioinput"));
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      attachMeter(s);
      setPermission("granted");
    } catch (err) {
      console.error("[PreCallLobby] permission denied", err);
      setPermission("denied");
    }
  }

  async function startPreview() {
    stopPreview();
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: cameraId ? { deviceId: { exact: cameraId } } : true,
        audio: micId ? { deviceId: { exact: micId } } : true,
      });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      attachMeter(s);
    } catch (err) {
      console.error("[PreCallLobby] preview failed", err);
    }
  }

  function attachMeter(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        setLevel(Math.min(100, Math.round((sum / data.length) * 1.5)));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      /* meter is best-effort */
    }
  }

  function handleJoin() {
    // Release the preview stream — the call will re-acquire with the same devices.
    stopPreview();
    onJoin();
  }

  if (!browserOk) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Browser not supported</AlertTitle>
        <AlertDescription>
          Video calls need WebRTC + camera access. Try the latest Chrome, Safari, Firefox or Edge.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PhoneCall className="h-4 w-4" /> Get ready for your consultation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video overflow-hidden rounded-lg bg-muted">
          {permission === "granted" ? (
            <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {permission === "asking"
                ? "Waiting for camera permission…"
                : permission === "denied"
                  ? "Camera / mic access was denied."
                  : "Camera preview appears here once you allow access."}
            </div>
          )}
        </div>

        {permission !== "granted" ? (
          <Button onClick={requestPermissions} disabled={permission === "asking"} className="w-full">
            {permission === "asking" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Requesting access…
              </>
            ) : (
              <>
                <Video className="mr-2 h-4 w-4" /> Test camera & microphone
              </>
            )}
          </Button>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Video className="h-3 w-3" /> Camera
                </span>
                <Select value={cameraId} onValueChange={setCameraId}>
                  <SelectTrigger><SelectValue placeholder="Default camera" /></SelectTrigger>
                  <SelectContent>
                    {cameras.map((c) => (
                      <SelectItem key={c.deviceId} value={c.deviceId}>
                        {c.label || `Camera ${c.deviceId.slice(0, 5)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-1 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Mic className="h-3 w-3" /> Microphone
                </span>
                <Select value={micId} onValueChange={setMicId}>
                  <SelectTrigger><SelectValue placeholder="Default mic" /></SelectTrigger>
                  <SelectContent>
                    {mics.map((m) => (
                      <SelectItem key={m.deviceId} value={m.deviceId}>
                        {m.label || `Mic ${m.deviceId.slice(0, 5)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Mic level (talk to test)</p>
              <Progress value={level} className="h-2" />
            </div>

            <div className="flex items-center gap-2 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" /> Devices look good.
            </div>

            <Button
              onClick={handleJoin}
              disabled={joining || !!disabledReason}
              className="w-full"
              size="lg"
            >
              {joining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting…
                </>
              ) : (
                <>
                  <PhoneCall className="mr-2 h-4 w-4" /> Join call
                </>
              )}
            </Button>

            {disabledReason && (
              <p className="text-center text-xs text-muted-foreground">{disabledReason}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
