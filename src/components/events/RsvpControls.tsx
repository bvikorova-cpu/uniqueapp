import { Check, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEventRsvps, type RsvpStatus } from "@/hooks/useEventRsvps";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Props {
  eventId: string;
  capacity?: number;
}

export const RsvpControls = ({ eventId, capacity }: Props) => {
  const { user } = useAuth();
  const { rsvps, goingCount, waitlistCount, setRsvp, cancelRsvp } = useEventRsvps(eventId, capacity);

  const myRsvp = rsvps.find((r) => r.user_id === user?.id);
  const full = capacity ? goingCount >= capacity : false;

  const Btn = ({ status, label, icon: Icon }: { status: RsvpStatus; label: string; icon: any }) => {
    const active = myRsvp?.status === status;
    return (
      <Button
        size="sm"
        variant={active ? "default" : "outline"}
        onClick={() => setRsvp(status)}
        className={cn("flex-1 gap-1.5", active && "shadow-md")}
      >
        <Icon className="h-4 w-4" />
        {label}
      </Button>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">
          {goingCount} going{capacity ? ` / ${capacity}` : ""}
        </span>
        {waitlistCount > 0 && (
          <span className="text-muted-foreground">{waitlistCount} on waitlist</span>
        )}
      </div>

      <div className="flex gap-2">
        <Btn status="going" label={full && !myRsvp ? "Waitlist" : "Going"} icon={Check} />
        <Btn status="declined" label="Decline" icon={X} />
      </div>

      {myRsvp?.status === "waitlist" && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" /> Position #{myRsvp.waitlist_position} on waitlist
        </div>
      )}

      {myRsvp && (
        <Button size="sm" variant="ghost" className="w-full text-xs" onClick={() => cancelRsvp()}>
          Cancel RSVP
        </Button>
      )}
    </div>
  );
};
