import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mail, Send, CheckCircle2, Video } from "lucide-react";
import { toast } from "sonner";

interface InboxRow {
  id: string;
  content: string;
  amount_paid: number;
  creator_payout: number;
  request_type: string;
  status: string | null;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
  sender_id: string;
}

export default function CreatorPaidInbox() {
  const qc = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const { data: rows, isLoading } = useQuery({
    queryKey: ["creator-paid-inbox"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [] as InboxRow[];
      const { data, error } = await supabase
        .from("creator_paid_messages")
        .select("id, content, amount_paid, creator_payout, request_type, status, reply, replied_at, created_at, sender_id")
        .eq("creator_id", user.id)
        .in("status", ["paid", "completed", "replied", "succeeded"])
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as unknown as InboxRow[];
    },
  });

  const reply = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const { error } = await supabase
        .from("creator_paid_messages")
        .update({ reply: text, replied_at: new Date().toISOString(), status: "replied", is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reply sent");
      qc.invalidateQueries({ queryKey: ["creator-paid-inbox"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not send the reply"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (!rows || rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Mail className="h-10 w-10 mx-auto mb-3 opacity-40" />
          No paid messages yet. Fans can send you paid messages and video shoutouts from your profile.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <Card key={r.id} className="min-w-0">
          <CardContent className="p-4 space-y-3 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Badge variant="outline" className="gap-1">
                {r.request_type === "shoutout" ? <Video className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                {r.request_type === "shoutout" ? "Video shoutout" : "Paid message"}
              </Badge>
              <div className="text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString()} · <span className="text-green-600 font-semibold">+€{Number(r.creator_payout || 0).toFixed(2)}</span>
              </div>
            </div>

            <p className="text-sm break-words whitespace-pre-wrap">{r.content}</p>

            {r.reply ? (
              <div className="rounded-md border bg-muted/30 p-3 space-y-1">
                <p className="text-[11px] font-semibold flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-3 w-3" /> Your reply
                  {r.replied_at && <span className="text-muted-foreground font-normal">· {new Date(r.replied_at).toLocaleDateString()}</span>}
                </p>
                <p className="text-sm break-words whitespace-pre-wrap">{r.reply}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  placeholder="Write your reply..."
                  rows={3}
                  value={drafts[r.id] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                />
                <Button
                  size="sm"
                  className="w-full sm:w-auto gap-1"
                  disabled={reply.isPending || (drafts[r.id]?.trim().length ?? 0) < 2}
                  onClick={() => reply.mutate({ id: r.id, text: drafts[r.id].trim() })}
                >
                  {reply.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  Send reply
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
