import { Button } from "@/components/ui/button";
import { useFollowStatus, useFollowMutation } from "@/hooks/useFollow";
import { Loader2, UserPlus, UserMinus } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  currentUserId?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export const FollowButton = ({
  userId,
  currentUserId,
  variant = "default",
  size = "default",
}: FollowButtonProps) => {
  const { data: followStatus, isLoading } = useFollowStatus(userId, currentUserId);
  const followMutation = useFollowMutation();

  if (!currentUserId || currentUserId === userId) return null;

  const handleClick = () => {
    if (!currentUserId) return;

    followMutation.mutate({
      followerId: currentUserId,
      followingId: userId,
      action: followStatus?.isFollowing ? "unfollow" : "follow",
    });
  };

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant={followStatus?.isFollowing ? "outline" : variant}
      size={size}
      onClick={handleClick}
      disabled={followMutation.isPending}
    >
      {followMutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : followStatus?.isFollowing ? (
        <UserMinus className="h-4 w-4 mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {followStatus?.isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
};
