import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FollowButton } from "./FollowButton";

interface FriendsModalProps {
  userId: string;
  currentUserId?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface FriendProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export const FriendsModal = ({ userId, currentUserId, isOpen, onClose }: FriendsModalProps) => {
  const navigate = useNavigate();

  const { data: friends, isLoading } = useQuery({
    queryKey: ["friends-list", userId],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .eq("status", "accepted")
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);
      if (error) throw error;

      const seen = new Set<string>();
      for (const r of rows || []) {
        const other = r.user_id === userId ? r.friend_id : r.user_id;
        if (other && other !== userId) seen.add(other);
      }
      const ids = Array.from(seen);
      if (ids.length === 0) return [];

      const { data: profiles, error: pErr } = await supabase
        .rpc("get_profiles_basic", { _ids: ids });
      if (pErr) throw pErr;
      return ((profiles as unknown as FriendProfile[]) || []).sort((a, b) =>
        (a.full_name || "").localeCompare(b.full_name || ""),
      );
    },
    enabled: isOpen });

  const handleUserClick = (id: string) => {
    navigate(`/profile/${id}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Friends ({friends?.length || 0})</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto mt-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !friends || friends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No friends yet</p>
            </div>
          ) : (
            friends.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                  onClick={() => handleUserClick(user.id)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{user.full_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold truncate">
                    {user.full_name || "Member"}
                  </p>
                </div>
                <FollowButton
                  targetUserId={user.id}
                  currentUserId={currentUserId}
                  variant="outline"
                  size="sm"
                />
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
