import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";

interface BlockUserButtonProps {
  userId: string;
  userName: string;
}

export const BlockUserButton = ({ userId, userName }: BlockUserButtonProps) => {
  const { isBlocked, blockUser, unblockUser } = useBlockedUsers();
  const blocked = isBlocked(userId);

  const handleToggleBlock = () => {
    if (blocked) {
      unblockUser(userId);
    } else {
      blockUser(userId);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={blocked ? "outline" : "destructive"} size="sm" className="gap-2">
          <Ban className="w-4 h-4" />
          {blocked ? "Unblock" : "Block"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {blocked ? "Unblock" : "Block"} {userName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {blocked
              ? `${userName} will be able to see your posts and interact with you again.`
              : `${userName} will no longer be able to see your posts, tag you, or send you messages.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleToggleBlock}>
            {blocked ? "Unblock" : "Block"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
