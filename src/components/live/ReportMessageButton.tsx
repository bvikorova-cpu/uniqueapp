import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  messageId: string;
  streamId: string;
  reporterId: string | null | undefined;
}

export function ReportMessageButton({ messageId, streamId, reporterId }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reporterId) {
      toast.error("Sign in to report messages");
      return;
    }
    if (!reason.trim()) return;
    setLoading(true);
    const { error } = await (supabase as any).from("stream_message_reports").insert({
      message_id: messageId,
      stream_id: streamId,
      reporter_id: reporterId,
      reason: reason.trim().slice(0, 500),
    });
    setLoading(false);
    if (error) {
      if (error.code === "23505") toast.info("You already reported this message");
      else toast.error("Failed to report");
      return;
    }
    toast.success("Report sent to moderators");
    setOpen(false);
    setReason("");
  };

  return (
    <>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(true)} aria-label="Report message">
        <Flag className="h-3 w-3" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report message</DialogTitle>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this message inappropriate? (spam, harassment, hate speech...)"
            maxLength={500}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={loading || !reason.trim()}>
              {loading ? "Sending..." : "Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
