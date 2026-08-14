import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { startViewer, type ViewerHandle } from "@/lib/concertWebRTC";
import { ComedyLiveChat } from "@/components/comedy/ComedyLiveChat";

export default function ComedyLiveViewer() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tipMessage, setTipMessage] = useState("");
  const [isHost, setIsHost] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewerRef = useRef<ViewerHandle | null>(null);
  const [hasStream, setHasStream] = useState(false);
  const [connState, setConnState] = useState<RTCPeerConnectionState | null>(null);
  const [presenceViewers, setPresenceViewers] = useState(0);
  const [rtcKey, setRtcKey] = useState(0);

  useEffect(() => {
    loadShow();
  }, [showId]);

  const loadShow = async () => {
    const { data, error } = await supabase
      .from("comedy_shows")
      .select("*, comedian:comedian_profiles(*)")
      .eq("id", showId)
      .single();

    if (error) {
      console.error("Error loading show:", error);
      toast.error("Show not found");
      navigate("/comedy-club");
      return;
    }

    setShow(data);
    setLoading(false);

    const { data: auth } = await supabase.auth.getUser();
    setIsHost(!!auth.user && (data as any)?.comedian?.user_id === auth.user.id);
  };

  const isLive = show?.status === "live";


  // Viewers connect automatically over WebRTC (same engine as Live Concerts)
  useEffect(() => {
    if (!showId || !isLive) return;
    viewerRef.current?.stop();
    viewerRef.current = startViewer(
      showId,
      (remote) => {
        if (videoRef.current) {
          videoRef.current.srcObject = remote;
          void videoRef.current.play().catch(() => {});
        }
        setHasStream(true);
      },
      (state) => {
        setConnState(state);
        if (state === "failed" || state === "closed") setHasStream(false);
      }
    );
    return () => {
      viewerRef.current?.stop();
      viewerRef.current = null;
    };
  }, [showId, isLive, rtcKey]);

  // Real viewer count via presence
  useEffect(() => {
    if (!showId || !isLive) return;
    const ch = supabase.channel(`comedy-presence-${showId}`, {
      config: { presence: { key: `viewer-${Math.random().toString(36).slice(2)}` } },
    });
    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState() as Record<string, unknown[]>;
      setPresenceViewers(Object.keys(state).filter((k) => !k.startsWith("host-")).length);
    }).subscribe((status) => {
      if (status === "SUBSCRIBED") void ch.track({ at: Date.now() });
    });
    return () => { supabase.removeChannel(ch); };
  }, [showId, isLive]);

  // Keep the show status fresh so viewers auto-connect when the comedian goes live
  useEffect(() => {
    if (!showId) return;
    const t = window.setInterval(async () => {
      const { data } = await supabase
        .from("comedy_shows")
        .select("status, viewer_count")
        .eq("id", showId)
        .maybeSingle();
      if (data) setShow((prev: any) => (prev ? { ...prev, ...data } : prev));
    }, 8000);
    return () => window.clearInterval(t);
  }, [showId]);

  const sendTip = async (tipType: string, amount: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to send tips");
        return;
      }

      const { data, error } = await supabase.functions.invoke("send-comedy-tip", {
        body: {
          showId,
          comedianId: show.comedian_id,
          tipType,
          amount,
          message: tipMessage
        }
      });

      const status = (error as any)?.context?.status;
      const errMsg = String((data as any)?.error ?? (error as any)?.message ?? "");
      if (status === 402 || /insufficient_comedy_coins|insufficient/i.test(errMsg)) {
        toast.error("Not enough comedy coins", {
          description: `This gift costs ${amount} coins. Top up to keep supporting the show.`,
          action: { label: "Buy coins", onClick: () => navigate("/comedy-club") },
        });
        return;
      }
      if (error) throw error;

      toast.success(`Sent ${tipType}!`);
      setTipMessage("");
    } catch (error) {
      console.error("Error sending tip:", error);
      toast.error("Failed to send tip");
    }

  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!show) return null;

  const tipOptions = [
    { type: "applause", label: "👏", cost: 10 },
    { type: "flowers", label: "🌹", cost: 25 },
    { type: "mic_drop", label: "🎤", cost: 50 },
    { type: "standing_ovation", label: "🙌", cost: 100 },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6 mt-16">
        <Button variant="ghost" onClick={() => navigate("/comedy-club")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Comedy Club
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{show.title}</h1>
                  <p className="text-muted-foreground">by {show.comedian?.stage_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isLive && (
                    <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                      <span className="font-bold">LIVE</span>
                    </div>
                  )}
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" /> {Math.max(presenceViewers, show.viewer_count || 0)}
                  </Badge>
                </div>
              </div>

              <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!hasStream && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center px-6 space-y-3">
                      <p className="text-xl">🎤 Live Stream</p>
                      <p className="text-sm text-white/70">
                        {!isLive
                          ? "This show is not broadcasting right now"
                          : connState === "failed"
                            ? "Connection lost — try reconnecting"
                            : "Connecting to the comedian's stream..."}
                      </p>
                      {isLive && (
                        <Button variant="secondary" size="sm" onClick={() => setRtcKey((k) => k + 1)}>
                          <RefreshCw className="mr-2 h-4 w-4" /> Reconnect
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Tips Section */}
              <div className="space-y-3">
                <p className="font-medium">Send a tip:</p>
                <Input
                  placeholder="Add a message (optional)"
                  value={tipMessage}
                  onChange={(e) => setTipMessage(e.target.value)}
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {tipOptions.map((tip) => (
                    <Button
                      key={tip.type}
                      variant="outline"
                      onClick={() => sendTip(tip.type, tip.cost)}
                      className="w-full justify-center gap-1 px-2"
                    >
                      <span>{tip.label}</span>
                      <span className="font-semibold">{tip.cost}</span>
                    </Button>
                  ))}
                </div>

              </div>
            </Card>
          </div>

          {/* Chat Sidebar */}
          <div>
            <ComedyLiveChat showId={showId!} canModerate={isHost} />
          </div>
        </div>
      </div>
    </div>
  );
}
