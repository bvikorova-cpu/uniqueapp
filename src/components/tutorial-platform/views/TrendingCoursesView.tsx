import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Users, Star, Flame, Clock, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const trendingCourses = [
  { rank: 1, title: "AI & Machine Learning 2026", instructor: "Dr. Alan Turing Jr.", students: 8420, rating: 4.9, price: 99.99, hot: true, growth: 142, lessons: 52 },
  { rank: 2, title: "Full-Stack Web Development", instructor: "Sarah Chen", students: 6800, rating: 4.8, price: 79.99, hot: true, growth: 98, lessons: 48 },
  { rank: 3, title: "Digital Marketing Pro", instructor: "Mike Torres", students: 5200, rating: 4.7, price: 49.99, hot: false, growth: 67, lessons: 28 },
  { rank: 4, title: "Data Science with Python", instructor: "Emily Davis", students: 4900, rating: 4.8, price: 69.99, hot: false, growth: 54, lessons: 36 },
  { rank: 5, title: "UX Design Masterclass", instructor: "Alex Kim", students: 4100, rating: 4.6, price: 59.99, hot: false, growth: 43, lessons: 22 },
  { rank: 6, title: "Blockchain & Web3", instructor: "James Block", students: 3800, rating: 4.5, price: 89.99, hot: false, growth: 38, lessons: 30 },
  { rank: 7, title: "Mobile App Development", instructor: "Lisa Wang", students: 3500, rating: 4.7, price: 74.99, hot: false, growth: 31, lessons: 40 },
  { rank: 8, title: "Cybersecurity Essentials", instructor: "Mark Shield", students: 3200, rating: 4.8, price: 84.99, hot: false, growth: 25, lessons: 34 },
];

interface Props { onBack: () => void; }

export function TrendingCoursesView({ onBack }: Props) {
  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black">Trending Courses</h2>
          <p className="text-sm text-muted-foreground">Most popular courses this week</p>
        </div>
      </div>

      <div className="space-y-3">
        {trendingCourses.map(course => (
          <Card key={course.rank} className={`p-4 hover:shadow-xl transition-all ${course.rank <= 3 ? "border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent" : ""}`}>
            <div className="flex items-center gap-4">
              <div className={`text-2xl font-black w-10 text-center ${course.rank <= 3 ? "bg-gradient-to-b from-amber-400 to-orange-500 bg-clip-text text-transparent" : "text-muted-foreground"}`}>#{course.rank}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold truncate">{course.title}</h3>
                  {course.hot && <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-[10px] px-1.5"><Flame className="w-3 h-3 mr-0.5" />HOT</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.students.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500 fill-amber-500" />{course.rating}</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lessons} lessons</span>
                  <span className="text-emerald-500 font-bold">↑{course.growth}%</span>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white font-bold shrink-0">€{course.price}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}