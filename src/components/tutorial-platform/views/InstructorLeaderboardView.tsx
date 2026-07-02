import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Users, BookOpen, Trophy, Medal, Crown } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const instructors = [
  { rank: 1, name: "Dr. Alan Turing Jr.", courses: 12, students: 24500, rating: 4.9, earnings: "€125K", avatar: "🧑‍🏫" },
  { rank: 2, name: "Sarah Chen", courses: 8, students: 18200, rating: 4.8, earnings: "€98K", avatar: "👩‍💻" },
  { rank: 3, name: "Mike Torres", courses: 15, students: 15800, rating: 4.7, earnings: "€87K", avatar: "👨‍🎓" },
  { rank: 4, name: "Emily Davis", courses: 6, students: 12400, rating: 4.8, earnings: "€72K", avatar: "👩‍🔬" },
  { rank: 5, name: "Alex Kim", courses: 10, students: 11000, rating: 4.6, earnings: "€65K", avatar: "🧑‍🎨" },
  { rank: 6, name: "Lisa Wang", courses: 9, students: 9800, rating: 4.7, earnings: "€58K", avatar: "👩‍💼" },
  { rank: 7, name: "James Block", courses: 5, students: 8500, rating: 4.5, earnings: "€45K", avatar: "👨‍🔧" },
  { rank: 8, name: "Mark Shield", courses: 7, students: 7200, rating: 4.8, earnings: "€42K", avatar: "🧑‍🔬" },
];

interface Props { onBack: () => void; }

export function InstructorLeaderboardView({ onBack }: Props) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-amber-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="text-lg font-black text-muted-foreground">#{rank}</span>;
  };

  return (
    <>
      <FloatingHowItWorks title={"Instructor Leaderboard View - How it works"} steps={[{ title: 'Open', desc: 'Access the Instructor Leaderboard View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Instructor Leaderboard View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black">Instructor Leaderboard</h2>
          <p className="text-sm text-muted-foreground">Top educators ranked by performance</p>
        </div>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {instructors.slice(0, 3).map(inst => (
          <Card key={inst.rank} className={`p-4 text-center border-amber-500/30 bg-gradient-to-b ${
            inst.rank === 1 ? "from-amber-500/15 to-transparent" : "from-amber-500/5 to-transparent"
          }`}>
            <div className="text-3xl mb-2">{inst.avatar}</div>
            <div className="mb-1">{getRankIcon(inst.rank)}</div>
            <h3 className="font-bold text-sm truncate">{inst.name}</h3>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold">{inst.rating}</span>
            </div>
            <Badge className="mt-2 bg-emerald-500/10 text-emerald-600 font-bold">{inst.earnings}</Badge>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        {instructors.slice(3).map(inst => (
          <Card key={inst.rank} className="p-4 hover:shadow-lg transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 text-center">{getRankIcon(inst.rank)}</div>
              <div className="text-2xl">{inst.avatar}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold">{inst.name}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{inst.courses} courses</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{inst.students.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500 fill-amber-500" />{inst.rating}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-emerald-600 font-bold">{inst.earnings}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
    </>
  );
}