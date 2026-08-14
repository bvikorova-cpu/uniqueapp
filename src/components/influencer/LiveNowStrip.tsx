import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Radio, Eye } from "lucide-react";

interface LiveRow {
  id: string;
  title: string;
  viewer_count: number | null;
  influencer_id: string;
  influencer_profiles?: { display_name: string | null; profile_photo_url: string | null } | null;
}

export default function LiveNowStrip() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: streams = [] } = useQuery({
    queryKey: ["live-now-strip"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_streams")
        .select("id, title, viewer_count, influencer_id, influencer_profiles(display_name, profile_photo_url)")
        .eq("is_live", true)
        .order("started_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      const rows = (data || []) as unknown as LiveRow[];
      // One card per creator (newest stream wins)
      const seen = new Set<string>();
      return rows.filter((r) => {
        if (seen.has(r.influencer_id)) return false;
        seen.add(r.influencer_id);
        return true;
      });

    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    const ch = supabase
      .channel("live-now-strip")
      .on("postgres_changes", { event: "*", schema: "public", table: "live_streams" }, () => {
        qc.invalidateQueries({ queryKey: ["live-now-strip"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  if (streams.length === 0) return null;

  return (
    <div className="mx-auto mb-6 max-w-4xl rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-destructive" />
        </span>
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-destructive">Live now</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {streams.map((s) => (
          <div key={s.id} className="min-w-[220px] shrink-0 rounded-xl border border-border bg-card/80 p-3">
            <p className="truncate text-sm font-bold">{s.influencer_profiles?.display_name || "Creator"}</p>
            <p className="mb-2 truncate text-xs text-muted-foreground">{s.title}</p>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3.5 w-3.5" /> {s.viewer_count ?? 0}
              </span>
              <Button size="sm" className="gap-1.5" onClick={() => navigate(`/live/${s.id}`)}>
                <Radio className="h-3.5 w-3.5" /> Watch
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
