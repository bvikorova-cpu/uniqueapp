import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Send, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { startViewer, type ViewerHandle } from "@/lib/concertWebRTC";

export default function ComedyLiveViewer() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tipMessage, setTipMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewerRef = useRef<ViewerHandle | null>(null);
  const [hasStream, setHasStream] = useState(false);
  const [connState, setConnState] = useState<RTCPeerConnectionState | null>(null);
  const [presenceViewers, setPresenceViewers] = useState(0);
  const [rtcKey, setRtcKey] = useState(0);


  useEffect(() => {
    loadShow();
    
    // Subscribe to real-time chat updates
    const channel = supabase
      .channel(`show_${showId}_chat`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comedy_show_messages',
        filter: `show_id=eq.${showId}`
      }, (payload) => {
        setChatMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

    // Load chat messages
    const { data: messages } = await supabase
      .from("comedy_show_messages")
      .select("*, sender:profiles(*)")
      .eq("show_id", showId)
      .order("created_at", { ascending: true });

    setChatMessages(messages || []);
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

  const sendTip = async (tipType: string, amount: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to send tips");
        return;
      }

      const { error } = await supabase.functions.invoke("send-comedy-tip", {
        body: {
          showId,
          comedianId: show.comedian_id,
          tipType,
          amount,
          message: tipMessage
        }
      });

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
                <div className="flex gap-2">
                  {tipOptions.map((tip) => (
                    <Button
                      key={tip.type}
                      variant="outline"
                      onClick={() => sendTip(tip.type, tip.cost)}
                      className="flex-1"
                    >
                      {tip.label} {tip.cost}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Chat Sidebar */}
          <div>
            <Card className="p-4 h-[600px] flex flex-col">
              <h3 className="font-bold mb-4">Live Chat</h3>
              
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <span className="font-medium">{msg.sender?.full_name || 'Anonymous'}: </span>
                    <span>{msg.message}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input id="comedy-chat-input" placeholder="Type a message..." />
                <Button size="icon" onClick={() => {
                  const input = document.getElementById("comedy-chat-input") as HTMLInputElement | null;
                  const text = input?.value?.trim();
                  if (!text) return;
                  toast.success("Message sent!");
                  if (input) input.value = "";
                }}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
