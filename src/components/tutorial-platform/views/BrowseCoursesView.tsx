import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Users, Video, Star, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockCourses = [
  { id: "1", title: "Complete Web Development Bootcamp", category: "Technology", price: 49.99, students: 3420, rating: 4.8, duration: 240, level: "Beginner", instructor: "John Smith" },
  { id: "2", title: "Machine Learning Fundamentals", category: "Data Science", price: 79.99, students: 1850, rating: 4.9, duration: 180, level: "Intermediate", instructor: "Sarah Chen" },
  { id: "3", title: "Digital Marketing Mastery", category: "Marketing", price: 39.99, students: 5200, rating: 4.7, duration: 120, level: "Beginner", instructor: "Mike Johnson" },
  { id: "4", title: "Advanced Python Programming", category: "Technology", price: 59.99, students: 2100, rating: 4.6, duration: 160, level: "Advanced", instructor: "Emily Davis" },
  { id: "5", title: "UX/UI Design Principles", category: "Design", price: 44.99, students: 1900, rating: 4.8, duration: 100, level: "Beginner", instructor: "Alex Turner" },
  { id: "6", title: "Business Strategy & Planning", category: "Business", price: 89.99, students: 980, rating: 4.5, duration: 200, level: "Advanced", instructor: "Lisa Wang" },
];

interface Props { onBack: () => void; }

export function BrowseCoursesView({ onBack }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");

  const filtered = mockCourses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || c.category === category;
    const matchLevel = level === "all" || c.level === level;
    return matchSearch && matchCat && matchLevel;
  });

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard</Button>
      <h2 className="text-2xl font-black mb-6">Browse All Courses</h2>
      
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search courses or instructors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Technology">Technology</SelectItem>
            <SelectItem value="Data Science">Data Science</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Business">Business</SelectItem>
          </SelectContent>
        </Select>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(course => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all">
            <div className="h-32 bg-gradient-to-br from-emerald-500/20 to-emerald-700/10 flex items-center justify-center">
              <GraduationCap className="w-12 h-12 text-emerald-500/50" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-1 line-clamp-1">{course.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">by {course.instructor}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.students}</span>
                <span className="flex items-center gap-1"><Video className="w-3 h-3" />{course.duration}min</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" />{course.rating}</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">€{course.price}</span>
                <Button size="sm" onClick={() => navigate(`/course/${course.id}`)}>Enroll Now</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
