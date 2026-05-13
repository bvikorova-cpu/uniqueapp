import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Flag } from "lucide-react";
import { useModerationQueue } from "@/hooks/useModerationQueue";

interface ReportDialogProps {
  contentType?: "post" | "comment" | "user" | "message";
  contentId?: string;
  postId?: string;
  communityId?: string;
  trigger?: React.ReactNode;
  variant?: "ghost" | "outline" | "default";
}

export const ReportDialog = ({
  contentType,
  contentId,
  postId,
  communityId,
  trigger,
  variant = "ghost",
}: ReportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const { submitReport } = useModerationQueue();

  const finalType = contentType ?? (postId ? "post" : "post");
  const finalId = contentId ?? postId ?? "";

  const handle = () => {
    if (!finalId) return;
    submitReport({ content_type: finalType, content_id: finalId, community_id: communityId, reason });
    setReason(""); setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant={variant} size="sm">
            <Flag className="h-4 w-4 mr-1" /> Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report content</DialogTitle>
        </DialogHeader>
        <Textarea
          placeholder="Why are you reporting this? (spam, harassment, hate, ...)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
        />
        <Button onClick={handle} disabled={!reason.trim()}>Submit report</Button>
      </DialogContent>
    </Dialog>
  );
};
