import { useState } from "react";
import { useDrafts } from "@/hooks/useDrafts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Edit } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface DraftsManagerProps {
  onSelectDraft?: (draft: any) => void;
}

export const DraftsManager = ({ onSelectDraft }: DraftsManagerProps) => {
  const [open, setOpen] = useState(false);
  const { drafts, deleteDraft } = useDrafts();

  const handleSelectDraft = (draft: any) => {
    onSelectDraft?.(draft);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Drafts {drafts.length > 0 && `(${drafts.length})`}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Your Drafts</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {drafts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No drafts yet
              </div>
            ) : (
              drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="p-4 border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 cursor-pointer" onClick={() => handleSelectDraft(draft)}>
                      <p className="line-clamp-2 mb-2">{draft.content}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {formatDistanceToNow(new Date(draft.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        {draft.media_urls && draft.media_urls.length > 0 && (
                          <span>{draft.media_urls.length} media</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectDraft(draft)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDraft(draft.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
