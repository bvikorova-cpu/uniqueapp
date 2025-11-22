import { useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDrafts } from "@/hooks/useDrafts";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";

interface DraftsDialogProps {
  onSelectDraft?: (draft: any) => void;
}

export const DraftsDialog = ({ onSelectDraft }: DraftsDialogProps) => {
  const [open, setOpen] = useState(false);
  const { drafts, deleteDraft } = useDrafts();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Drafts ({drafts.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Your Drafts</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96">
          {drafts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No drafts yet
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft) => (
                <Card
                  key={draft.id}
                  className="p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => {
                    onSelectDraft?.(draft);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">
                        {draft.content || "Empty draft"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Saved {formatDistanceToNow(new Date(draft.updated_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDraft(draft.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
