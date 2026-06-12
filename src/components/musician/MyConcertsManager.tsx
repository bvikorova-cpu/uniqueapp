import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Radio, StopCircle, Calendar, Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  musicianId: string;
}

export const MyConcertsManager = ({ musicianId }: Props) => {
  const qc = useQueryClient();
  const [liveDialogConcertId, setLiveDialogConcertId] = useState<string | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: concerts, isLoading } = useQuery({
    queryKey: ["my-concerts", musicianId],
    enabled: !!musicianId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_concert_streams")
        .select("*")
        .eq("musician_id", musicianId)
        .order("scheduled_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const goLive = async (concertId: string) => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("concert-go-live", {
        body: { concertId, playbackUrl: playbackUrl.trim() || undefined },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("You're LIVE! Viewers with tickets can now watch.");
      setLiveDialogConcertId(null);
      setPlaybackUrl("");
      qc.invalidateQueries({ queryKey: ["my-concerts", musicianId] });
    } catch (e: any) {
      toast.error(e?.message || "Failed to go live");
    } finally {
      setSubmitting(false);
    }
  };

  const endStream = async (concertId: string) => {
    if (!confirm("End the stream? Viewers will no longer be able to watch.")) return;
    try {
      const { data, error } = await supabase.functions.invoke("concert-end-stream", { body: { concertId } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Stream ended");
      qc.invalidateQueries({ queryKey: ["my-concerts", musicianId] });
    } catch (e: any) {
      toast.error(e?.message || "Failed to end stream");
    }
  };

  const copyKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    toast.success("Stream key copied");
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Concerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!concerts?.length && (
          <p className="text-sm text-muted-foreground">No concerts yet. Schedule one above.</p>
        )}
        {concerts?.map((c: any) => (
          <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold truncate">{c.title}</h4>
                {c.status === "live" && <Badge className="bg-destructive animate-pulse gap-1"><Radio className="h-3 w-3" />LIVE</Badge>}
                {c.status === "scheduled" && <Badge variant="outline">Scheduled</Badge>}
                {c.status === "ended" && <Badge variant="secondary">Ended</Badge>}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />{format(new Date(c.scheduled_at), "PPp")}
              </p>
              {c.stream_key && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate font-mono">key: {c.stream_key.slice(0, 24)}…</span>
                  <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => copyKey(c.stream_key)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              {c.status === "scheduled" && (
                <Button size="sm" onClick={() => { setLiveDialogConcertId(c.id); setPlaybackUrl(c.playback_url || ""); }} className="bg-gradient-to-r from-red-600 to-pink-600">
                  <Radio className="h-4 w-4 mr-1" />Go Live
                </Button>
              )}
              {c.status === "live" && (
                <>
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/concert-watch/${c.id}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />View
                    </a>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => endStream(c.id)}>
                    <StopCircle className="h-4 w-4 mr-1" />End
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}

        <Dialog open={!!liveDialogConcertId} onOpenChange={(o) => !o && setLiveDialogConcertId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Go Live — Paste your HLS playback URL</DialogTitle>
              <DialogDescription>
                Stream from OBS / Streamlabs / your phone to any RTMP service (YouTube Live unlisted, Twitch, Restream, Mux, Cloudflare Stream),
                then paste the public HLS (.m3u8) playback URL here. Your ticket holders will watch it through our paywalled player.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Label htmlFor="playback">HLS Playback URL (.m3u8)</Label>
              <Input
                id="playback"
                placeholder="https://stream.example.com/live/your-stream.m3u8"
                value={playbackUrl}
                onChange={(e) => setPlaybackUrl(e.target.value)}
              />
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded space-y-1">
                <p className="font-semibold">Quick setup tips:</p>
                <p>• <b>YouTube Live (unlisted)</b>: copy the embed/stream HLS link from "Share → Embed".</p>
                <p>• <b>Restream.io</b>: enable HLS output and copy the URL.</p>
                <p>• <b>Mux / Cloudflare</b>: copy the playback URL from your dashboard.</p>
                <p>You can leave it blank now and update it any time during the live show.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLiveDialogConcertId(null)}>Cancel</Button>
              <Button onClick={() => liveDialogConcertId && goLive(liveDialogConcertId)} disabled={submitting} className="bg-gradient-to-r from-red-600 to-pink-600">
                {submitting ? "Going live..." : (<><Radio className="h-4 w-4 mr-2" />Go Live Now</>)}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
