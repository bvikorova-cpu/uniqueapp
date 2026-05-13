import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Flag } from "lucide-react";
import { useModerationQueue } from "@/hooks/useModerationQueue";

export const ReportDialog = ({
  contentType,
  contentId,
  communityId,
  trigger,
}: {
  contentType: "post" | "comment" | "user" | "message";
  contentId: string;
  communityId?: string;
  trigger?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const { submitReport } = useModerationQueue();

  const handle = () => {
    submitReport({ content_type: contentType, content_id: contentId, community_id: communityId, reason });
    setReason(""); setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm">
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
