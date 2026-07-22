import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePostHistory } from "@/hooks/usePostEdit";
import { formatDistanceToNow } from "date-fns";

interface PostEditHistoryDialogProps {
  postId: string;
}

export const PostEditHistoryDialog = ({ postId }: PostEditHistoryDialogProps) => {
  const { history, isLoading } = usePostHistory(postId);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <History className="w-4 h-4 mr-2" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit History</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No edit history available
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    Edited {formatDistanceToNow(new Date(entry.edited_at), { addSuffix: true })}
                  </div>
                  <div className="text-sm">{entry.previous_content}</div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
