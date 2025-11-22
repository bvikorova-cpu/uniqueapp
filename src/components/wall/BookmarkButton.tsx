import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";

interface BookmarkButtonProps {
  postId: string;
}

export const BookmarkButton = ({ postId }: BookmarkButtonProps) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(postId);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toggleBookmark(postId)}
      className={bookmarked ? "text-primary" : ""}
    >
      {bookmarked ? (
        <>
          <BookmarkCheck className="w-4 h-4 mr-2 fill-current" />
          Saved
        </>
      ) : (
        <>
          <Bookmark className="w-4 h-4 mr-2" />
          Save
        </>
      )}
    </Button>
  );
};
