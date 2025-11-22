import { Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePinnedPosts } from "@/hooks/usePinnedPosts";

interface PinButtonProps {
  postId: string;
  userId: string;
}

export const PinButton = ({ postId, userId }: PinButtonProps) => {
  const { isPinned, togglePin } = usePinnedPosts(userId);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => togglePin(postId)}
    >
      {isPinned(postId) ? (
        <>
          <PinOff className="w-4 h-4 mr-2" />
          Unpin
        </>
      ) : (
        <>
          <Pin className="w-4 h-4 mr-2" />
          Pin
        </>
      )}
    </Button>
  );
};
