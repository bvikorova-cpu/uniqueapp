import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Users, Star, Flame } from "lucide-react";

const trendingCourses = [
  { rank: 1, title: "AI & Machine Learning 2026", instructor: "Dr. Alan Turing Jr.", students: 8420, rating: 4.9, price: 99.99, hot: true },
  { rank: 2, title: "Full-Stack Web Development", instructor: "Sarah Chen", students: 6800, rating: 4.8, price: 79.99, hot: true },
  { rank: 3, title: "Digital Marketing Pro", instructor: "Mike Torres", students: 5200, rating: 4.7, price: 49.99, hot: false },
  { rank: 4, title: "Data Science with Python", instructor: "Emily Davis", students: 4900, rating: 4.8, price: 69.99, hot: false },
  { rank: 5, title: "UX Design Masterclass", instructor: "Alex Kim", students: 4100, rating: 4.6, price: 59.99, hot: false },
  { rank: 6, title: "Blockchain & Web3", instructor: "James Block", students: 3800, rating: 4.5, price: 89.99, hot: false },
  { rank: 7, title: "Mobile App Development", instructor: "Lisa Wang", students: 3500, rating: 4.7, price: 74.99, hot: false },
  { rank: 8, title: "Cybersecurity Essentials", instructor: "Mark Shield", students: 3200, rating: 4.8, price: 84.99, hot: false },
];

interface Props { onBack: () => void; }

export function TrendingCoursesView({ onBack }: Props) {
  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><TrendingUp className="w-6 h-6 text-red-500" />Trending Courses</h2>
      <div className="space-y-3">
        {trendingCourses.map(course => (
          <Card key={course.rank} className="p-4 hover:shadow-lg transition-all">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-black text-muted-foreground w-8 text-center">#{course.rank}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{course.title}</h3>
                  {course.hot && <Flame className="w-4 h-4 text-orange-500" />}
                </div>
                <p className="text-sm text-muted-foreground">by {course.instructor}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{course.students.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" />{course.rating}</span>
                <Badge>€{course.price}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
