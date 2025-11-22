import { Archive, ArchiveX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useArchive } from "@/hooks/useArchive";

interface ArchiveButtonProps {
  postId: string;
}

export const ArchiveButton = ({ postId }: ArchiveButtonProps) => {
  const { isArchived, toggleArchive } = useArchive();
  const archived = isArchived(postId);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toggleArchive(postId)}
    >
      {archived ? (
        <>
          <ArchiveX className="w-4 h-4 mr-2" />
          Unarchive
        </>
      ) : (
        <>
          <Archive className="w-4 h-4 mr-2" />
          Archive
        </>
      )}
    </Button>
  );
};
