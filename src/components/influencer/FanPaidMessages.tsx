import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Video, CheckCircle2, Clock } from "lucide-react";

interface FanRow {
  id: string;
  content: string;
  amount_paid: number;
  request_type: string;
  status: string | null;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
  creator_id: string;
}

/**
 * Fan-side inbox: the paid messages / shoutouts a user sent to creators,
 * together with the creator's reply once it arrives.
 */
export default function FanPaidMessages() {
  const { data, isLoading } = useQuery({
    queryKey: ["fan-paid-messages"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { rows: [] as FanRow[], names: {} as Record<string, string> };

      const { data: rows, error } = await supabase
        .from("creator_paid_messages")
        .select("id, content, amount_paid, request_type, status, reply, replied_at, created_at, creator_id")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;

      const list = (rows || []) as unknown as FanRow[];
      const ids = [...new Set(list.map((r) => r.creator_id))];
      const names: Record<string, string> = {};
      if (ids.length) {
        const { data: profiles } = await supabase
          .from("influencer_profiles")
          .select("user_id, display_name")
          .in("user_id", ids);
        (profiles || []).forEach((p: any) => { names[p.user_id] = p.display_name; });
      }
      return { rows: list, names };
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const rows = data?.rows ?? [];
  const names = data?.names ?? {};

  if (!rows.length) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="p-8 text-center text-muted-foreground">
          <Mail className="mx-auto mb-3 h-10 w-10 opacity-40" />
          No messages yet. Open a creator profile in Discover and send a paid message or a video shoutout — their reply shows up here.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {rows.map((r) => (
        <Card key={r.id} className="min-w-0">
          <CardContent className="min-w-0 space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant="outline" className="gap-1">
                {r.request_type === "shoutout" ? <Video className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                {r.request_type === "shoutout" ? "Video shoutout" : "Paid message"}
              </Badge>
              <div className="text-xs text-muted-foreground">
                To {names[r.creator_id] ?? "creator"} · {new Date(r.created_at).toLocaleDateString()} · €{Number(r.amount_paid || 0).toFixed(2)}
              </div>
            </div>

            <p className="whitespace-pre-wrap break-words text-sm">{r.content}</p>

            {r.reply ? (
              <div className="space-y-1 rounded-md border bg-muted/30 p-3">
                <p className="flex items-center gap-1 text-[11px] font-semibold text-green-600">
                  <CheckCircle2 className="h-3 w-3" /> Reply from {names[r.creator_id] ?? "creator"}
                  {r.replied_at && <span className="font-normal text-muted-foreground">· {new Date(r.replied_at).toLocaleDateString()}</span>}
                </p>
                <p className="whitespace-pre-wrap break-words text-sm">{r.reply}</p>
              </div>
            ) : (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> Waiting for the creator's reply
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
