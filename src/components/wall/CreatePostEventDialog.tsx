import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface PostEventDraft {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  maxAttendees: number | null;
}

interface CreatePostEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (draft: PostEventDraft) => void;
  initial?: PostEventDraft | null;
}

/**
 * Small in-composer form that turns a post into a real event
 * (title, date/time, place, capacity) instead of placeholder text.
 */
export const CreatePostEventDialog = ({ open, onOpenChange, onSave, initial }: CreatePostEventDialogProps) => {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [startTime, setStartTime] = useState(initial?.startTime ?? "");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "");
  const [maxAttendees, setMaxAttendees] = useState(initial?.maxAttendees ? String(initial.maxAttendees) : "");

  const valid = !!title.trim() && !!startTime;

  const handleSave = () => {
    if (!valid) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      startTime,
      endTime: endTime || startTime,
      maxAttendees: maxAttendees ? Number(maxAttendees) : null });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Add an event to your post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="ev-title">Event name</Label>
            <Input id="ev-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summer BBQ Party" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ev-start">Starts</Label>
              <Input id="ev-start" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ev-end">Ends</Label>
              <Input id="ev-end" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="ev-loc">Place</Label>
            <Input id="ev-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Central Park" />
          </div>
          <div>
            <Label htmlFor="ev-desc">Details (optional)</Label>
            <Textarea id="ev-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Bring your friends…" />
          </div>
          <div>
            <Label htmlFor="ev-cap">Capacity (optional)</Label>
            <Input id="ev-cap" type="number" min={1} value={maxAttendees} onChange={(e) => setMaxAttendees(e.target.value)} placeholder="Unlimited" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!valid}>Attach event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
