import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Lightbulb, Star, Users, Clock, Calendar, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const mentors = [
  { id: 1, name: "Dr. Alan Turing Jr.", specialty: "AI & Machine Learning", rate: 120, rating: 4.9, students: 45, availability: "Mon-Fri", sessions: 234, avatar: "🧑‍🏫" },
  { id: 2, name: "Sarah Chen", specialty: "Web Development", rate: 80, rating: 4.8, students: 62, availability: "Tue-Sat", sessions: 189, avatar: "👩‍💻" },
  { id: 3, name: "Emily Davis", specialty: "Data Science", rate: 95, rating: 4.8, students: 38, availability: "Mon-Thu", sessions: 156, avatar: "👩‍🔬" },
  { id: 4, name: "Alex Kim", specialty: "UX/UI Design", rate: 75, rating: 4.7, students: 51, availability: "Wed-Sun", sessions: 142, avatar: "🧑‍🎨" },
];

interface Props { onBack: () => void; }

export function MentorshipProgramView({ onBack }: Props) {
  const [bookFor, setBookFor] = useState<typeof mentors[0] | null>(null);
  const [msgFor, setMsgFor] = useState<typeof mentors[0] | null>(null);
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("");
  const [bookNote, setBookNote] = useState("");
  const [message, setMessage] = useState("");

  const handleBook = () => {
    if (!bookDate || !bookTime) {
      toast.error("Pick date and time");
      return;
    }
    toast.success(`Session booked with ${bookFor?.name} on ${bookDate} at ${bookTime}`);
    setBookFor(null); setBookDate(""); setBookTime(""); setBookNote("");
  };

  const handleSend = () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    toast.success(`Message sent to ${msgFor?.name}`);
    setMsgFor(null); setMessage("");
  };

  return (
    <>
      <FloatingHowItWorks title={"Mentorship Program View - How it works"} steps={[{ title: 'Open', desc: 'Access the Mentorship Program View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Mentorship Program View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black">Mentorship Program</h2>
          <p className="text-sm text-muted-foreground">1-on-1 sessions with top instructors</p>
        </div>
      </div>
      <p className="text-muted-foreground mb-6 ml-[52px]">Get personalized guidance from industry experts.</p>

      <div className="grid md:grid-cols-2 gap-4">
        {mentors.map(mentor => (
          <Card key={mentor.id} className="hover:shadow-xl transition-all overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{mentor.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{mentor.name}</h3>
                      <p className="text-sm text-muted-foreground">{mentor.specialty}</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold border-0">€{mentor.rate}/hr</Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-sm font-bold">{mentor.students}</p>
                  <p className="text-[10px] text-muted-foreground">Mentees</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-sm font-bold">{mentor.sessions}</p>
                  <p className="text-[10px] text-muted-foreground">Sessions</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-0.5">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-bold">{mentor.rating}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Rating</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Calendar className="w-3 h-3" />
                <span>Available: {mentor.availability}</span>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 shadow-md" onClick={() => setBookFor(mentor)}>
                  <Clock className="w-4 h-4 mr-2" />Book Session
                </Button>
                <Button variant="outline" size="icon" onClick={() => setMsgFor(mentor)}><MessageCircle className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!bookFor} onOpenChange={(o) => !o && setBookFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Session — {bookFor?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" value={bookDate} onChange={e => setBookDate(e.target.value)} />
              <Input type="time" value={bookTime} onChange={e => setBookTime(e.target.value)} />
            </div>
            <Textarea placeholder="What do you want to discuss? (optional)" value={bookNote} onChange={e => setBookNote(e.target.value)} rows={3} />
            <p className="text-xs text-muted-foreground">Rate: €{bookFor?.rate}/hr</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookFor(null)}>Cancel</Button>
            <Button className="bg-gradient-to-r from-fuchsia-500 to-purple-600" onClick={handleBook}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!msgFor} onOpenChange={(o) => !o && setMsgFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {msgFor?.name}</DialogTitle>
          </DialogHeader>
          <Textarea placeholder="Type your message..." value={message} onChange={e => setMessage(e.target.value)} rows={5} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setMsgFor(null)}>Cancel</Button>
            <Button onClick={handleSend}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}