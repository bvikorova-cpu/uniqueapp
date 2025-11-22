import { Ban, BanIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";

interface BlockButtonProps {
  userId: string;
}

export const BlockButton = ({ userId }: BlockButtonProps) => {
  const { isBlocked, blockUser, unblockUser } = useBlockedUsers();
  const blocked = isBlocked(userId);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => (blocked ? unblockUser(userId) : blockUser(userId))}
    >
      {blocked ? (
        <>
          <BanIcon className="w-4 h-4 mr-2" />
          Unblock
        </>
      ) : (
        <>
          <Ban className="w-4 h-4 mr-2" />
          Block
        </>
      )}
    </Button>
  );
};
