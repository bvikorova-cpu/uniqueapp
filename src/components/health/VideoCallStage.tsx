import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2 } from "lucide-react";

interface Props {
  appointmentId: string;
}

/**
 * Simplified WebRTC 1:1 stage using Supabase Realtime for signaling.
 * Uses public STUN + optional TURN from `video-call-token` edge fn.
 * Falls back gracefully when getUserMedia or WebRTC is unavailable.
 */
export default function VideoCallStage({ appointmentId }: Props) {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [role, setRole] = useState<"doctor" | "patient" | null>(null);
  const [status, setStatus] = useState<"idle" | "joining" | "in_call" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);

  useEffect(() => () => cleanup(), []);

  function cleanup() {
    pcRef.current?.close();
    pcRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function join() {
    setStatus("joining");
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("video-call-token", {
        body: { appointment_id: appointmentId },
      });
      if (fnErr || !data?.room_id) throw new Error(fnErr?.message ?? "token_failed");
      setRole(data.role);

      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = media;
      if (localRef.current) localRef.current.srcObject = media;

      const pc = new RTCPeerConnection(data.ice_config);
      pcRef.current = pc;
      media.getTracks().forEach((t) => pc.addTrack(t, media));

      pc.ontrack = (e) => {
        if (remoteRef.current) remoteRef.current.srcObject = e.streams[0];
      };

      const channel = supabase.channel(`video:${data.room_id}`);
      pc.onicecandidate = (e) => {
        if (e.candidate)
          channel.send({ type: "broadcast", event: "ice", payload: e.candidate.toJSON() });
      };
      channel
        .on("broadcast", { event: "offer" }, async ({ payload }) => {
          if (data.role !== "patient") return;
          await pc.setRemoteDescription(payload);
          const ans = await pc.createAnswer();
          await pc.setLocalDescription(ans);
          channel.send({ type: "broadcast", event: "answer", payload: ans });
        })
        .on("broadcast", { event: "answer" }, async ({ payload }) => {
          if (data.role !== "doctor") return;
          await pc.setRemoteDescription(payload);
        })
        .on("broadcast", { event: "ice" }, async ({ payload }) => {
          try { await pc.addIceCandidate(payload); } catch { /* noop */ }
        })
        .subscribe(async (s) => {
          if (s === "SUBSCRIBED" && data.role === "doctor") {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            channel.send({ type: "broadcast", event: "offer", payload: offer });
          }
        });

      setStatus("in_call");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setStatus("error");
      cleanup();
    }
  }

  function toggleMute() {
    const enabled = streamRef.current?.getAudioTracks().some((t) => t.enabled);
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !enabled));
    setMuted(!!enabled);
  }
  function toggleCam() {
    const enabled = streamRef.current?.getVideoTracks().some((t) => t.enabled);
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !enabled));
    setCamOff(!!enabled);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video consultation {role ? `— ${role}` : ""}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <video ref={remoteRef} autoPlay playsInline className="w-full rounded-lg bg-black aspect-video" />
          <video ref={localRef} autoPlay playsInline muted className="w-full rounded-lg bg-black aspect-video" />
        </div>
        {status !== "in_call" ? (
          <Button onClick={join} disabled={status === "joining"}>
            {status === "joining" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Join call
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={toggleMute}>
              {muted ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
              {muted ? "Unmute" : "Mute"}
            </Button>
            <Button variant="secondary" onClick={toggleCam}>
              {camOff ? <VideoOff className="mr-2 h-4 w-4" /> : <Video className="mr-2 h-4 w-4" />}
              {camOff ? "Camera on" : "Camera off"}
            </Button>
            <Button variant="destructive" onClick={() => { cleanup(); setStatus("idle"); }}>
              <PhoneOff className="mr-2 h-4 w-4" /> End
            </Button>
          </div>
        )}
        {error && <p className="text-sm text-destructive">Error: {error}</p>}
      </CardContent>
    </Card>
  );
}
