import { Button } from "@/components/ui/button";
import { useIsFollowing, useFollowMutation, useUnfollowMutation } from "@/hooks/useFollow";
import { Loader2, UserPlus, UserMinus } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
  const { data: isFollowing, isLoading } = useIsFollowing(currentUserId, userId);
  const followMutation = useFollowMutation();
  const unfollowMutation = useUnfollowMutation();

  if (!currentUserId || currentUserId === userId) return null;

  const handleClick = () => {
    if (!currentUserId) return;

    if (isFollowing) {
      unfollowMutation.mutate({ followerId: currentUserId, followingId: userId });
    } else {
      followMutation.mutate({ followerId: currentUserId, followingId: userId });
    }
  };

  const isProcessing = followMutation.isPending || unfollowMutation.isPending;

  if (isLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Follow Button - How it works"} steps={[{ title: 'Open', desc: 'Access the Follow Button section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Follow Button.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Button variant={variant} size={size} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    </>
  );
  }

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={handleClick}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : isFollowing ? (
        <UserMinus className="h-4 w-4 mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
};
