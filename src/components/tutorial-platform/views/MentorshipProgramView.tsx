import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lightbulb, Star, Users, Clock, Calendar } from "lucide-react";

const mentors = [
  { id: 1, name: "Dr. Alan Turing Jr.", specialty: "AI & Machine Learning", rate: 120, rating: 4.9, students: 45, availability: "Mon-Fri" },
  { id: 2, name: "Sarah Chen", specialty: "Web Development", rate: 80, rating: 4.8, students: 62, availability: "Tue-Sat" },
  { id: 3, name: "Emily Davis", specialty: "Data Science", rate: 95, rating: 4.8, students: 38, availability: "Mon-Thu" },
  { id: 4, name: "Alex Kim", specialty: "UX/UI Design", rate: 75, rating: 4.7, students: 51, availability: "Wed-Sun" },
];

interface Props { onBack: () => void; }

export function MentorshipProgramView({ onBack }: Props) {
  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <h2 className="text-2xl font-black mb-2 flex items-center gap-2"><Lightbulb className="w-6 h-6 text-fuchsia-500" />Mentorship Program</h2>
      <p className="text-muted-foreground mb-6">Book 1-on-1 sessions with top instructors for personalized guidance.</p>

      <div className="grid md:grid-cols-2 gap-4">
        {mentors.map(mentor => (
          <Card key={mentor.id} className="hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{mentor.name}</h3>
                  <p className="text-sm text-muted-foreground">{mentor.specialty}</p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 font-bold">€{mentor.rate}/hr</Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" />{mentor.rating}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{mentor.students} mentees</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{mentor.availability}</span>
              </div>
              <Button className="w-full"><Clock className="w-4 h-4 mr-2" />Book Session</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
