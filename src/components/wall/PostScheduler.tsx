import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PostSchedulerProps {
  onSchedule: (date: Date) => void;
  onCancel: () => void;
  scheduledDate?: Date | null;
}

export function PostScheduler({ onSchedule, onCancel, scheduledDate }: PostSchedulerProps) {
  const [date, setDate] = useState<Date | undefined>(scheduledDate || undefined);
  const [hour, setHour] = useState(scheduledDate ? String(scheduledDate.getHours()) : "12");
  const [minute, setMinute] = useState(scheduledDate ? String(scheduledDate.getMinutes()) : "0");

  const handleSchedule = () => {
    if (!date) return;
    const scheduled = new Date(date);
    scheduled.setHours(parseInt(hour), parseInt(minute), 0, 0);
    if (scheduled <= new Date()) return;
    onSchedule(scheduled);
  };

  const isValid = date && new Date(date).setHours(parseInt(hour), parseInt(minute)) > Date.now();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass-card p-4 rounded-2xl space-y-4 border border-primary/10"
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Clock className="h-4 w-4 text-primary" />
        <span>Schedule Post</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal flex-1 rounded-xl",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <div className="flex gap-2">
          <Select value={hour} onValueChange={setHour}>
            <SelectTrigger className="w-20 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, i) => (
                <SelectItem key={i} value={String(i)}>
                  {String(i).padStart(2, "0")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="self-center text-muted-foreground font-bold">:</span>
          <Select value={minute} onValueChange={setMinute}>
            <SelectTrigger className="w-20 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {String(m).padStart(2, "0")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {date && !isValid && (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          <span>Scheduled time must be in the future</span>
        </div>
      )}

      {scheduledDate && (
        <div className="text-xs text-muted-foreground bg-primary/5 p-2 rounded-lg">
          Currently scheduled for: {format(scheduledDate, "PPP 'at' HH:mm")}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel} className="rounded-xl">
          Cancel
        </Button>
        <Button 
          size="sm" 
          onClick={handleSchedule} 
          disabled={!isValid}
          className="rounded-xl bg-primary/90 hover:bg-primary gap-2"
        >
          <Send className="h-3 w-3" />
          {scheduledDate ? "Update Schedule" : "Schedule"}
        </Button>
      </div>
    </motion.div>
  );
}
