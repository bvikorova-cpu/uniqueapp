import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Check, Loader2, Search, UserMinus, ArrowLeft, Users, X } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { searchProfiles, type PublicProfileResult } from "@/lib/searchProfiles";
import { UserPlus } from "lucide-react";

interface Friend {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
  friendshipId: string;
}

interface FriendRequest extends Friend {
  created_at: string;
}

const Friends = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [people, setPeople] = useState<PublicProfileResult[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<string[]>([]);
  const [requestActionId, setRequestActionId] = useState<string | null>(null);
  const activeTab = searchParams.get("tab") === "requests" ? "requests" : "friends";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setCurrentUserId(session.user.id);
    });
  }, [navigate]);

  useEffect(() => {
    if (!currentUserId) return;
    (async () => {
      setLoading(true);
      try {
        const { data: links, error } = await supabase
          .from("friendships")
          .select("id, user_id, friend_id")
          .eq("status", "accepted")
          .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`);
        if (error) throw error;

        const ids = (links || []).map((l: any) =>
          l.user_id === currentUserId ? l.friend_id : l.user_id,
        );
        if (ids.length === 0) setFriends([]);
        else {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, username")
            .in("id", ids);

          const map = new Map<string, any>();
          (profiles || []).forEach((p: any) => map.set(p.id, p));

          setFriends((links || [])
            .map((l: any) => {
              const otherId = l.user_id === currentUserId ? l.friend_id : l.user_id;
              const p = map.get(otherId);
              return p ? { id: p.id, full_name: p.full_name, avatar_url: p.avatar_url, username: p.username, friendshipId: l.id } : null;
            })
            .filter(Boolean) as Friend[]);
        }

        const { data: pending, error: pendingError } = await supabase
          .from("friendships")
          .select("id, user_id, friend_id, created_at")
          .eq("friend_id", currentUserId)
          .eq("status", "pending");
        if (pendingError) throw pendingError;

        const requesterIds = (pending || []).map((r: any) => r.user_id);
        if (requesterIds.length === 0) setRequests([]);
        else {
          const { data: requesterProfiles } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, username")
            .in("id", requesterIds);
          const requestMap = new Map<string, any>();
          (requesterProfiles || []).forEach((p: any) => requestMap.set(p.id, p));
          setRequests((pending || []).map((r: any) => {
            const p = requestMap.get(r.user_id);
            return p ? { id: p.id, full_name: p.full_name, avatar_url: p.avatar_url, username: p.username, friendshipId: r.id, created_at: r.created_at } : null;
          }).filter(Boolean) as FriendRequest[]);
        }
      } catch (e: any) {
        toast({ title: "Failed to load friends", description: e.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUserId, toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter(
      (f) =>
        (f.full_name || "").toLowerCase().includes(q) ||
        (f.username || "").toLowerCase().includes(q),
    );
  }, [friends, query]);

  // Global people search (find users who are not friends yet)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) { setPeople([]); return; }
    let cancelled = false;
    setPeopleLoading(true);
    const t = setTimeout(async () => {
      const rows = await searchProfiles(q, { limit: 12 });
      if (cancelled) return;
      const friendIds = new Set(friends.map((f) => f.id));
      setPeople(rows.filter((r) => !friendIds.has(r.id)));
      setPeopleLoading(false);
    }, 250);
    return () => { cancelled = true; clearTimeout(t); setPeopleLoading(false); };
  }, [query, friends]);

  const handleSendRequest = async (userId: string) => {
    if (!currentUserId) return;
    setAddingId(userId);
    try {
      const { error } = await supabase
        .from("friendships")
        .insert({ user_id: currentUserId, friend_id: userId, status: "pending" });
      if (error) throw error;
      setSentIds((prev) => [...prev, userId]);
      toast({ title: "Friend request sent" });
    } catch (e: any) {
      toast({ title: "Could not send request", description: e.message, variant: "destructive" });
    } finally {
      setAddingId(null);
    }
  };

  const handleRemove = async (friendshipId: string, name: string) => {
    setRemovingId(friendshipId);
    try {
      const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
      if (error) throw error;
      setFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId));
      toast({ title: "Friend removed", description: `${name || "User"} is no longer in your friends.` });
    } catch (e: any) {
      toast({ title: "Failed to remove", description: e.message, variant: "destructive" });
    } finally {
      setRemovingId(null);
    }
  };

  const handleFriendRequest = async (request: FriendRequest, action: "accept" | "decline") => {
    setRequestActionId(request.friendshipId);
    try {
      const result = action === "accept"
        ? await supabase.from("friendships").update({ status: "accepted" }).eq("id", request.friendshipId)
        : await supabase.from("friendships").delete().eq("id", request.friendshipId);
      if (result.error) throw result.error;

      await supabase.from("notifications").update({ is_read: true }).eq("related_id", request.friendshipId).eq("type", "friend_request");
      setRequests((prev) => prev.filter((r) => r.friendshipId !== request.friendshipId));
      if (action === "accept") setFriends((prev) => [...prev, request]);
      toast({ title: action === "accept" ? "Friend request accepted" : "Friend request declined" });
    } catch (e: any) {
      toast({ title: "Request failed", description: e.message, variant: "destructive" });
    } finally {
      setRequestActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background py-6">
      <FloatingHowItWorks
        title={'Friends'}
        intro={'See requests, all friends, suggestions, and manage your circle.'}
        steps={[
          { title: 'Check requests', desc: 'Accept or decline pending friend requests at the top of the tab.' },
        { title: 'Browse all friends', desc: 'Open the All Friends tab to search and message any friend.' },
        { title: 'Discover people', desc: 'Use Suggestions to find people you may know via mutual friends.' },
        { title: 'Manage privacy', desc: 'Unfriend, mute, or block anyone from their profile menu.' }
        ]}
      />
      <div className="container mx-auto px-3 sm:px-4 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-3">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">My Friends</h1>
          <span className="text-sm text-muted-foreground">({friends.length})</span>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search people by name or username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            {friends.length === 0 ? "You don't have any friends yet." : "No friends match your search."}
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((f) => (
              <Card key={f.friendshipId} className="p-3 flex items-center gap-3">
                <button
                  onClick={() => navigate(`/profile/${f.id}`)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={f.avatar_url || undefined} />
                    <AvatarFallback>
                      {(f.full_name?.[0] || f.username?.[0] || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{f.full_name || "No name"}</div>
                    {f.username && (
                      <div className="text-xs text-muted-foreground truncate">@{f.username}</div>
                    )}
                  </div>
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive hover:text-destructive"
                      disabled={removingId === f.friendshipId}
                    >
                      {removingId === f.friendshipId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserMinus className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove friend?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {f.full_name || "This user"} will be removed from your friends. You can send a new request anytime.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRemove(f.friendshipId, f.full_name || "")}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </Card>
            ))}
          </div>
        )}

        {query.trim().length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">People on Unique</h2>
            </div>
            {peopleLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : people.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">No people found.</Card>
            ) : (
              <div className="space-y-2">
                {people.map((p) => (
                  <Card key={p.id} className="p-3 flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/profile/${p.id}`)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={p.avatar_url || undefined} />
                        <AvatarFallback>
                          {(p.full_name?.[0] || p.username?.[0] || "U").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium truncate" translate="no">{p.full_name || p.username || "Member"}</div>
                        {p.username && (
                          <div className="text-xs text-muted-foreground truncate" translate="no">@{p.username}</div>
                        )}
                      </div>
                    </button>
                    <Button
                      size="sm"
                      variant={sentIds.includes(p.id) ? "secondary" : "default"}
                      disabled={addingId === p.id || sentIds.includes(p.id)}
                      onClick={() => handleSendRequest(p.id)}
                      className="shrink-0"
                    >
                      {addingId === p.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : sentIds.includes(p.id) ? (
                        <><Check className="h-4 w-4 mr-1" />Sent</>
                      ) : (
                        <><UserPlus className="h-4 w-4 mr-1" />Add</>
                      )}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
