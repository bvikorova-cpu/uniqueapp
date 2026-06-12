import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Hls from "hls.js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Radio, Users, AlertTriangle } from "lucide-react";
import { ConcertChat } from "@/components/concerts/ConcertChat";
import { toast } from "sonner";

type Concert = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  playback_url: string | null;
  started_at: string | null;
  scheduled_at: string;
  musician_id: string;
  viewer_count: number;
  musician_profiles?: { stage_name: string; user_id: string; avatar_url: string | null };
};

const ConcertWatch = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [loading, setLoading] = useState(true);
  const [concert, setConcert] = useState<Concert | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate(`/auth?redirect=/concert-watch/${id}`);
          return;
        }

        // Check access
        const { data: canWatch, error: rpcErr } = await supabase
          .rpc("can_watch_concert", { _concert_id: id, _user_id: session.user.id });
        if (rpcErr) throw rpcErr;
        if (!canWatch) {
          setError("You don't have a ticket for this concert.");
          setLoading(false);
          return;
        }

        const { data, error: cErr } = await supabase
          .from("live_concert_streams")
          .select("*, musician_profiles(stage_name, user_id, avatar_url)")
          .eq("id", id)
          .maybeSingle();
        if (cErr) throw cErr;
        if (!data) {
          setError("Concert not found.");
          setLoading(false);
          return;
        }
        if (cancelled) return;
        setConcert(data as any);
        setAllowed(true);
      } catch (e: any) {
        setError(e?.message || "Failed to load concert");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id, navigate]);

  // Realtime updates (status, playback_url, viewer_count)
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`concert-${id}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "live_concert_streams", filter: `id=eq.${id}` },
        (payload) => setConcert((prev) => prev ? { ...prev, ...(payload.new as any) } : prev)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  // HLS player attach
  useEffect(() => {
    const url = concert?.playback_url;
    const video = videoRef.current;
    if (!url || !video || concert?.status !== "live") return;

    // Cleanup previous
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          console.error("HLS fatal", data);
          toast.error("Stream playback error");
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native
      video.src = url;
    } else {
      setError("HLS playback not supported in this browser.");
    }

    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, [concert?.playback_url, concert?.status]);

  // Viewer presence + count
  useEffect(() => {
    if (!id || !allowed) return;
    let removed = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || removed) return;
      const ch = supabase.channel(`concert-presence-${id}`, {
        config: { presence: { key: session.user.id } },
      });
      ch.on("presence", { event: "sync" }, () => {
        const state = ch.presenceState();
        const n = Object.keys(state).length;
        setConcert((prev) => prev ? { ...prev, viewer_count: n } : prev);
      });
      await ch.subscribe(async (status) => {
        if (status === "SUBSCRIBED") await ch.track({ user_id: session.user.id });
      });
      if (removed) supabase.removeChannel(ch);
    })();
    return () => { removed = true; };
  }, [id, allowed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !allowed) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-28 md:pb-12">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild className="mb-4 gap-2">
            <Link to="/live-concerts"><ArrowLeft className="h-4 w-4" />Back to Concerts</Link>
          </Button>
          <Card className="border-destructive/30">
            <CardContent className="p-8 text-center space-y-3">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-xl font-bold">Access denied</h2>
              <p className="text-muted-foreground">{error || "You need a valid ticket to watch this concert."}</p>
              <Button asChild><Link to="/live-concerts">Buy a ticket</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-28 md:pb-12">
      <div className="container mx-auto px-4 space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild className="gap-2">
            <Link to="/live-concerts"><ArrowLeft className="h-4 w-4" />Back</Link>
          </Button>
          <div className="flex items-center gap-2">
            {concert?.status === "live" && (
              <Badge className="bg-destructive animate-pulse gap-1">
                <Radio className="h-3 w-3" />LIVE
              </Badge>
            )}
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />{concert?.viewer_count ?? 0}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
              {concert?.status === "live" && concert?.playback_url ? (
                <video
                  ref={videoRef}
                  controls
                  playsInline
                  autoPlay
                  className="w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <Radio className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {concert?.status === "scheduled" ? "Concert hasn't started yet" :
                       concert?.status === "ended" ? "Concert ended" :
                       "Stream is being prepared..."}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {concert?.status === "scheduled"
                        ? `Scheduled for ${new Date(concert.scheduled_at).toLocaleString()}`
                        : "Please wait for the artist to start streaming."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-black">{concert?.title}</h1>
              <p className="text-muted-foreground">by {concert?.musician_profiles?.stage_name}</p>
              {concert?.description && <p className="mt-2 text-sm">{concert.description}</p>}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="h-[500px] lg:h-[600px] flex flex-col">
              <CardContent className="p-0 flex-1 overflow-hidden">
                <ConcertChat onBack={() => navigate("/live-concerts")} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcertWatch;
