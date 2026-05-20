import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { startRingtone, stopRingtone } from "@/lib/ringtoneChime";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";

/**
 * Global incoming-call provider.
 *
 * Each authenticated user always subscribes to their own database-backed
 * signaling stream. Broadcast topics are intentionally not used for call
 * delivery because project realtime RLS only allows clients to write to their
 * own `user:<uid>` topic, not another user's topic.
 *
 * Signaling events:
 *   - "offer"         { from, fromName, conversationId, offer }
 *   - "answer"        { from, answer }
 *   - "ice-candidate" { from, candidate }
 *   - "end-call"      { from }
 *   - "cancel-call"   { from }   // caller hung up before pickup
 *   - "decline-call"  { from }   // callee rejected before pickup
 */

interface StartCallArgs {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
}

interface CallContextValue {
  startCall: (args: StartCallArgs) => Promise<void>;
  busy: boolean;
}

const CallContext = createContext<CallContextValue | null>(null);

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used within <CallProvider>");
  return ctx;
};

const ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

type CallState =
  | { status: "idle" }
  | { status: "outgoing"; peerId: string; peerName: string; conversationId: string }
  | { status: "incoming"; peerId: string; peerName: string; conversationId: string; offer: RTCSessionDescriptionInit }
  | { status: "in-call"; peerId: string; peerName: string; conversationId: string };

