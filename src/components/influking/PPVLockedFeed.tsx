import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Loader2 } from "lucide-react";

interface Props {
  /** auth user id of the creator (influking_ppv_posts.creator_id) */
  creatorId: string;
}

interface Row {
  id: string;
  title: string;
  description: string | null;
  preview_url: string | null;
  price_cents: number;
  content_type: string;
  total_unlocks: number;
}

export default function PPVLockedFeed({ creatorId }: Props) {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["ppv-posts", creatorId],
    enabled: !!creatorId,
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("influking_ppv_posts")
        .select("id, title, description, preview_url, price_cents, content_type, total_unlocks")
        .eq("creator_id", creatorId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading premium content…
      </div>
    );
  }
  if (posts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Lock className="h-5 w-5 text-fuchsia-500" /> Premium (Pay-Per-View)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
              {p.preview_url ? (
                <img src={p.preview_url} alt={p.title} className="w-full h-full object-cover blur-sm" />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold truncate">{p.title}</h4>
                <Badge variant="outline">€{(p.price_cents / 100).toFixed(2)}</Badge>
              </div>
              {p.description && <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{p.total_unlocks} unlocks</span>
                <Button size="sm" asChild>
                  <Link to={`/influ-king/ppv/${p.id}`}>Unlock</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
