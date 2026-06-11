import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Users, Shield, ScrollText, Lock, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUserId(s?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Resolve community by uuid or slug.
  const { data: community, isLoading, error } = useQuery({
    queryKey: ["community", id],
    enabled: !!id,
    queryFn: async () => {
      const col = id && UUID_RE.test(id) ? "id" : "slug";
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq(col, id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const communityId = community?.id;

  const { data: rules = [] } = useQuery({
    queryKey: ["community-rules", communityId],
    enabled: !!communityId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_rules")
        .select("*")
        .eq("community_id", communityId!)
        .order("position", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: moderators = [] } = useQuery({
    queryKey: ["community-mods", communityId],
    enabled: !!communityId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_moderators")
        .select("user_id, created_at")
        .eq("community_id", communityId!);
      if (error) throw error;
      const ids = (data ?? []).map((m) => m.user_id);
      if (!ids.length) return [];
      const { data: profs } = await supabase.rpc("get_profiles_basic", { _ids: ids });
      const byId = new Map((profs ?? []).map((p: any) => [p.id, p]));
      return (data ?? []).map((m) => ({ ...m, profile: byId.get(m.user_id) ?? null }));
    },
  });

  const { data: members = [] } = useQuery({
    queryKey: ["community-members", communityId],
    enabled: !!communityId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_members")
        .select("user_id, joined_at, karma")
        .eq("community_id", communityId!)
        .order("joined_at", { ascending: false })
        .limit(24);
      if (error) throw error;
      const ids = (data ?? []).map((m) => m.user_id);
      if (!ids.length) return [];
      const { data: profs } = await supabase.rpc("get_profiles_basic", { _ids: ids });
      const byId = new Map((profs ?? []).map((p: any) => [p.id, p]));
      return (data ?? []).map((m) => ({ ...m, profile: byId.get(m.user_id) ?? null }));
    },
  });

  const { data: membership } = useQuery({
    queryKey: ["community-membership", communityId, userId],
    enabled: !!communityId && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_members")
        .select("id")
        .eq("community_id", communityId!)
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Realtime: any change to community / members / rules / mods → refetch the
  // affected query so member_count, join/leave state, and rules update live.
  useEffect(() => {
    if (!communityId) return;
    const channel = supabase
      .channel(`community:${communityId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "communities", filter: `id=eq.${communityId}` },
        () => qc.invalidateQueries({ queryKey: ["community", id] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_members", filter: `community_id=eq.${communityId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["community-members", communityId] });
          qc.invalidateQueries({ queryKey: ["community-membership", communityId, userId] });
          qc.invalidateQueries({ queryKey: ["community", id] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_rules", filter: `community_id=eq.${communityId}` },
        () => qc.invalidateQueries({ queryKey: ["community-rules", communityId] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_moderators", filter: `community_id=eq.${communityId}` },
        () => qc.invalidateQueries({ queryKey: ["community-mods", communityId] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [communityId, id, userId, qc]);

  const [busy, setBusy] = useState(false);
  const toggleMembership = async () => {
    if (!userId) {
      toast({ title: "Sign in required", description: "Please sign in to join communities.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!communityId) return;
    setBusy(true);
    try {
      if (membership) {
        const { error } = await supabase
          .from("community_members")
          .delete()
          .eq("community_id", communityId)
          .eq("user_id", userId);
        if (error) throw error;
        toast({ title: "Left community" });
      } else {
        const { error } = await supabase
          .from("community_members")
          .insert({ community_id: communityId, user_id: userId });
        if (error) throw error;
        toast({ title: "Joined community" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message ?? "Failed to update membership", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-8 space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="container max-w-3xl py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">Community not found</h1>
        <p className="text-muted-foreground">This community does not exist or has been removed.</p>
        <Button asChild variant="outline"><Link to="/wall"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Wall</Link></Button>
      </div>
    );
  }

  const isCreator = userId && community.creator_id === userId;

  return (
    <>
      <Helmet>
        <title>{`u/${community.slug} · Community · Unique`}</title>
        <meta name="description" content={community.description ?? `${community.name} community on Unique`} />
        <link rel="canonical" href={`https://uniqueapp.fun/community/${community.slug}`} />
      </Helmet>

      <div className="container max-w-5xl py-6 space-y-6">
        {/* Header */}
        <Card className="overflow-hidden">
          <div
            className="h-40 bg-gradient-to-br from-primary/40 via-accent/30 to-background"
            style={community.banner_url ? { backgroundImage: `url(${community.banner_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            aria-hidden
          />
          <div className="p-6 flex flex-col sm:flex-row gap-4 sm:items-end -mt-12">
            <Avatar className="h-24 w-24 ring-4 ring-background">
              <AvatarImage src={community.icon_url ?? undefined} alt={community.name} />
              <AvatarFallback className="text-2xl">{community.name?.[0] ?? "C"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {community.name}
                {community.is_private && <Lock className="h-4 w-4 text-muted-foreground" aria-label="Private" />}
                {community.is_nsfw && <Badge variant="destructive">NSFW</Badge>}
              </h1>
              <p className="text-sm text-muted-foreground">u/{community.slug}</p>
              <p className="text-sm flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" /> {community.member_count ?? 0} members
              </p>
            </div>
            <div className="flex gap-2">
              {!isCreator && (
                <Button onClick={toggleMembership} disabled={busy} variant={membership ? "outline" : "default"}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : membership ? "Leave" : "Join"}
                </Button>
              )}
              {isCreator && <Badge variant="secondary">Creator</Badge>}
            </div>
          </div>
          {community.description && (
            <div className="px-6 pb-6">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{community.description}</p>
            </div>
          )}
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main column — placeholder for future community feed */}
          <div className="md:col-span-2 space-y-4">
            <Card className="p-6">
              <h2 className="font-semibold mb-2 flex items-center gap-2"><Eye className="h-4 w-4" /> Activity</h2>
              <p className="text-sm text-muted-foreground">
                Community-scoped posts, bazaar listings and gallery are coming soon. Membership
                and rules are live and update in real time.
              </p>
            </Card>

            {/* Recent members */}
            <Card className="p-6">
              <h2 className="font-semibold mb-3 flex items-center gap-2"><Users className="h-4 w-4" /> Recent members</h2>
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground">No members yet — be the first to join.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {members.map((m: any) => (
                    <Link key={m.user_id} to={`/profile/${m.user_id}`} className="flex flex-col items-center gap-1 text-center hover:opacity-80">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={m.profile?.avatar_url ?? undefined} />
                        <AvatarFallback>{m.profile?.full_name?.[0] ?? "U"}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs truncate w-full">{m.profile?.full_name ?? "User"}</span>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Side column */}
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="font-semibold mb-3 flex items-center gap-2"><ScrollText className="h-4 w-4" /> Rules</h2>
              {rules.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rules set yet.</p>
              ) : (
                <ol className="space-y-2 list-decimal list-inside text-sm">
                  {rules.map((r: any) => (
                    <li key={r.id}>
                      <span className="font-medium">{r.title}</span>
                      {r.description && <p className="text-muted-foreground text-xs ml-5 mt-0.5">{r.description}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="font-semibold mb-3 flex items-center gap-2"><Shield className="h-4 w-4" /> Moderators</h2>
              {moderators.length === 0 ? (
                <p className="text-sm text-muted-foreground">Only the creator moderates this community.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {moderators.map((m: any) => (
                    <li key={m.user_id}>
                      <Link to={`/profile/${m.user_id}`} className="flex items-center gap-2 hover:opacity-80">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={m.profile?.avatar_url ?? undefined} />
                          <AvatarFallback>{m.profile?.full_name?.[0] ?? "M"}</AvatarFallback>
                        </Avatar>
                        <span>{m.profile?.full_name ?? "Moderator"}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
