import { useState } from "react";
import { usePostScheduling } from "@/hooks/usePostScheduling";
import { Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SchedulePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SchedulePostDialog = ({ open,
  onOpenChange }: SchedulePostDialogProps) => {
  const { schedulePost } = usePostScheduling();
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSchedule = () => {
    if (!content || !date || !time) return;

    const scheduledFor = new Date(`${date}T${time}`);
    schedulePost({ content, scheduledFor });
    
    setContent("");
    setDate("");
    setTime("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Schedule Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px]"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSchedule}
            disabled={!content || !date || !time}
            className="w-full"
          >
            Schedule Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
