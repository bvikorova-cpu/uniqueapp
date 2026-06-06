import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarHeart, MapPin, Video, Check, X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DatePlan {
  id: string;
  match_id: string;
  proposed_by: string;
  title: string;
  location: string | null;
  scheduled_at: string;
  mode: "in_person" | "virtual";
  status: "proposed" | "accepted" | "declined" | "completed" | "canceled";
  notes: string | null;
}

interface Props {
  matchId: string;
  userId: string;
}

export const DatePlanCard = ({ matchId, userId }: Props) => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<DatePlan[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "Coffee", location: "", scheduled_at: "", mode: "in_person" as const, notes: "",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("dating_date_plans")
      .select("*").eq("match_id", matchId).order("scheduled_at", { ascending: false });
    setPlans((data as DatePlan[]) ?? []);
  };

  useEffect(() => { load(); }, [matchId]);

  useEffect(() => {
    const ch = supabase.channel(`date-plans:${matchId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "dating_date_plans", filter: `match_id=eq.${matchId}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [matchId]);

  const propose = async () => {
    if (!form.title.trim() || !form.scheduled_at) {
      toast({ title: "Title and date required", variant: "destructive" }); return;
    }
    setSaving(true);
    const { error } = await supabase.from("dating_date_plans").insert({
      match_id: matchId, proposed_by: userId,
      title: form.title.trim(),
      location: form.location.trim() || null,
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      mode: form.mode, notes: form.notes.trim() || null,
    });
    setSaving(false);
    if (error) { toast({ title: "Could not propose", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Date proposed 💜" });
    setOpen(false);
    setForm({ title: "Coffee", location: "", scheduled_at: "", mode: "in_person", notes: "" });
  };

  const respond = async (id: string, status: DatePlan["status"]) => {
    const { error } = await supabase.from("dating_date_plans").update({ status }).eq("id", id);
    if (error) toast({ title: "Could not update", variant: "destructive" });
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

  return (
    <>
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CalendarHeart className="h-4 w-4 text-primary" /> Date Plans
            <Button size="sm" variant="ghost" className="ml-auto h-7 gap-1" onClick={() => setOpen(true)}>
              <Plus className="h-3 w-3" /> Propose
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {plans.length === 0 && <p className="text-xs text-muted-foreground">No dates planned yet. Make the first move.</p>}
          {plans.map((p) => {
            const mine = p.proposed_by === userId;
            const pending = p.status === "proposed";
            return (
              <div key={p.id} className="rounded-lg border border-border bg-card p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(p.scheduled_at)}</p>
                  </div>
                  <Badge variant={p.status === "accepted" ? "default" : p.status === "declined" || p.status === "canceled" ? "destructive" : "outline"} className="text-[10px] capitalize">
                    {p.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {p.mode === "virtual" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                  <span>{p.mode === "virtual" ? "Virtual" : p.location || "Location TBD"}</span>
                </div>
                {p.notes && <p className="text-xs text-muted-foreground italic">"{p.notes}"</p>}
                {pending && !mine && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="default" className="flex-1 h-7" onClick={() => respond(p.id, "accepted")}>
                      <Check className="h-3 w-3 mr-1" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 h-7" onClick={() => respond(p.id, "declined")}>
                      <X className="h-3 w-3 mr-1" /> Decline
                    </Button>
                  </div>
                )}
                {pending && mine && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => respond(p.id, "canceled")}>
                    Cancel proposal
                  </Button>
                )}
                {p.status === "accepted" && new Date(p.scheduled_at) < new Date() && (
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => respond(p.id, "completed")}>
                    Mark as completed
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><CalendarHeart className="h-5 w-5 text-primary" /> Propose a date</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1">What?</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Coffee, dinner, hike..." maxLength={60} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">When?</label>
              <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant={form.mode === "in_person" ? "default" : "outline"} size="sm" onClick={() => setForm({ ...form, mode: "in_person" })}>
                <MapPin className="h-3 w-3 mr-1" /> In person
              </Button>
              <Button type="button" variant={form.mode === "virtual" ? "default" : "outline"} size="sm" onClick={() => setForm({ ...form, mode: "virtual" })}>
                <Video className="h-3 w-3 mr-1" /> Virtual
              </Button>
            </div>
            {form.mode === "in_person" && (
              <div>
                <label className="text-xs font-medium block mb-1">Where?</label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Cafe name, address..." maxLength={120} />
              </div>
            )}
            <div>
              <label className="text-xs font-medium block mb-1">Note (optional)</label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Looking forward to it!" rows={2} maxLength={300} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={propose} disabled={saving}>{saving ? "Sending..." : "Send proposal"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
