import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const publicProfiles = () => (supabase as any).from("public_profiles");

interface TagFriendsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFriends: string[];
  onToggleFriend: (friendId: string) => void;
}

export function TagFriendsDialog({
  open,
  onOpenChange,
  selectedFriends,
  onToggleFriend,
}: TagFriendsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: friends = [] } = useQuery({
    queryKey: ["friends-for-tagging", user?.id, searchQuery],
    queryFn: async () => {
      if (!user) return [];

      const { data: friendships } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq("status", "accepted");

      const friendIds = friendships?.map((f) =>
        f.user_id === user.id ? f.friend_id : f.user_id
      ) || [];

      if (friendIds.length === 0) return [];

      let query = publicProfiles()
        .select("id, full_name, avatar_url, username")
        .in("id", friendIds);

      if (searchQuery.trim()) {
        query = query.or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`);
      }

      const { data: profiles } = await query;
      return profiles || [];
    },
    enabled: !!user,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tag Friends</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends..."
            className="pl-10"
          />
        </div>

        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {friends.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No friends found</p>
              </div>
            ) : (
              friends.map((friend) => {
                const isSelected = selectedFriends.includes(friend.id);
                return (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 cursor-pointer"
                    onClick={() => onToggleFriend(friend.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={friend.avatar_url || undefined} />
                        <AvatarFallback>{friend.full_name?.[0] ?? friend.username?.[0] ?? "?"}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{friend.full_name ?? friend.username ?? "User"}</span>
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-primary">Tagged</span>
                        <X className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Done ({selectedFriends.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}