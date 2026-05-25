import { useState } from "react";
import { Heart, X, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCloseFriends } from "@/hooks/useCloseFriends";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Props {
  trigger?: React.ReactNode;
}

export const CloseFriendsDialog = ({ trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { friends, addFriend, removeFriend } = useCloseFriends();

  const { data: searchResults = [] } = useQuery({
    queryKey: ["close-friends-search", q],
    enabled: q.length >= 2,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await (supabase as any).rpc("search_users", { q, lim: 20 });
      if (error) throw error;
      return (data || []).filter((u: any) => u.id !== user?.id);
    },
  });

  const friendIds = new Set(friends.map((f: any) => f.friend_id));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Heart className="w-4 h-4 mr-2 text-rose-500" />
            Close Friends
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            Close Friends
            <Badge variant="secondary">{friends.length}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search people..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[360px]">
          {q.length >= 2 ? (
            <div className="space-y-2">
              {searchResults.map((p: any) => {
                const isFriend = friendIds.has(p.id);
                return (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={p.avatar_url || undefined} />
                        <AvatarFallback>{p.full_name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{p.full_name || "User"}</span>
                    </div>
                    <Button
                      size="sm"
                      variant={isFriend ? "secondary" : "default"}
                      onClick={() => isFriend ? removeFriend(p.id) : addFriend(p.id)}
                    >
                      {isFriend ? "Remove" : "Add"}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {friends.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No close friends yet. Search to add someone.
                </p>
              )}
              {friends.map((f: any) => (
                <div key={f.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={f.profiles?.avatar_url || undefined} />
                      <AvatarFallback>{f.profiles?.full_name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{f.profiles?.full_name || "User"}</span>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeFriend(f.friend_id)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
