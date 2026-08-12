import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Radio, Mic, MicOff, Video, VideoOff, Users } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";
import { startBroadcast, type BroadcastHandle } from "@/lib/concertWebRTC";

interface ComedyLiveStreamPlayerProps {
  showId: string;
  streamKey?: string;
}

export function ComedyLiveStreamPlayer({ showId }: ComedyLiveStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const broadcastRef = useRef<BroadcastHandle | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [peerViewers, setPeerViewers] = useState(0);
  const [presenceViewers, setPresenceViewers] = useState(0);

  const inIframe = typeof window !== "undefined" && window.self !== window.top;

  useEffect(() => {
    return () => {
      broadcastRef.current?.stop();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Real viewer count via presence (same engine as Live Concerts)
  useEffect(() => {
    if (!isStreaming) return;
    const ch = supabase.channel(`comedy-presence-${showId}`, {
      config: { presence: { key: `host-${showId}` } },
    });
    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState() as Record<string, unknown[]>;
      setPresenceViewers(Object.keys(state).filter((k) => !k.startsWith("host-")).length);
    }).subscribe((status) => {
      if (status === "SUBSCRIBED") void ch.track({ at: Date.now() });
    });
    return () => { supabase.removeChannel(ch); };
  }, [isStreaming, showId]);

  // Keep DB viewer count fresh while broadcasting
  useEffect(() => {
    if (!isStreaming) return;
    const sync = () => {
      void supabase
        .from("comedy_shows")
        .update({ viewer_count: Math.max(peerViewers, presenceViewers) })
        .eq("id", showId);
    };
    sync();
    const t = window.setInterval(sync, 5000);
    return () => window.clearInterval(t);
  }, [isStreaming, peerViewers, presenceViewers, showId]);

  const requestStream = async () => {
    const withTimeout = (p: Promise<MediaStream>, ms: number) =>
      Promise.race([
        p,
        new Promise<never>((_, reject) =>
          window.setTimeout(() => reject(new Error("__timeout__")), ms)
        ),
      ]);
    try {
      return await withTimeout(
        navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: { echoCancellation: true, noiseSuppression: true },
        }),
        15000
      );
    } catch (e: any) {
      if (e?.name === "NotAllowedError") throw e;
      return await withTimeout(navigator.mediaDevices.getUserMedia({ video: true }), 15000);
    }
  };

  const startStreaming = async () => {
    if (broadcastRef.current || isConnecting) return;
    setIsConnecting(true);
    setStreamError(null);
    try {
      if (!window.isSecureContext) throw new Error("Live streaming needs a secure (https) page");
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          inIframe
            ? "Camera is blocked in the embedded preview — open the show in a new tab"
            : "This browser does not support live camera streaming"
        );
      }
      const mediaStream = await requestStream();
      localStreamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
      broadcastRef.current = startBroadcast(showId, mediaStream, setPeerViewers);
      await supabase
        .from("comedy_shows")
        .update({ status: "live", started_at: new Date().toISOString() })
        .eq("id", showId);
      setIsStreaming(true);
      toast.success("You are live!");
    } catch (e: any) {
      const msg =
        e?.name === "NotAllowedError"
          ? "Camera access denied — allow camera & microphone for this site"
          : e?.name === "NotFoundError"
            ? "No camera found on this device"
            : e?.name === "NotReadableError"
              ? "Camera is used by another app — close it and try again"
              : e?.message === "__timeout__"
                ? inIframe
                  ? "Camera is blocked in the embedded preview — open the show in a new tab"
                  : "No answer from the camera — reload and allow the permission prompt"
                : e?.message || "Could not start the camera";
      setStreamError(msg);
      toast.error(msg);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    } finally {
      setIsConnecting(false);
    }
  };

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicEnabled(track.enabled);
  };
  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCamEnabled(track.enabled);
  };

  const stopStreaming = async () => {
    broadcastRef.current?.stop();
    broadcastRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsStreaming(false);

    await supabase
      .from("comedy_shows")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", showId);

    toast.info("Stream ended");
  };

  const viewers = Math.max(peerViewers, presenceViewers);

  return (
    <Card className="p-6">
      <FloatingHowItWorks
        title="Comedy Live Stream - How it works"
        steps={[
          { title: "Go live", desc: "Tap Start Streaming and allow camera & microphone access." },
          { title: "Broadcast", desc: "Your camera is sent directly to every viewer over WebRTC with a relay fallback." },
          { title: "Control", desc: "Mute the mic or hide the camera at any time during the set." },
          { title: "End", desc: "Stop Stream closes the show and marks it as ended." },
        ]}
      />
      <div className="space-y-4">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {isStreaming && (
            <>
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                <Radio className="h-4 w-4 animate-pulse" />
                <span className="font-bold text-xs">LIVE</span>
              </div>
              <Badge className="absolute top-4 right-4 gap-1">
                <Users className="h-3 w-3" /> {viewers}
              </Badge>
            </>
          )}
          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center text-center px-6">
              <p className="text-sm text-white/70">
                {streamError ?? "Start streaming to open your live comedy show"}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {!isStreaming ? (
            <Button onClick={startStreaming} disabled={isConnecting} className="flex-1">
              {isConnecting ? "Starting camera..." : "Start Streaming"}
            </Button>
          ) : (
            <>
              <Button variant="outline" size="icon" onClick={toggleMic} aria-label="Toggle microphone">
                {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={toggleCam} aria-label="Toggle camera">
                {camEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              <Button onClick={stopStreaming} variant="destructive" className="flex-1">
                Stop Stream
              </Button>
            </>
          )}
        </div>

        {streamError && <p className="text-sm text-destructive">{streamError}</p>}
      </div>
    </Card>
  );
}
