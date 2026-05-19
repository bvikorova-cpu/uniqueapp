import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Search, UserMinus, ArrowLeft, Users } from "lucide-react";

interface Friend {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
  friendshipId: string;
}

const Friends = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

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

        if (ids.length === 0) {
          setFriends([]);
          return;
        }

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, username")
          .in("id", ids);

        const map = new Map<string, any>();
        (profiles || []).forEach((p: any) => map.set(p.id, p));

        const merged: Friend[] = (links || [])
          .map((l: any) => {
            const otherId = l.user_id === currentUserId ? l.friend_id : l.user_id;
            const p = map.get(otherId);
            if (!p) return null;
            return {
              id: p.id,
              full_name: p.full_name,
              avatar_url: p.avatar_url,
              username: p.username,
              friendshipId: l.id,
            };
          })
          .filter(Boolean) as Friend[];

        setFriends(merged);
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

  return (
    <div className="min-h-screen bg-background py-6">
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
            placeholder="Search friends by name or username..."
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
      </div>
    </div>
  );
};

export default Friends;
