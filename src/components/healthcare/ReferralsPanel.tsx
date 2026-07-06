import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2 } from "lucide-react";
import { format } from "date-fns";

export function ReferralsPanel() {
  const { data: refs = [], isLoading } = useQuery({
    queryKey: ["hc-referrals"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("healthcare_referrals" as any)
        .select("*")
        .or(`from_provider_id.eq.${user.id},to_provider_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(50);
      return (data as any[]) ?? [];
    },
  });

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading referrals…</div>;

  if (refs.length === 0) {
    return (
      <div className="text-center py-12">
        <Share2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No referrals yet</h3>
        <p className="text-muted-foreground text-sm">
          Incoming and outgoing patient referrals will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {refs.map((r) => (
        <Card key={r.id}>
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold truncate">{r.reason}</div>
              <div className="text-xs text-muted-foreground truncate">
                {format(new Date(r.created_at), "PP")} · {r.notes || "No notes"}
              </div>
            </div>
            <Badge variant={r.status === "accepted" ? "default" : "outline"}>
              {r.status}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
