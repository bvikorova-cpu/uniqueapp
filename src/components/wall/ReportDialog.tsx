import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useReports } from "@/hooks/useReports";

interface ReportDialogProps {
  postId?: string;
  userId?: string;
  variant?: "ghost" | "destructive";
}

export const ReportDialog = ({ postId, userId, variant = "ghost" }: ReportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reason, setReason] = useState("");
  const { reportPost, reportUser, isReporting } = useReports();

  const handleSubmit = () => {
    if (!reportType || !reason.trim()) return;

    if (postId) {
      reportPost(
        { postId, reportType, reason },
        {
          onSuccess: () => {
            setOpen(false);
            setReportType("");
            setReason("");
          },
        }
      );
    } else if (userId) {
      reportUser(
        { userId, reportType, reason },
        {
          onSuccess: () => {
            setOpen(false);
            setReportType("");
            setReason("");
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm">
          <Flag className="w-4 h-4 mr-2" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {postId ? "Post" : "User"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="hate_speech">Hate Speech</SelectItem>
                <SelectItem value="violence">Violence</SelectItem>
                <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                <SelectItem value="misinformation">Misinformation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Additional Details</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide more details about this report..."
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isReporting || !reportType || !reason.trim()}
            >
              {isReporting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
