import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Bell, Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

interface Row {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  min_tier: string | null;
  influencer_id: string;
  influencer_profiles?: { display_name: string | null } | null;
}

export const UpcomingStreams = () => {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("live_streams")
        .select("id, title, description, scheduled_at, min_tier, influencer_id, influencer_profiles(display_name)")
        .eq("is_live", false)
        .not("scheduled_at", "is", null)
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(12);
      if (!cancelled) setRows((data ?? []) as any);
    };
    load();
    const channel = supabase
      .channel("upcoming-live-streams")
      .on("postgres_changes", { event: "*", schema: "public", table: "live_streams" }, () => load())
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const remind = (r: Row) => {
    const ics =
      "BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\n" +
      `SUMMARY:${r.title}\n` +
      `DTSTART:${format(new Date(r.scheduled_at), "yyyyMMdd'T'HHmmss")}\n` +
      `DESCRIPTION:${(r.description ?? "").replace(/\n/g, " ")}\n` +
      "END:VEVENT\nEND:VCALENDAR";
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${r.title}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Reminder saved to your calendar");
  };

  if (rows.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <CalendarClock className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Upcoming Streams</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((r) => (
          <Card key={r.id} className="border-2 hover:border-primary/40 transition">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold line-clamp-2">{r.title}</h3>
                <Badge variant="outline" className="shrink-0">Public</Badge>
              </div>
              {r.influencer_profiles?.display_name && (
                <p className="text-xs text-muted-foreground">{r.influencer_profiles.display_name}</p>
              )}
              <div className="text-sm">
                <p className="font-medium">{format(new Date(r.scheduled_at), "EEE d MMM, HH:mm")}</p>
                <p className="text-xs text-muted-foreground">
                  in {formatDistanceToNow(new Date(r.scheduled_at))}
                </p>
              </div>
              {r.description && <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>}
              <Button size="sm" variant="outline" className="w-full gap-1" onClick={() => remind(r)}>
                <Bell className="h-3 w-3" /> Remind me
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