export const CallProvider = ({ children }: { children: ReactNode }) => {
  const { user, profile } = useAuth() as any;
  const { toast } = useToast();

  const [call, setCall] = useState<CallState>({ status: "idle" });
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const ownChannelRef = useRef<RealtimeChannel | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const myName: string =
    profile?.full_name || profile?.username || user?.email?.split("@")[0] || "Someone";

  // -- helpers -----------------------------------------------------------

  const sendToUser = useCallback(
    async (targetUserId: string, event: string, payload: Record<string, unknown>, conversationId?: string) => {
      if (!user?.id) return;
      try {
        const { error } = await (supabase as any).from("call_signals").insert({
          conversation_id: conversationId || (payload.conversationId as string | undefined) || null,
          sender_id: user.id,
          receiver_id: targetUserId,
          event,
          payload,
        });
        if (error) throw error;
        console.log("[call] signal saved", event, "→", targetUserId);
      } catch (e) {
        console.error("[call] sendToUser failed", event, e);
        toast({
          title: "Call signal failed",
          description: "Could not reach the other user. Please try again.",
          variant: "destructive",
        });
      }
    },
    [user?.id, toast],
  );

  const cleanupMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      try { pcRef.current.close(); } catch {}
      pcRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    pendingIceRef.current = [];
    setIsMuted(false);
    setIsVideoOff(false);
  }, []);

  const resetCall = useCallback(() => {
    stopRingtone();
    cleanupMedia();
    setCall({ status: "idle" });
  }, [cleanupMedia]);

  // -- media -------------------------------------------------------------

  const requestMedia = async (): Promise<MediaStream> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new DOMException(
        "Camera/mic API not available. Open this page in your main browser (not inside an in-app browser).",
        "NotSupportedError",
      );
    }
    try {
      return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err: any) {
      if (err?.name === "NotFoundError" || err?.name === "OverconstrainedError") {
        return await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      }
      throw err;
    }
  };

  const isInIframe = (() => {
    try { return typeof window !== "undefined" && window.self !== window.top; } catch { return true; }
  })();

  const explainMediaError = (err: any): string => {
    const name = err?.name || "";
    if (name === "NotAllowedError" || name === "SecurityError") {
      if (isInIframe) {
        return "Video call cannot run inside the Lovable preview (camera/mic are blocked in this iframe). Open the app in a new tab — https://uniqueapp.fun/messenger — and allow Camera & Microphone there.";
      }
      return "Camera/mic access was blocked. Tap the lock icon in the address bar → Site settings → allow Camera & Microphone, then reload.";
    }
    if (name === "NotFoundError") return "No camera or microphone was found on this device.";
    if (name === "NotReadableError") return "Camera or microphone is already in use by another app.";
    if (name === "NotSupportedError") return err.message || "Camera/mic API not available in this browser.";
    if (typeof window !== "undefined" && !window.isSecureContext) return "Video calls require HTTPS. Reload the page over https://.";
    return err?.message || "Failed to start the call.";
  };

  const buildPeer = useCallback(
    (peerId: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection(ICE_CONFIG);
      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          void sendToUser(peerId, "ice-candidate", {
            from: user?.id,
            candidate: event.candidate.toJSON(),
          }, callRef.current.status !== "idle" ? callRef.current.conversationId : undefined);
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          // best-effort: do nothing, user can end manually
        }
      };
      return pc;
    },
    [sendToUser, user?.id],
  );

  const drainPendingIce = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    for (const c of pendingIceRef.current) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
    }
    pendingIceRef.current = [];
  }, []);

  // -- own channel subscription -----------------------------------------

  // Keep latest call state in a ref so realtime callbacks never see stale data.
  const callRef = useRef<CallState>(call);
  useEffect(() => { callRef.current = call; }, [call]);

  useEffect(() => {
    if (!user?.id) return;
    console.log("[call] subscribing to call_signals for", user.id);

    const handleSignal = async (row: any) => {
      if (!row || row.receiver_id !== user.id) return;
      const payload = row.payload || {};
      console.log("[call] ←", row.event, "from", row.sender_id, payload);

      if (row.event === "offer") {
        if (callRef.current.status !== "idle") {
          console.log("[call] busy, auto-declining");
          void sendToUser(row.sender_id, "decline-call", { from: user.id, reason: "busy" }, row.conversation_id);
          return;
        }
        setCall({
          status: "incoming",
          peerId: row.sender_id,
          peerName: payload.fromName || "Someone",
          conversationId: row.conversation_id || payload.conversationId || "",
          offer: payload.offer,
        });
        startRingtone();
        try {
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            const n = new Notification("Incoming call", {
              body: `${payload.fromName || "Someone"} is calling you`,
              tag: "unique-incoming-call",
            });
            n.onclick = () => { try { window.focus(); n.close(); } catch {} };
          }
        } catch {}
        return;
      }

      if (row.event === "answer") {
        const pc = pcRef.current;
        if (!pc || !payload.answer) return;
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
          await drainPendingIce();
        } catch (e) {
          console.error("answer setRemoteDescription failed", e);
        }
        return;
      }

      if (row.event === "ice-candidate") {
        if (!payload.candidate) return;
        const pc = pcRef.current;
        if (!pc || !pc.remoteDescription) {
          pendingIceRef.current.push(payload.candidate);
          return;
        }
        try { await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch (e) {
          console.warn("addIceCandidate failed", e);
        }
        return;
      }

      if (row.event === "end-call") {
        toast({ title: "Call ended", description: "The other party hung up." });
        resetCall();
        return;
      }

      if (row.event === "cancel-call") {
        toast({ title: "Call canceled", description: "Caller ended before you picked up." });
        resetCall();
        return;
      }

      if (row.event === "decline-call") {
        toast({
          title: "Call declined",
          description: payload?.reason === "busy" ? "User is on another call." : "The other party declined.",
        });
        resetCall();
      }
    };

    const channel = supabase
      .channel(`call-signals:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "call_signals",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => { void handleSignal(payload.new); },
      )
      .subscribe((status, err) => {
        console.log("[call] call_signals status →", status, err || "");
      });

    ownChannelRef.current = channel;

    return () => {
      try { supabase.removeChannel(channel); } catch {}
      ownChannelRef.current = null;
      resetCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // -- actions -----------------------------------------------------------

  const startCall = useCallback(
    async ({ conversationId, otherUserId, otherUserName }: StartCallArgs) => {
      console.log("[call] startCall →", { otherUserId, otherUserName, conversationId });
      if (!user?.id) { console.warn("[call] no user, abort"); return; }
      if (callRef.current.status !== "idle") { console.warn("[call] already busy, abort"); return; }
      try {
        const stream = await requestMedia();
        console.log("[call] got local media tracks:", stream.getTracks().map(t => t.kind));
        localStreamRef.current = stream;
        const pc = buildPeer(otherUserId);
        pcRef.current = pc;
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        setCall({ status: "outgoing", peerId: otherUserId, peerName: otherUserName, conversationId });

        await sendToUser(otherUserId, "offer", {
          from: user.id,
          fromName: myName,
          conversationId,
          offer,
        }, conversationId);
      } catch (err: any) {
        console.error("[call] startCall failed", err);
        toast({ title: "Error", description: explainMediaError(err), variant: "destructive" });
        resetCall();
      }
    },
    [user?.id, buildPeer, sendToUser, myName, toast, resetCall],
  );

  const acceptIncoming = useCallback(async () => {
    if (call.status !== "incoming") return;
    stopRingtone();
    try {
      const stream = await requestMedia();
      localStreamRef.current = stream;
      const pc = buildPeer(call.peerId);
      pcRef.current = pc;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(call.offer));
      await drainPendingIce();

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await sendToUser(call.peerId, "answer", { from: user!.id, answer }, call.conversationId);

      setCall({
        status: "in-call",
        peerId: call.peerId,
        peerName: call.peerName,
        conversationId: call.conversationId,
      });
    } catch (err: any) {
      console.error("acceptIncoming failed", err);
      toast({ title: "Error", description: explainMediaError(err), variant: "destructive" });
      void sendToUser(call.peerId, "decline-call", { from: user!.id, reason: "media-error" });
      resetCall();
    }
  }, [call, buildPeer, drainPendingIce, sendToUser, user, toast, resetCall]);

  const declineIncoming = useCallback(() => {
    if (call.status !== "incoming") return;
    void sendToUser(call.peerId, "decline-call", { from: user!.id }, call.conversationId);
    resetCall();
  }, [call, sendToUser, user, resetCall]);

  const cancelOutgoing = useCallback(() => {
    if (call.status !== "outgoing") return;
    void sendToUser(call.peerId, "cancel-call", { from: user!.id }, call.conversationId);
    resetCall();
  }, [call, sendToUser, user, resetCall]);

  const endActive = useCallback(() => {
    if (call.status === "idle") return;
    const peerId = (call as any).peerId;
    if (peerId) void sendToUser(peerId, "end-call", { from: user!.id }, (call as any).conversationId);
    resetCall();
  }, [call, sendToUser, user, resetCall]);

  // promote outgoing -> in-call when remote answer arrives & connection ready
  useEffect(() => {
    if (call.status !== "outgoing") return;
    const pc = pcRef.current;
    if (!pc) return;
    const onState = () => {
      if (pc.connectionState === "connected") {
        setCall((c) =>
          c.status === "outgoing"
            ? { status: "in-call", peerId: c.peerId, peerName: c.peerName, conversationId: c.conversationId }
            : c,
        );
      }
    };
    pc.addEventListener("connectionstatechange", onState);
    return () => pc.removeEventListener("connectionstatechange", onState);
  }, [call.status]);

  // attach local stream to <video>
  useEffect(() => {
    if (call.status === "outgoing" || call.status === "in-call") {
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }
  }, [call.status]);

  // -- controls ----------------------------------------------------------

  const toggleMute = () => {
    const t = localStreamRef.current?.getAudioTracks()[0];
    if (t) { t.enabled = !t.enabled; setIsMuted(!t.enabled); }
  };
  const toggleVideo = () => {
    const t = localStreamRef.current?.getVideoTracks()[0];
    if (t) { t.enabled = !t.enabled; setIsVideoOff(!t.enabled); }
  };

  // -- UI ---------------------------------------------------------------

  const overlay =
    typeof document !== "undefined" && call.status !== "idle"
      ? createPortal(
          <>
            {call.status === "incoming" && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <Card className="bg-background p-8 rounded-lg shadow-xl text-center max-w-sm w-[90%]">
                  <Phone className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
                  <h2 className="text-2xl font-bold mb-2">Incoming call</h2>
                  <p className="text-muted-foreground mb-6">{call.peerName} is calling you</p>
                  <div className="flex gap-3">
                    <Button onClick={acceptIncoming} className="flex-1">
                      <Phone className="h-4 w-4 mr-2" /> Accept
                    </Button>
                    <Button onClick={declineIncoming} variant="destructive" className="flex-1">
                      <PhoneOff className="h-4 w-4 mr-2" /> Reject
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {(call.status === "outgoing" || call.status === "in-call") && (
              <div className="fixed inset-0 z-[9999] bg-black">
                <div className="relative h-full w-full flex items-center justify-center">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute bottom-24 right-4 w-32 h-44 sm:w-48 sm:h-36 rounded-lg object-cover border-2 border-white shadow-lg"
                  />
                  {call.status === "outgoing" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <div className="text-center text-white">
                        <Phone className="h-16 w-16 mx-auto mb-4 animate-pulse" />
                        <p className="text-xl">Calling {call.peerName}…</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                    <Button
                      onClick={toggleMute}
                      variant={isMuted ? "destructive" : "secondary"}
                      size="icon"
                      className="rounded-full h-12 w-12"
                    >
                      {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button
                      onClick={toggleVideo}
                      variant={isVideoOff ? "destructive" : "secondary"}
                      size="icon"
                      className="rounded-full h-12 w-12"
                    >
                      {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    </Button>
                    <Button
                      onClick={call.status === "outgoing" ? cancelOutgoing : endActive}
                      variant="destructive"
                      size="icon"
                      className="rounded-full h-12 w-12"
                    >
                      <PhoneOff className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>,
          document.body,
        )
      : null;

  return (
    <CallContext.Provider value={{ startCall, busy: call.status !== "idle" }}>
      {children}
      {overlay}
    </CallContext.Provider>
  );
};
