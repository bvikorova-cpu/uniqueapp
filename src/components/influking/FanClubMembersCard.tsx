import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Loader2, XCircle, Clock, CheckCircle2, Ban } from "lucide-react";

interface Props {
  fanClubId: string;
  fanClubName: string;
  tier: "bronze" | "silver" | "gold";
}

interface MemberRow {
  user_id: string;
  status: string;
  cancel_at_period_end: boolean;
  subscribed_at: string;
  current_period_end: string | null;
  profile?: { display_name: string | null; avatar_url: string | null } | null;
}

const STATUS_META: Record<string, { label: string; color: string; Icon: typeof CheckCircle2 }> = {
  active:     { label: "Active",    color: "bg-green-500/15 text-green-500",  Icon: CheckCircle2 },
  past_due:   { label: "Past due",  color: "bg-yellow-500/15 text-yellow-500", Icon: Clock },
  canceled:   { label: "Canceled",  color: "bg-red-500/15 text-red-500",       Icon: Ban },
  paused:     { label: "Paused",    color: "bg-blue-500/15 text-blue-500",     Icon: Clock },
};

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";

const FanClubMembersCard = ({ fanClubId, fanClubName, tier }: Props) => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const { data: members = [], isLoading } = useQuery<MemberRow[]>({
    queryKey: ["fanclub-members", fanClubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_fan_club_members")
        .select("user_id, status, cancel_at_period_end, subscribed_at, current_period_end")
        .eq("fan_club_id", fanClubId)
        .order("subscribed_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as MemberRow[];
      if (rows.length === 0) return rows;
      const ids = rows.map((r) => r.user_id);
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", ids);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      return rows.map((r) => ({ ...r, profile: map.get(r.user_id) ?? null }));
    },
  });

  const cancel = useMutation({
    mutationFn: async ({ userId, immediate }: { userId: string; immediate: boolean }) => {
      setCancelingId(userId);
      const { data, error } = await supabase.functions.invoke("fanclub-creator-cancel", {
        body: { fan_club_id: fanClubId, member_user_id: userId, immediate },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
    },
    onSuccess: (_, vars) => {
      toast({
        title: vars.immediate ? "Subscription canceled" : "Cancellation scheduled",
        description: vars.immediate
          ? "Member access ended immediately."
          : "Access continues until the current period ends.",
      });
      qc.invalidateQueries({ queryKey: ["fanclub-members", fanClubId] });
      qc.invalidateQueries({ queryKey: ["influencer-fan-clubs"] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    onSettled: () => setCancelingId(null),
  });

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-primary" />
          Members · <span className="capitalize">{tier}</span> · {fanClubName}
          <Badge variant="outline" className="ml-auto">{members.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : members.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No subscribers yet.
          </p>
        ) : (
          <div className="divide-y divide-border/40">
            {members.map((m) => {
              const meta = STATUS_META[m.status] ?? STATUS_META.canceled;
              const Icon = meta.Icon;
              const name = m.profile?.display_name ?? m.user_id.slice(0, 8);
              const canCancel = m.status === "active" || m.status === "past_due" || m.status === "paused";
              const isBusy = cancelingId === m.user_id && cancel.isPending;
              return (
                <div key={m.user_id} className="flex items-center gap-3 py-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={m.profile?.avatar_url ?? undefined} />
                    <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate">{name}</span>
                      <Badge className={`${meta.color} border-none text-[10px] gap-1`}>
                        <Icon className="h-3 w-3" /> {meta.label}
                      </Badge>
                      {m.cancel_at_period_end && m.status === "active" && (
                        <Badge variant="outline" className="text-[10px]">Ends at period</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined {fmt(m.subscribed_at)} · Renews {fmt(m.current_period_end)}
                    </p>
                  </div>
                  {canCancel && (
                    <div className="flex gap-1">
                      {!m.cancel_at_period_end && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isBusy}
                          onClick={() => cancel.mutate({ userId: m.user_id, immediate: false })}
                        >
                          {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : "Cancel at period"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isBusy}
                        onClick={() => {
                          if (confirm(`Cancel ${name}'s subscription immediately? Access ends now.`))
                            cancel.mutate({ userId: m.user_id, immediate: true });
                        }}
                      >
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FanClubMembersCard;
