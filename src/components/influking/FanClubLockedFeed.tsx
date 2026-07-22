import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Loader2 } from "lucide-react";

interface Props { creatorId: string; }

/**
 * Renders exclusive fan-club posts from all clubs owned by `creatorId`.
 * RLS ensures only active members (or the creator) receive rows, so a
 * non-member simply sees an empty state / paywall hint.
 */
export function FanClubLockedFeed({ creatorId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["fan-club-locked-posts", creatorId],
    queryFn: async () => {
      // Fetch all clubs of the creator, then their posts (RLS filters).
      const { data: clubs } = await supabase
        .from("influencer_fan_clubs")
        .select("id, name, tier")
        .eq("creator_id", creatorId);

      if (!clubs?.length) return [];
      const { data: posts, error } = await supabase
        .from("influencer_fan_club_posts")
        .select("id, fan_club_id, title, body, media_url, created_at")
        .in("fan_club_id", clubs.map((c) => c.id))
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      const clubMap = new Map(clubs.map((c) => [c.id, c]));
      return (posts ?? []).map((p) => ({ ...p, club: clubMap.get(p.fan_club_id) }));
    } });

  if (isLoading) return <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  if (!data?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          <Lock className="h-5 w-5 mx-auto mb-2" />
          Join a Fan Club above to unlock exclusive posts.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lock className="h-4 w-4 text-primary" /> Exclusive posts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((p: any) => (
          <div key={p.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">{p.title}</h4>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {p.club?.tier}
              </span>
            </div>
            {p.media_url && (
              <img src={p.media_url} alt="" className="rounded max-h-64 w-full object-cover" />
            )}
            {p.body && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{p.body}</p>}
            <p className="text-[10px] text-muted-foreground">
              {new Date(p.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
