import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useReminders } from "@/hooks/useReminders";

interface ReminderDialogProps {
  postId: string;
}

export const ReminderDialog = ({ postId }: ReminderDialogProps) => {
  const [open, setOpen] = useState(false);
  const [timeframe, setTimeframe] = useState("1h");
  const { setReminder } = useReminders();

  const handleSetReminder = () => {
    const now = new Date();
    let remindAt = new Date(now);

    switch (timeframe) {
      case "1h":
        remindAt.setHours(now.getHours() + 1);
        break;
      case "3h":
        remindAt.setHours(now.getHours() + 3);
        break;
      case "tomorrow":
        remindAt.setDate(now.getDate() + 1);
        remindAt.setHours(9, 0, 0, 0);
        break;
      case "week":
        remindAt.setDate(now.getDate() + 7);
        break;
    }

    setReminder(
      { postId, remindAt },
      {
        onSuccess: () => {
          setOpen(false);
        } }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Clock className="w-4 h-4 mr-2" />
          Remind Me
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Reminder</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <RadioGroup value={timeframe} onValueChange={setTimeframe}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1h" id="1h" />
              <Label htmlFor="1h">In 1 hour</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3h" id="3h" />
              <Label htmlFor="3h">In 3 hours</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="tomorrow" id="tomorrow" />
              <Label htmlFor="tomorrow">Tomorrow at 9 AM</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="week" id="week" />
              <Label htmlFor="week">In 1 week</Label>
            </div>
          </RadioGroup>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetReminder}>Set Reminder</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
