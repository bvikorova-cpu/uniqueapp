import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, Star, Clock, Sparkles, Loader2, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Mentor {
  id: string;
  user_id: string;
  display_name: string;
  expertise: string;
  bio: string | null;
  avatar_emoji: string | null;
  hourly_price_cents: number;
  rating: number;
  sessions_count: number;
}

interface MyBooking {
  id: string;
  mentor_id: string;
  price_cents: number;
  status: string;
  mentor_name?: string;
}

const MegatalentMentorshipBooking = ({ category }: { category?: string }) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({ display_name: "", expertise: "", bio: "", price: 50, emoji: "🎓" });
  const [iAmMentor, setIAmMentor] = useState(false);
  const [myBookings, setMyBookings] = useState<MyBooking[]>([]);
  const [releasing, setReleasing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("mt_mentors").select("*").eq("active", true).order("rating", { ascending: false });
    setMentors((data || []) as Mentor[]);
    setLoading(false);
  };

  const loadMyBookings = async (uid: string) => {
    const { data } = await (supabase as any)
      .from("mt_mentorship_bookings")
      .select("id, mentor_id, price_cents, status")
      .eq("student_id", uid)
      .in("status", ["paid", "completed"])
      .order("created_at", { ascending: false })
      .limit(20);
    const rows = (data || []) as MyBooking[];
    if (rows.length) {
      const mids = [...new Set(rows.map((r) => r.mentor_id))];
      const { data: ms } = await (supabase as any).from("mt_mentors").select("id, display_name").in("id", mids);
      const map: Record<string, string> = {};
      (ms || []).forEach((m: any) => (map[m.id] = m.display_name));
      rows.forEach((r) => (r.mentor_name = map[r.mentor_id] || "Mentor"));
    }
    setMyBookings(rows);
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const { data: mine } = await (supabase as any).from("mt_mentors").select("id").eq("user_id", uid).maybeSingle();
        setIAmMentor(!!mine);
        loadMyBookings(uid);
      }
    });
    load();
  }, []);

  const markCompleted = async (bookingId: string) => {
    setReleasing(bookingId);
    const { data, error } = await supabase.functions.invoke("mt-release-funds", {
      body: { kind: "mentorship", id: bookingId },
    });
    setReleasing(null);
    if (error || (data as any)?.error) {
      toast.error("Release failed", { description: error?.message || (data as any)?.error });
      return;
    }
    toast.success("Session completed — 80% sent to mentor");
    if (userId) loadMyBookings(userId);
  };

  const book = async () => {
    if (!userId || !bookingMentor) {
      toast.error("Sign in to book");
      return;
    }
    if (bookingMentor.user_id === userId) {
      toast.error("Cannot book yourself");
      return;
    }
    setSubmitting(true);
    const { data: booking, error } = await (supabase as any)
      .from("mt_mentorship_bookings")
      .insert({
        mentor_id: bookingMentor.id,
        student_id: userId,
        price_cents: bookingMentor.hourly_price_cents,
        message: bookingMessage.trim() || null,
      })
      .select("id")
      .single();
    if (error || !booking) {
      setSubmitting(false);
      toast.error("Booking failed", { description: error?.message });
      return;
    }
    const { data: co, error: coErr } = await supabase.functions.invoke("mt-checkout", {
      body: { kind: "mentorship", id: booking.id },
    });
    setSubmitting(false);
    if (coErr || !(co as any)?.url) {
      toast.error("Checkout failed", { description: coErr?.message || (co as any)?.error });
      return;
    }
    window.location.href = (co as any).url;
  };

  const apply = async () => {
    if (!userId) return;
    if (applyForm.display_name.length < 2 || applyForm.expertise.length < 2) {
      toast.error("Name and expertise required");
      return;
    }
    setSubmitting(true);
    const { error } = await (supabase as any).from("mt_mentors").insert({
      user_id: userId,
      display_name: applyForm.display_name.trim(),
      expertise: applyForm.expertise.trim(),
      bio: applyForm.bio.trim() || null,
      avatar_emoji: applyForm.emoji || "🎓",
      hourly_price_cents: Math.max(100, Math.round(applyForm.price * 100)),
    });
    setSubmitting(false);
    if (error) {
      toast.error("Application failed", { description: error.message });
      return;
    }
    toast.success("You are now a mentor!");
    setApplyOpen(false);
    setIAmMentor(true);
    load();
  };

  return (
    <Card className="overflow-hidden backdrop-blur-xl bg-card/70 border-border/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">1:1 Mentorship</h3>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" /> 80/20 split
          </Badge>
          {userId && !iAmMentor && (
            <Button size="sm" variant="outline" className="ml-auto h-8 gap-1" onClick={() => setApplyOpen(true)}>
              <Plus className="h-3 w-3" /> Become mentor
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-4">Book a session with a verified mentor and level up your craft.</p>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading mentors…
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
            No mentors yet. Be the first — click <strong>Become mentor</strong>.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mentors.map((m) => (
              <motion.div
                key={m.id}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-border/40 bg-background/40 p-3 flex items-center gap-3"
              >
                <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center text-2xl">
                  {m.avatar_emoji || "🎓"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{m.display_name}</div>
                  <div className="text-xs text-muted-foreground truncate">{m.expertise}</div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {Number(m.rating).toFixed(1)}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {m.sessions_count}
                    </span>
                  </div>
                </div>
                <Button size="sm" onClick={() => setBookingMentor(m)} disabled={!userId || m.user_id === userId}>
                  €{(m.hourly_price_cents / 100).toFixed(0)}
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Booking dialog */}
        <Dialog open={!!bookingMentor} onOpenChange={(o) => !o && setBookingMentor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book {bookingMentor?.display_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                €{((bookingMentor?.hourly_price_cents || 0) / 100).toFixed(2)} will be reserved when the mentor accepts. 80% goes to the mentor.
              </p>
              <Textarea
                value={bookingMessage}
                onChange={(e) => setBookingMessage(e.target.value.slice(0, 500))}
                placeholder="Optional message — describe what you want to learn"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBookingMentor(null)}>
                Cancel
              </Button>
              <Button onClick={book} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Send request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Apply dialog */}
        <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Become a mentor</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Display name"
                value={applyForm.display_name}
                onChange={(e) => setApplyForm((p) => ({ ...p, display_name: e.target.value.slice(0, 60) }))}
              />
              <Input
                placeholder="Expertise (e.g. Vocal Coach)"
                value={applyForm.expertise}
                onChange={(e) => setApplyForm((p) => ({ ...p, expertise: e.target.value.slice(0, 60) }))}
              />
              <Input
                placeholder="Avatar emoji"
                value={applyForm.emoji}
                onChange={(e) => setApplyForm((p) => ({ ...p, emoji: e.target.value.slice(0, 4) }))}
              />
              <Textarea
                placeholder="Short bio"
                value={applyForm.bio}
                onChange={(e) => setApplyForm((p) => ({ ...p, bio: e.target.value.slice(0, 500) }))}
                rows={3}
              />
              <div>
                <label className="text-xs text-muted-foreground">Hourly price (€)</label>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  value={applyForm.price}
                  onChange={(e) => setApplyForm((p) => ({ ...p, price: Math.max(1, Number(e.target.value) || 0) }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApplyOpen(false)}>
                Cancel
              </Button>
              <Button onClick={apply} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Become mentor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MegatalentMentorshipBooking;
