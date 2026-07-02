import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Video, Calendar, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

interface Booking {
  id: string;
  topic: string;
  scheduled_at: string;
  status: string;
  meeting_url: string | null;
}

/** Premium video-call booking with support. Authenticated only. */
export function VideoCallBooking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<string>(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [slot, setSlot] = useState<string>("10:00");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const load = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("support_video_bookings")
      .select("id, topic, scheduled_at, status, meeting_url")
      .eq("user_id", user.id)
      .order("scheduled_at", { ascending: false })
      .limit(5);
    setBookings((data as Booking[]) || []);
  };

  useEffect(() => { load(); }, [user?.id]);

  const submit = async () => {
    if (!user?.id) {
      toast({ title: "Sign in to book a call", variant: "destructive" });
      return;
    }
    if (topic.trim().length < 4) {
      toast({ title: "Topic too short", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const scheduledAt = new Date(`${date}T${slot}:00`).toISOString();
      const { error } = await supabase.from("support_video_bookings").insert({
        user_id: user.id,
        email: user.email ?? "",
        name: (user.user_metadata?.full_name as string) || user.email || "Customer",
        topic: topic.trim(),
        scheduled_at: scheduledAt,
        notes: notes.trim() || null,
      });
      if (error) throw error;
      toast({ title: "Call request sent", description: "We'll email you a meeting link shortly." });
      setTopic("");
      setNotes("");
      load();
    } catch (e: any) {
      toast({ title: "Booking failed", description: e?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <FloatingHowItWorks title={"Video Call Booking - How it works"} steps={[{ title: 'Open', desc: 'Access the Video Call Booking section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Video Call Booking.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-2 mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Video className="h-4 w-4 text-primary" /> Book a video call
        </CardTitle>
        <CardDescription className="text-xs">
          Premium support — 30-min Zoom-style call with a human within 24 hours.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3" /> Date
            </label>
            <Input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <Clock className="h-3 w-3" /> Time slot
            </label>
            <div className="flex flex-wrap gap-1">
              {SLOTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlot(s)}
                  className={`px-2 py-1 text-[11px] rounded border-2 font-bold transition-all ${
                    slot === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Input placeholder="Topic (e.g. payout setup help)" value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={120} />
        <Textarea placeholder="Anything we should prepare? (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} className="min-h-[60px] resize-none" />

        <Button onClick={submit} disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
          Request call
        </Button>

        {bookings.length > 0 && (
          <div className="pt-2 border-t border-border/40 space-y-1.5">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Your recent bookings</p>
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-xs p-2 rounded bg-card/50 border border-border/40">
                <div className="min-w-0 flex-1">
                  <p className="font-bold truncate">{b.topic}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(b.scheduled_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {b.meeting_url && (
                    <a href={b.meeting_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-[11px] font-bold">
                      Join
                    </a>
                  )}
                  <Badge variant={b.status === "confirmed" ? "default" : "secondary"} className="text-[9px]">
                    {b.status === "confirmed" && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />}
                    {b.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
