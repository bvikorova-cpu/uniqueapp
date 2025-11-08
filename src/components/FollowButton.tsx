import { Button } from "@/components/ui/button";
import { useIsFollowing, useFollowMutation, useUnfollowMutation } from "@/hooks/useFollow";
import { Loader2, UserPlus, UserMinus } from "lucide-react";

interface FollowButtonProps {
  currentUserId: string | undefined;
  targetUserId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export const FollowButton = ({
  currentUserId,
  targetUserId,
  variant = "default",
  size = "default",
}: FollowButtonProps) => {
  const { data: isFollowing, isLoading } = useIsFollowing(currentUserId, targetUserId);
  const followMutation = useFollowMutation();
  const unfollowMutation = useUnfollowMutation();

  if (!currentUserId || currentUserId === targetUserId) {
    return null;
  }

  const handleClick = () => {
    if (!currentUserId) return;

    if (isFollowing) {
      unfollowMutation.mutate({ followerId: currentUserId, followingId: targetUserId });
    } else {
      followMutation.mutate({ followerId: currentUserId, followingId: targetUserId });
    }
  };

  const isProcessing = followMutation.isPending || unfollowMutation.isPending;

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading || isProcessing}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
};
