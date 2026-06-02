import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  useIsFollowing,
  useFollowMutation,
  useUnfollowMutation,
} from "@/hooks/useFollow";

interface FollowButtonProps {
  userId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export const FollowButton = ({ userId, variant = "default", size = "default" }: FollowButtonProps) => {
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: isFollowing = false } = useIsFollowing(currentUser?.id, userId);
  const followMutation = useFollowMutation();
  const unfollowMutation = useUnfollowMutation();

  const pending = followMutation.isPending || unfollowMutation.isPending;
  const disabled = !currentUser || currentUser.id === userId || pending;

  const handleClick = () => {
    if (!currentUser) return;
    const args = { followerId: currentUser.id, followingId: userId };
    if (isFollowing) unfollowMutation.mutate(args);
    else followMutation.mutate(args);
  };

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={handleClick}
      disabled={disabled}
    >
      {pending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="w-4 h-4 mr-2" />
      ) : (
        <UserPlus className="w-4 h-4 mr-2" />
      )}
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
};
