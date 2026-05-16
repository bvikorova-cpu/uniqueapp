import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Star, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";

const MENTORS = [
  { id: "m1", name: "Sofia Reyes", expertise: "Vocal Coach", rating: 4.9, sessions: 128, price: 80, avatar: "🎤" },
  { id: "m2", name: "Liam Chen", expertise: "Digital Art", rating: 4.8, sessions: 94, price: 60, avatar: "🎨" },
  { id: "m3", name: "Maya Okafor", expertise: "Dance Choreography", rating: 5.0, sessions: 210, price: 95, avatar: "💃" },
  { id: "m4", name: "Noah Park", expertise: "Music Production", rating: 4.7, sessions: 76, price: 70, avatar: "🎧" },
];

const MegatalentMentorshipBooking = ({ category }: { category?: string }) => {
  const [bookingId, setBookingId] = useState<string | null>(null);

  const book = (m: typeof MENTORS[number]) => {
    setBookingId(m.id);
    setTimeout(() => {
      toast.success(`Booking request sent to ${m.name}`, { description: `${m.price} credits hold · 80/20 split` });
      setBookingId(null);
    }, 800);
  };

  return (
    <Card className="overflow-hidden backdrop-blur-xl bg-card/70 border-border/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">1:1 Mentorship</h3>
          <Badge variant="secondary" className="ml-auto gap-1"><Sparkles className="h-3 w-3" /> 80/20 split</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Book a session with a verified mentor and level up your craft.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MENTORS.map((m) => (
            <motion.div key={m.id} whileHover={{ y: -2 }} className="rounded-xl border border-border/40 bg-background/40 p-3 flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center text-2xl">{m.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{m.name}</div>
                <div className="text-xs text-muted-foreground truncate">{m.expertise}</div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-yellow-500" />{m.rating}</span>
                  <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{m.sessions}</span>
                </div>
              </div>
              <Button size="sm" disabled={bookingId === m.id} onClick={() => book(m)}>
                {bookingId === m.id ? "..." : `${m.price}`}
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MegatalentMentorshipBooking;
