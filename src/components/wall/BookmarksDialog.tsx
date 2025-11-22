import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBookmarks } from "@/hooks/useBookmarks";
import { formatDistanceToNow } from "date-fns";

export const BookmarksDialog = () => {
  const [open, setOpen] = useState(false);
  const { bookmarks, isLoading } = useBookmarks();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Bookmark className="w-4 h-4 mr-2" />
          Bookmarks ({bookmarks.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Saved Bookmarks</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px] w-full">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : bookmarks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No bookmarks yet. Save posts to access them later!
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarks.map((bookmark) => (
                <div key={bookmark.id} className="border rounded-lg p-4 hover:bg-accent">
                  <div className="text-sm text-muted-foreground mb-2">
                    Saved {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
                  </div>
                  <p className="text-sm">{bookmark.posts?.content}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
