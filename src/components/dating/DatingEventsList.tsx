import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, MapPin, Plus, Users, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface DEvent {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  mode: string;
  starts_at: string;
  ends_at: string | null;
  city: string | null;
  max_participants: number | null;
  cover_url: string | null;
  going_count?: number;
  i_am_going?: boolean;
}

export const DatingEventsList = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const [events, setEvents] = useState<DEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", mode: "mixer", starts_at: "", city: "", max_participants: ""
  });

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("dating_events")
      .select("*")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(50);
    const list: DEvent[] = data || [];

    const ids = list.map(e => e.id);
    if (ids.length) {
      const { data: parts } = await (supabase as any)
        .from("dating_event_participants")
        .select("event_id,user_id,status")
        .in("event_id", ids)
        .eq("status", "going");
      const counts = new Map<string, number>();
      const mine = new Set<string>();
      (parts || []).forEach((p: any) => {
        counts.set(p.event_id, (counts.get(p.event_id) || 0) + 1);
        if (p.user_id === userId) mine.add(p.event_id);
      });
      list.forEach(e => {
        e.going_count = counts.get(e.id) || 0;
        e.i_am_going = mine.has(e.id);
      });
    }
    setEvents(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, [userId]);

  const create = async () => {
    if (!form.title || !form.starts_at) {
      toast({ title: "Title & start date required", variant: "destructive" });
      return;
    }
    const { error } = await (supabase as any).from("dating_events").insert({
      host_id: userId,
      title: form.title,
      description: form.description || null,
      mode: form.mode,
      starts_at: new Date(form.starts_at).toISOString(),
      city: form.city || null,
      max_participants: form.max_participants ? parseInt(form.max_participants) : null,
    });
    if (error) { toast({ title: error.message, variant: "destructive" }); return; }
    toast({ title: "Event created 🎉" });
    setOpen(false);
    setForm({ title: "", description: "", mode: "mixer", starts_at: "", city: "", max_participants: "" });
    load();
  };

  const rsvp = async (e: DEvent) => {
    if (e.i_am_going) {
      await (supabase as any).from("dating_event_participants")
        .delete().eq("event_id", e.id).eq("user_id", userId);
    } else {
      await (supabase as any).from("dating_event_participants")
        .upsert({ event_id: e.id, user_id: userId, status: "going" }, { onConflict: "event_id,user_id" });
    }
    load();
  };

  return (
    <div className="space-y-4">
      <FloatingHowItWorks
        title={"Dating Events List"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Dating Events</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Host</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Host a dating event</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Speed dating night" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Mode</Label>
                  <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="speed_dating">Speed dating</SelectItem>
                      <SelectItem value="mixer">Mixer</SelectItem>
                      <SelectItem value="group_date">Group date</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Starts at</Label><Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                <div><Label>Max participants</Label><Input type="number" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value })} /></div>
              </div>
              <Button onClick={create} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && events.length === 0 && (
        <Card className="p-6 text-center text-sm text-muted-foreground">No upcoming events. Host one!</Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {events.map((e) => (
          <Card key={e.id} className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold leading-tight">{e.title}</h4>
              <Badge variant="secondary" className="capitalize">{e.mode.replace("_", " ")}</Badge>
            </div>
            {e.description && <p className="text-xs text-muted-foreground line-clamp-2">{e.description}</p>}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(e.starts_at).toLocaleString()}</span>
              {e.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{e.city}</span>}
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs flex items-center gap-1"><Users className="h-3 w-3" />{e.going_count || 0}{e.max_participants ? `/${e.max_participants}` : ""}</span>
              <Button size="sm" variant={e.i_am_going ? "secondary" : "default"} onClick={() => rsvp(e)}>
                {e.i_am_going ? "Going ✓" : "RSVP"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
