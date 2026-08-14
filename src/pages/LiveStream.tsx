import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Video, Send, Users, Gift, ArrowLeft, VideoOff } from "lucide-react";
import { Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from "@/components/ui/dialog";
import { useOneOffPaymentVerify } from "@/hooks/useOneOffPaymentVerify";
import { SuperChatDialog } from "@/components/live/SuperChatDialog";
import { SuperChatFeed } from "@/components/live/SuperChatFeed";
import { SupportersLeaderboard } from "@/components/live/SupportersLeaderboard";
import { StreamTierGate } from "@/components/live/StreamTierGate";
import { StreamHighlights } from "@/components/live/StreamHighlights";
import { ChatMuteBanner } from "@/components/live/ChatMuteBanner";
import { ReportMessageButton } from "@/components/live/ReportMessageButton";
import { HideMessageButton } from "@/components/live/HideMessageButton";
import { useStreamViewerSession } from "@/hooks/useStreamViewerSession";
import { startBroadcast, startViewer, type BroadcastHandle, type ViewerHandle } from "@/lib/concertWebRTC";


interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  is_hidden?: boolean;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

interface GiftType {
  id: string;
  name: string;
  icon: string;
  price: number;
}

const GIFT_IDS = { rose: "00000000-0000-0000-0000-000000000001",
  heart: "00000000-0000-0000-0000-000000000002",
  diamond: "00000000-0000-0000-0000-000000000003",
  crown: "00000000-0000-0000-0000-000000000004" };

export default function LiveStream() {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [peerViewers, setPeerViewers] = useState(0);
  const [presenceViewers, setPresenceViewers] = useState(0);
  const [connState, setConnState] = useState<RTCPeerConnectionState | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const broadcastRef = useRef<BroadcastHandle | null>(null);
  const viewerRef = useRef<ViewerHandle | null>(null);


  // Fetch available gifts (all platform gifts, cheapest first)
  const { data: gifts = [], isLoading: giftsLoading } = useQuery({
    queryKey: ["platform-gifts", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_gifts")
        .select("*")
        .order("price", { ascending: true });

      if (error) throw error;
      return (data || []) as GiftType[];
    } });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const isValidStreamId = !!streamId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(streamId);

  // Fetch stream details
  const { data: stream } = useQuery({
    queryKey: ["stream", streamId],
    enabled: isValidStreamId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_streams")
        .select(`
          *,
          influencer_profiles(
            user_id,
            display_name,
            profile_photo_url
          )
        `)
        .eq("id", streamId)
        .single();

      if (error) throw error;
      return data;
    } });

  // Fetch messages with realtime updates
  const { data: messages = [] } = useQuery({
    queryKey: ["stream-messages", streamId],
    enabled: isValidStreamId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stream_messages")
        .select("*")
        .eq("stream_id", streamId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;
      
      // Fetch user profiles separately
      const userIds = [...new Set(data.map(m => m.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      // Merge profiles with messages
      return data.map(msg => ({
        ...msg,
        profiles: profiles?.find(p => p.id === msg.user_id)
      })) as Message[];
    },
    refetchInterval: 2000 });

  // Join stream
  useEffect(() => { if (!user || !streamId) return;

    const joinStream = async () => {
      await supabase.from("stream_viewers").insert({
        stream_id: streamId,
        user_id: user.id });
    };

    const leaveStream = async () => {
      await supabase
        .from("stream_viewers")
        .update({ left_at: new Date().toISOString() })
        .eq("stream_id", streamId)
        .eq("user_id", user.id)
        .is("left_at", null);
    };

    joinStream();
    return () => {
      leaveStream();
    };
  }, [user, streamId]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase.from("stream_messages").insert({ stream_id: streamId,
        user_id: user.id,
        message: text });

      if (error) throw error;
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["stream-messages", streamId] });
    },
    onError: (error: any) => {
      const msg = String(error?.message ?? "");
      if (msg.includes("temporarily muted")) {
        toast.error("You are temporarily muted in this chat");
      } else {
        toast.error("Error sending message");
      }
      console.error(error);
    } });

  // Send gift mutation
  const sendGiftMutation = useMutation({
    mutationFn: async (gift: GiftType) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase.functions.invoke("send-stream-gift", { body: {
          streamId,
          giftId: gift.id,
          message: giftMessage } });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, gift) => {
      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success(`Opening payment for ${gift.name} ${gift.icon}`);
        setGiftMessage("");
      }
    },
    onError: (error) => {
      toast.error("Error sending gift");
      console.error(error);
    } });

  // ─── Live streaming (same WebRTC engine as Live Concerts) ───────────────
  const isOwner = !!user && !!stream && user.id === stream.influencer_profiles?.user_id;
  const inIframe = typeof window !== "undefined" && window.self !== window.top;

  // Some embedded previews (mobile Chrome in an iframe without allow="camera")
  // never resolve or reject getUserMedia — detect that up-front.
  const cameraBlockedByPolicy = () => {
    try {
      const fp: any = (document as any).featurePolicy || (document as any).permissionsPolicy;
      if (fp?.allowsFeature) return !fp.allowsFeature("camera");
    } catch {
      /* ignore */
    }
    return false;
  };

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
        8000
      );
    } catch (e: any) {
      if (e?.name === "NotAllowedError") throw e;
      return await withTimeout(navigator.mediaDevices.getUserMedia({ video: true }), 8000);
    }
  };


  // Start broadcasting (influencer)
  const startBroadcasting = async () => {
    if (broadcastRef.current || isConnecting) return;
    setIsConnecting(true);
    setStreamError(null);
    try {
      if (!window.isSecureContext) throw new Error("Live streaming needs a secure (https) page");
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          inIframe
            ? "Camera is blocked in the embedded preview — open the stream in a new tab"
            : "This browser does not support live camera streaming"
        );
      }
      if (inIframe && cameraBlockedByPolicy()) {
        throw new Error("Camera is blocked in the embedded preview — open the stream in a new tab");
      }
      const mediaStream = await requestStream();

      localStreamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
      broadcastRef.current = startBroadcast(streamId!, mediaStream, setPeerViewers);
      await supabase
        .from("live_streams")
        .update({ is_live: true, started_at: new Date().toISOString() })
        .eq("id", streamId!);
      queryClient.invalidateQueries({ queryKey: ["stream", streamId] });
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
                  ? "Camera is blocked in the embedded preview — open the stream in a new tab"
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

  // Stop streaming / leave
  const stopStreaming = async (opts?: { silent?: boolean }) => {
    broadcastRef.current?.stop();
    broadcastRef.current = null;
    viewerRef.current?.stop();
    viewerRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsStreaming(false);

    try {
      if (isOwner && stream?.is_live) {
        await supabase
          .from("live_streams")
          .update({ is_live: false, ended_at: new Date().toISOString() })
          .eq("id", stream.id);
        queryClient.invalidateQueries({ queryKey: ["stream", streamId] });
      }
    } catch (e) {
      console.error("Failed to mark stream ended:", e);
    }

    if (!opts?.silent) toast.info("Stream ended");
  };

  // Viewers connect automatically over WebRTC (TURN relay fallback included)
  useEffect(() => {
    if (!streamId || !stream?.is_live || isOwner || viewerRef.current) return;
    setIsConnecting(true);
    viewerRef.current = startViewer(
      streamId,
      (remote) => {
        if (videoRef.current) {
          videoRef.current.srcObject = remote;
          void videoRef.current.play().catch(() => {});
        }
        setIsStreaming(true);
        setIsConnecting(false);
      },
      (state) => {
        setConnState(state);
        if (state === "connected") setIsConnecting(false);
        if (state === "failed") setIsStreaming(false);
      }
    );
    return () => {
      viewerRef.current?.stop();
      viewerRef.current = null;
    };
  }, [streamId, stream?.is_live, isOwner]);

  // Real viewer count via presence (same source for host and fans)
  useEffect(() => {
    if (!streamId || !stream?.is_live) return;
    const ch = supabase.channel(`stream-presence-${streamId}`, {
      config: { presence: { key: isOwner ? `host-${streamId}` : user?.id || `guest-${Math.random()}` } },
    });
    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState() as Record<string, unknown[]>;
      setPresenceViewers(Object.keys(state).filter((k) => !k.startsWith("host-")).length);
    }).subscribe((status) => {
      if (status === "SUBSCRIBED") void ch.track({ at: Date.now() });
    });
    return () => { supabase.removeChannel(ch); };
  }, [streamId, stream?.is_live, isOwner, user?.id]);

  // Keep the DB viewer count fresh while broadcasting
  useEffect(() => {
    if (!isOwner || !isStreaming || !streamId) return;
    const sync = () => {
      void supabase
        .from("live_streams")
        .update({ viewer_count: Math.max(peerViewers, presenceViewers) })
        .eq("id", streamId);
    };
    sync();
    const t = window.setInterval(sync, 5000);
    return () => window.clearInterval(t);
  }, [isOwner, isStreaming, peerViewers, presenceViewers, streamId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      broadcastRef.current?.stop();
      viewerRef.current?.stop();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Analytics: track viewer session (join/leave + watch time)
  useStreamViewerSession({
    streamId: streamId ?? null,
    currentUserId: user?.id ?? null,
    isOwner: !!user && !!stream && user.id === stream.influencer_profiles?.user_id,
    isLive: !!stream?.is_live,
  });

  if (!stream) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading stream...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <Button
          onClick={() => navigate("/influ-king")}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <StreamTierGate
          streamId={stream.id}
          minTier={(stream as any).min_tier ?? null}
          creatorUserId={stream.influencer_profiles?.user_id ?? null}
          currentUserId={user?.id ?? null}
        >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="relative bg-black aspect-video rounded-t-lg overflow-hidden">
                  <video 
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted={user?.id === stream.influencer_profiles?.user_id}
                  />
                  
                  {!isStreaming && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
                      <div className="text-center text-primary-foreground space-y-4">
                        <Video className="h-20 w-20 mx-auto opacity-50" />
                        {isOwner ? (
                          <>
                            <p className={`text-sm ${streamError ? "font-medium text-destructive" : "text-lg"}`}>
                              {streamError ?? "Turn on your camera to go live"}
                            </p>
                            <div className="flex flex-col items-center gap-2">
                              <Button
                                onClick={startBroadcasting}
                                size="lg"
                                disabled={isConnecting}
                                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                              >
                                {isConnecting ? "Connecting camera..." : "📹 Turn camera on & go live"}
                              </Button>
                              {inIframe && (
                                <Button
                                  variant="outline"
                                  onClick={() => window.open(window.location.href, "_blank", "noopener")}
                                >
                                  Open stream in new tab
                                </Button>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-lg">
                              {connState === "failed"
                                ? "Connection lost — try reconnecting"
                                : isConnecting || connState === "connecting"
                                  ? "Connecting to stream..."
                                  : stream.is_live
                                    ? "Waiting for the creator's camera..."
                                    : "Stream is not live yet"}
                            </p>
                            {stream.is_live && (
                              <Button variant="outline" onClick={() => viewerRef.current?.reconnect()}>
                                Reconnect
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge variant="destructive" className={isStreaming ? "animate-pulse" : ""}>
                      🔴 {isStreaming ? "LIVE" : "OFFLINE"}
                    </Badge>
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      {Math.max(presenceViewers, peerViewers, stream.viewer_count ?? 0)}
                    </Badge>
                  </div>
                </div>

                {isOwner && isStreaming && (
                  <div className="flex flex-col gap-2 p-4 border-b">
                    <Button variant="outline" onClick={toggleMic} className="w-full justify-start gap-2">
                      {micEnabled ? "🎙️ Mute" : "🔇 Unmute"}
                    </Button>
                    <Button variant="outline" onClick={toggleCam} className="w-full justify-start gap-2">
                      {camEnabled ? "📷 Hide camera" : "📷 Show camera"}
                    </Button>
                    <Button variant="destructive" onClick={() => stopStreaming()} className="w-full">
                      <VideoOff className="h-4 w-4 mr-2" /> End stream
                    </Button>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={stream.influencer_profiles?.profile_photo_url} />
                      <AvatarFallback>
                        {stream.influencer_profiles?.display_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-bold">{stream.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {stream.influencer_profiles?.display_name}
                      </p>
                    </div>
                  </div>
                  {stream.description && (
                    <p className="text-muted-foreground">{stream.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center justify-between">
                  <span>Live Chat</span>
                  <div className="flex items-center gap-2">
                    {streamId && <SuperChatDialog streamId={streamId} />}
                    <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Gift className="h-4 w-4 mr-2" />
                        Gifts
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Send a virtual gift</DialogTitle>
                        <DialogDescription>
                          Support your favorite influencer
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <Input
                          placeholder="Add a message to the gift (optional)"
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                        />
                        {giftsLoading ? (
                          <p className="text-sm text-muted-foreground text-center py-6">
                            Loading gifts...
                          </p>
                        ) : gifts.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-6">
                            No gifts available right now.
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {gifts.map((gift) => (
                              <Button
                                key={gift.id}
                                variant="outline"
                                className="h-24 flex flex-col gap-1 p-2"
                                onClick={() => sendGiftMutation.mutate(gift)}
                                disabled={!user || sendGiftMutation.isPending}
                              >
                                <span className="text-3xl leading-none">{gift.icon}</span>
                                <span className="text-xs truncate max-w-full">{gift.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  €{Number(gift.price).toFixed(2)}
                                </span>
                              </Button>
                            ))}
                          </div>
                        )}
                        {!user && (
                          <p className="text-xs text-muted-foreground text-center">
                            Sign in to send a gift.
                          </p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  </div>
                </CardTitle>
                {streamId && (
                  <div className="pt-2">
                    <SuperChatFeed streamId={streamId} />
                  </div>
                )}
              </CardHeader>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages
                    .filter((m) => {
                      const isOwner = user?.id === stream?.influencer_profiles?.user_id;
                      return !m.is_hidden || isOwner || m.user_id === user?.id;
                    })
                    .map((msg) => {
                      const isOwner = user?.id === stream?.influencer_profiles?.user_id;
                      return (
                        <div key={msg.id} className={`flex gap-2 group ${msg.is_hidden ? "opacity-50" : ""}`}>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={msg.profiles?.avatar_url} />
                            <AvatarFallback>
                              {msg.profiles?.full_name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium flex items-center gap-2">
                              {msg.profiles?.full_name || "User"}
                              {msg.is_hidden && <Badge variant="outline" className="text-[10px] px-1 py-0">hidden</Badge>}
                            </p>
                            <p className="text-sm text-muted-foreground break-words">{msg.message}</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 flex items-start gap-1">
                            {user && user.id !== msg.user_id && (
                              <ReportMessageButton messageId={msg.id} streamId={streamId!} reporterId={user.id} />
                            )}
                            {isOwner && (
                              <HideMessageButton messageId={msg.id} isHidden={!!msg.is_hidden} moderatorId={user.id} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                {streamId && user && <ChatMuteBanner streamId={streamId} userId={user.id} />}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (message.trim()) {
                      sendMessageMutation.mutate(message);
                    }
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={user ? "Write a message..." : "Log in to chat"}
                    disabled={!user}
                  />
                  <Button type="submit" disabled={!user || !message.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>
        {streamId && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <SupportersLeaderboard streamId={streamId} />
            {!stream.is_live && (
              <StreamHighlights streamId={streamId} streamTitle={stream.title} />
            )}
          </div>
        )}
        </StreamTierGate>
      </div>
    </div>
  );
}
