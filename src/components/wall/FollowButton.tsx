import { UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFollows } from "@/hooks/useFollows";

interface FollowButtonProps {
  userId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export const FollowButton = ({ userId, variant = "default", size = "default" }: FollowButtonProps) => {
  const { isFollowing, toggleFollow } = useFollows();

  return (
    <Button
      variant={isFollowing(userId) ? "outline" : variant}
      size={size}
      onClick={() => toggleFollow(userId)}
    >
      {isFollowing(userId) ? (
        <>
          <UserMinus className="w-4 h-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
};
