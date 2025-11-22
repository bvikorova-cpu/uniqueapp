import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { usePostEdit } from "@/hooks/usePostEdit";

interface EditPostDialogProps {
  postId: string;
  currentContent: string;
}

export const EditPostDialog = ({ postId, currentContent }: EditPostDialogProps) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(currentContent);
  const { editPost, isEditing } = usePostEdit();

  const handleSave = () => {
    if (content.trim() && content !== currentContent) {
      editPost(
        { postId, newContent: content },
        {
          onSuccess: () => {
            setOpen(false);
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px]"
            placeholder="What's on your mind?"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isEditing || !content.trim()}>
              {isEditing ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
