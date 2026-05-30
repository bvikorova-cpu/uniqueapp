import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarClock, Bell, BellOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { shadowArenaCall } from "@/hooks/useShadowArenaRouter";
import { toast } from "sonner";

interface S { id: string; title: string; description: string | null; scheduled_for: string; cover_emoji: string; creator_id: string; }

export function StreamScheduleCard() {
  const [items, setItems] = useState<S[]>([]);
  const [subs, setSubs] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from("shadow_stream_schedule")
      .select("*").gte("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true }).limit(10);
    setItems((data as S[]) || []);
    if (user && data) {
      const ids = (data as S[]).map((d) => d.id);
      const { data: r } = await supabase.from("shadow_stream_reminders")
        .select("schedule_id").eq("user_id", user.id).in("schedule_id", ids);
      setSubs(new Set((r || []).map((x: any) => x.schedule_id)));
    }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim() || !when) return;
    try {
      await shadowArenaCall("schedule_create", { title, scheduled_for: new Date(when).toISOString() });
      setTitle(""); setWhen(""); await load(); toast.success("Stream scheduled!");
    } catch (e: any) { toast.error(e.message); }
  };
  const remind = async (id: string) => {
    try {
      const r = await shadowArenaCall<{ subscribed: boolean }>("reminder_toggle", { schedule_id: id });
      const ns = new Set(subs); if (r.subscribed) ns.add(id); else ns.delete(id); setSubs(ns);
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <Card className="p-5 mb-6 border-purple-900/40">
      <div className="flex items-center gap-2 mb-3">
        <CalendarClock className="h-5 w-5 text-cyan-400" />
        <h3 className="font-bold">Upcoming Streams</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        <Input placeholder="Stream title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        <Button onClick={create}>Schedule</Button>
      </div>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground">No scheduled streams yet.</p>}
        {items.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-3 rounded border border-border/50 bg-black/30">
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{s.cover_emoji} {s.title}</div>
              <div className="text-xs text-muted-foreground">{new Date(s.scheduled_for).toLocaleString()}</div>
            </div>
            <Button size="sm" variant="outline" onClick={() => remind(s.id)}>
              {subs.has(s.id) ? <><BellOff className="h-3 w-3 mr-1" />Off</> : <><Bell className="h-3 w-3 mr-1" />Remind</>}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
