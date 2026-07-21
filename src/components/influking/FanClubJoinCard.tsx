import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Sparkles, Lock, Loader2, CheckCircle2, XCircle, RotateCcw, ArrowLeftRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

const TIER_ICON = { bronze: Star, silver: Crown, gold: Sparkles } as const;
const TIER_COLOR = {
  bronze: "text-orange-500",
  silver: "text-gray-400",
  gold: "text-amber-400",
} as const;

interface Props {
  creatorId: string;
  creatorName: string;
}

interface ClubRow {
  id: string;
  name: string;
  description: string | null;
  tier: "bronze" | "silver" | "gold";
  price_cents: number;
  perks: string[];
  member_count: number;
}

interface MembershipRow {
  fan_club_id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
}

export function FanClubJoinCard({ creatorId, creatorName }: Props) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();

  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });

  const { data: clubs = [], isLoading } = useQuery<ClubRow[]>({
    queryKey: ["public-fan-clubs", creatorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_fan_clubs")
        .select("id, name, description, tier, price_cents, perks, member_count")
        .eq("creator_id", creatorId)
        .eq("is_active", true)
        .order("price_cents", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        ...r,
        perks: Array.isArray(r.perks) ? r.perks : [],
      })) as ClubRow[];
    },
  });

  const { data: memberships = [] } = useQuery<MembershipRow[]>({
    queryKey: ["my-fan-club-memberships", user?.id, creatorId],
    queryFn: async () => {
      if (!user || clubs.length === 0) return [];
      const { data, error } = await supabase
        .from("influencer_fan_club_members")
        .select("fan_club_id, status, cancel_at_period_end, current_period_end")
        .eq("user_id", user.id)
        .in("fan_club_id", clubs.map((c) => c.id));
      if (error) throw error;
      return (data ?? []) as MembershipRow[];
    },
    enabled: !!user && clubs.length > 0,
  });

  // Post-checkout redirect handling
  useEffect(() => {
    const fanclubParam = params.get("fanclub");
    if (!fanclubParam) return;
    const clubId = params.get("fan_club_id");
    if (fanclubParam === "success" && user) {
      supabase.functions.invoke("fanclub-verify", { body: { fan_club_id: clubId } })
        .then(() => {
          qc.invalidateQueries({ queryKey: ["my-fan-club-memberships"] });
          qc.invalidateQueries({ queryKey: ["fan-club-locked-posts"] });
          toast({ title: "🎉 Welcome to the Fan Club!", description: "Exclusive content unlocked." });
        });
    } else if (fanclubParam === "canceled") {
      toast({ title: "Checkout canceled", variant: "destructive" });
    }
    params.delete("fanclub");
    params.delete("fan_club_id");
    params.delete("session_id");
    setParams(params, { replace: true });
  }, [params, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkout = useMutation({
    mutationFn: async (fan_club_id: string) => {
      if (!user) throw new Error("Sign in to subscribe");
      const { data, error } = await supabase.functions.invoke("fanclub-checkout", {
        body: { fan_club_id },
      });
      if (error) throw error;
      if (data?.already_member) {
        qc.invalidateQueries({ queryKey: ["my-fan-club-memberships"] });
        return;
      }
      if (data?.url) window.location.href = data.url;
    },
    onError: (e: any) => toast({ title: "Checkout error", description: e.message, variant: "destructive" }),
  });

  const cancel = useMutation({
    mutationFn: async (fan_club_id: string) => {
      const { error } = await supabase.functions.invoke("fanclub-cancel", { body: { fan_club_id } });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-fan-club-memberships"] });
      toast({ title: "Subscription will end at period end" });
    },
    onError: (e: any) => toast({ title: "Cancel failed", description: e.message, variant: "destructive" }),
  });

  const resume = useMutation({
    mutationFn: async (fan_club_id: string) => {
      const { error } = await supabase.functions.invoke("fanclub-resume", { body: { fan_club_id } });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-fan-club-memberships"] });
      toast({ title: "Membership resumed" });
    },
    onError: (e: any) => toast({ title: "Resume failed", description: e.message, variant: "destructive" }),
  });

  const swap = useMutation({
    mutationFn: async ({ from_fan_club_id, to_fan_club_id }: { from_fan_club_id: string; to_fan_club_id: string }) => {
      const { error } = await supabase.functions.invoke("fanclub-swap", {
        body: { from_fan_club_id, to_fan_club_id },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-fan-club-memberships"] });
      qc.invalidateQueries({ queryKey: ["fan-club-locked-posts"] });
      toast({ title: "Tier changed", description: "Proration applied on your next invoice." });
    },
    onError: (e: any) => toast({ title: "Swap failed", description: e.message, variant: "destructive" }),
  });

  const activeMembership = memberships.find((m) => m.status === "active");

  if (isLoading) {
    return <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (clubs.length === 0) return null;

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          {creatorName}'s Fan Clubs
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {clubs.map((c) => {
          const Icon = TIER_ICON[c.tier];
          const membership = memberships.find((m) => m.fan_club_id === c.id);
          const active = membership?.status === "active";
          return (
            <Card key={c.id} className="border-border/40">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="capitalize gap-1">
                    <Icon className={`h-3 w-3 ${TIER_COLOR[c.tier]}`} /> {c.tier}
                  </Badge>
                  <span className="font-bold text-green-500">
                    €{(c.price_cents / 100).toFixed(2)}<span className="text-xs text-muted-foreground">/mo</span>
                  </span>
                </div>
                <h4 className="font-semibold text-sm">{c.name}</h4>
                {c.description && <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>}
                {c.perks.length > 0 && (
                  <ul className="space-y-0.5">
                    {c.perks.slice(0, 3).map((p, i) => (
                      <li key={i} className="text-xs flex gap-1 items-start">
                        <CheckCircle2 className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{p}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {active ? (
                  <div className="space-y-1">
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/30 w-full justify-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Active member
                    </Badge>
                    {!membership?.cancel_at_period_end ? (
                      <Button size="sm" variant="ghost" className="w-full text-xs h-7"
                        onClick={() => cancel.mutate(c.id)} disabled={cancel.isPending}>
                        <XCircle className="h-3 w-3 mr-1" /> Cancel
                      </Button>
                    ) : (
                      <p className="text-[10px] text-muted-foreground text-center">
                        Ends {membership.current_period_end?.slice(0, 10)}
                      </p>
                    )}
                  </div>
                ) : (
                  <Button size="sm" className="w-full gap-1"
                    onClick={() => checkout.mutate(c.id)}
                    disabled={checkout.isPending || !user}>
                    {checkout.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lock className="h-3 w-3" />}
                    {user ? "Join" : "Sign in to join"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}
