import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, CameraOff, Loader2, Mic, MicOff, Radio, Users } from "lucide-react";
import { toast } from "sonner";
import { startBroadcast, type BroadcastHandle } from "@/lib/concertWebRTC";

interface Props {
  concertId: string;
  title: string;
  scheduledAt: string;
  status: string;
  onStatusChange: (status: "live" | "ended") => Promise<void> | void;
}

const fmtCountdown = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h > 0 ? `${h}h ` : ""}${m}m ${sec}s`;
};

/**
 * Artist camera studio: opens the camera, auto-starts the broadcast at the
 * scheduled time and streams live to ticket holders over WebRTC.
 */
export const ConcertBroadcaster = ({ concertId, title, scheduledAt, status, onStatusChange }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const broadcastRef = useRef<BroadcastHandle | null>(null);
  const startingRef = useRef(false);

  const [starting, setStarting] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [live, setLive] = useState(status === "live");
  const [viewers, setViewers] = useState(0);
  const [now, setNow] = useState(Date.now());

  const scheduledMs = new Date(scheduledAt).getTime();
  const dueMs = scheduledMs - now;

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const stopEverything = () => {
    broadcastRef.current?.stop();
    broadcastRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
    setViewers(0);
  };

  useEffect(() => () => stopEverything(), []);

  // Camera/mic is blocked inside the Lovable preview iframe unless the frame
  // explicitly allows it — detect that so the artist gets a real explanation
  // instead of a button that spins forever.
  const inIframe = typeof window !== "undefined" && window.self !== window.top;

  const goLive = async () => {
    if (startingRef.current || broadcastRef.current) return;
    startingRef.current = true;
    setStarting(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("This browser does not support live camera streaming");
      }
      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: { echoCancellation: true, noiseSuppression: true },
        }),
        new Promise<never>((_, reject) =>
          window.setTimeout(
            () =>
              reject(
                new Error(
                  inIframe
                    ? "Camera is blocked in the embedded preview — open the studio in a new tab"
                    : "No answer from the camera — check the browser permission and try again"
                )
              ),
            25000
          )
        ),
      ]);
      streamRef.current = stream;
      setCameraOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      broadcastRef.current = startBroadcast(concertId, stream, setViewers);
      if (status !== "live") await onStatusChange("live");
      setLive(true);
      toast.success("You are live — ticket holders can see your camera");
    } catch (e: any) {
      stopEverything();
      toast.error(
        e?.name === "NotAllowedError"
          ? "Camera access denied — allow camera & microphone in your browser"
          : e?.name === "NotFoundError"
            ? "No camera found on this device"
            : e?.message || "Could not start the camera"
      );
    } finally {
      startingRef.current = false;
      setStarting(false);
    }
  };

  const endStream = async () => {
    stopEverything();
    setLive(false);
    await onStatusChange("ended");
  };

  // Auto-start the camera at the scheduled time (browsers require a user
  // gesture inside an iframe, so only auto-start on a top-level page).
  useEffect(() => {
    if (status === "ended" || inIframe) return;
    if (broadcastRef.current || startingRef.current) return;
    if (dueMs <= 0) void goLive();
  }, [dueMs <= 0, status, inIframe]);


  // Keep viewer count in the DB fresh so fans see it
  useEffect(() => {
    if (!live) return;
    const t = window.setInterval(() => {
      void supabase.from("live_concert_streams").update({ viewer_count: viewers }).eq("id", concertId);
    }, 15000);
    return () => window.clearInterval(t);
  }, [live, viewers, concertId]);

  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicEnabled(track.enabled);
  };
  const toggleCam = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCamEnabled(track.enabled);
  };

  return (
    <Card className={live ? "border-destructive/50" : ""}>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <Radio className={`h-4 w-4 ${live ? "text-destructive animate-pulse" : "text-primary"}`} />
          Camera studio — {title}
          {live && <Badge className="bg-destructive">LIVE</Badge>}
          {live && (
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />{viewers}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="aspect-video rounded-lg overflow-hidden bg-black relative">
          <video ref={videoRef} muted playsInline autoPlay className="h-full w-full object-cover" />
          {!cameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-4">
              <Camera className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {dueMs > 0
                  ? `Camera starts automatically in ${fmtCountdown(dueMs)}`
                  : "Camera is off — start the stream to go live"}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {!live ? (
            <Button onClick={goLive} disabled={starting} className="gap-2">
              {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />}
              {dueMs > 0 ? "Start early" : "Turn camera on & go live"}
            </Button>
          ) : null}
          {!live && inIframe && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => window.open(window.location.href, "_blank", "noopener")}
            >
              <ExternalLink className="h-4 w-4" /> Open studio in new tab
            </Button>
          )}
          {live ? (

          ) : (
            <>
              <Button variant="outline" onClick={toggleMic} className="gap-2">
                {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                {micEnabled ? "Mute" : "Unmute"}
              </Button>
              <Button variant="outline" onClick={toggleCam} className="gap-2">
                {camEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                {camEnabled ? "Hide camera" : "Show camera"}
              </Button>
              <Button variant="destructive" onClick={endStream}>End stream</Button>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Keep this page open while streaming — only fans with a paid ticket can watch.
        </p>
      </CardContent>
    </Card>
  );
};

export default ConcertBroadcaster;
