import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Sparkles, Trash2, MapPin, Calendar } from "lucide-react";
import {
  useLifeEvents,
  LIFE_EVENT_LABELS,
  type LifeEventKind,
} from "@/hooks/useLifeEvents";
import { format } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  userId: string;
  isOwnProfile: boolean;
}

export function LifeEventsTimeline({ userId, isOwnProfile }: Props) {
  const { list, create, remove } = useLifeEvents(userId);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<LifeEventKind>("milestone");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [visibility, setVisibility] = useState<"public" | "friends" | "private">(
    "public"
  );

  const reset = () => {
    setKind("milestone");
    setTitle("");
    setDescription("");
    setLocation("");
    setEventDate("");
    setVisibility("public");
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    await create.mutateAsync({
      user_id: userId,
      kind,
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      event_date: eventDate || null,
      cover_image_url: null,
      visibility,
    });
    reset();
    setOpen(false);
  };

  const events = list.data ?? [];

  return (
    <>
      <FloatingHowItWorks title={"Life Events Timeline - How it works"} steps={[{ title: 'Open', desc: 'Access the Life Events Timeline section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Life Events Timeline.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Life Events
        </h3>
        {isOwnProfile && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a life event</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Type</Label>
                  <Select value={kind} onValueChange={(v) => setKind(v as LifeEventKind)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(LIFE_EVENT_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v.emoji} {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Started a new job at..." />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City" />
                  </div>
                </div>
                <div>
                  <Label>Visibility</Label>
                  <Select value={visibility} onValueChange={(v) => setVisibility(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends</SelectItem>
                      <SelectItem value="private">Only me</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={!title.trim() || create.isPending}>
                  {create.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No life events yet
        </p>
      ) : (
        <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-1 before:bottom-1 before:w-px before:bg-border">
          {events.map((ev) => {
            const meta = LIFE_EVENT_LABELS[ev.kind] ?? LIFE_EVENT_LABELS.other;
            return (
              <div key={ev.id} className="relative">
                <div className="absolute -left-[18px] top-1 w-5 h-5 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-[11px]">
                  {meta.emoji}
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {meta.label}
                      </div>
                      <div className="font-semibold text-sm">{ev.title}</div>
                    </div>
                    {isOwnProfile && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => remove.mutate(ev.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  {ev.description && (
                    <p className="text-xs text-muted-foreground mt-1">{ev.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-muted-foreground">
                    {ev.event_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(ev.event_date), "PP")}
                      </span>
                    )}
                    {ev.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {ev.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
    </>
  );
}
