import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Users, BookOpen, Trophy } from "lucide-react";

const instructors = [
  { rank: 1, name: "Dr. Alan Turing Jr.", courses: 12, students: 24500, rating: 4.9, earnings: "€125K", badge: "🏆" },
  { rank: 2, name: "Sarah Chen", courses: 8, students: 18200, rating: 4.8, earnings: "€98K", badge: "🥈" },
  { rank: 3, name: "Mike Torres", courses: 15, students: 15800, rating: 4.7, earnings: "€87K", badge: "🥉" },
  { rank: 4, name: "Emily Davis", courses: 6, students: 12400, rating: 4.8, earnings: "€72K", badge: "" },
  { rank: 5, name: "Alex Kim", courses: 10, students: 11000, rating: 4.6, earnings: "€65K", badge: "" },
  { rank: 6, name: "Lisa Wang", courses: 9, students: 9800, rating: 4.7, earnings: "€58K", badge: "" },
  { rank: 7, name: "James Block", courses: 5, students: 8500, rating: 4.5, earnings: "€45K", badge: "" },
  { rank: 8, name: "Mark Shield", courses: 7, students: 7200, rating: 4.8, earnings: "€42K", badge: "" },
];

interface Props { onBack: () => void; }

export function InstructorLeaderboardView({ onBack }: Props) {
  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-500" />Instructor Leaderboard</h2>
      <div className="space-y-3">
        {instructors.map(inst => (
          <Card key={inst.rank} className={`p-4 hover:shadow-lg transition-all ${inst.rank <= 3 ? "border-yellow-500/30 bg-yellow-500/5" : ""}`}>
            <div className="flex items-center gap-4">
              <div className="text-2xl font-black w-10 text-center">{inst.badge || `#${inst.rank}`}</div>
              <div className="flex-1">
                <h3 className="font-semibold">{inst.name}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{inst.courses} courses</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{inst.students.toLocaleString()} students</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" />{inst.rating}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-emerald-600 font-bold">{inst.earnings}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
