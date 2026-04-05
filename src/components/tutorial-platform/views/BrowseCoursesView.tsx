import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Users, Video, Star, GraduationCap, Clock, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const mockCourses = [
  { id: "1", title: "Complete Web Development Bootcamp", category: "Technology", price: 49.99, students: 3420, rating: 4.8, duration: 240, level: "Beginner", instructor: "John Smith", lessons: 48, completion: 72 },
  { id: "2", title: "Machine Learning Fundamentals", category: "Data Science", price: 79.99, students: 1850, rating: 4.9, duration: 180, level: "Intermediate", instructor: "Sarah Chen", lessons: 36, completion: 65 },
  { id: "3", title: "Digital Marketing Mastery", category: "Marketing", price: 39.99, students: 5200, rating: 4.7, duration: 120, level: "Beginner", instructor: "Mike Johnson", lessons: 28, completion: 81 },
  { id: "4", title: "Advanced Python Programming", category: "Technology", price: 59.99, students: 2100, rating: 4.6, duration: 160, level: "Advanced", instructor: "Emily Davis", lessons: 42, completion: 58 },
  { id: "5", title: "UX/UI Design Principles", category: "Design", price: 44.99, students: 1900, rating: 4.8, duration: 100, level: "Beginner", instructor: "Alex Turner", lessons: 22, completion: 89 },
  { id: "6", title: "Business Strategy & Planning", category: "Business", price: 89.99, students: 980, rating: 4.5, duration: 200, level: "Advanced", instructor: "Lisa Wang", lessons: 55, completion: 45 },
  { id: "7", title: "React Native Mobile Development", category: "Technology", price: 69.99, students: 2800, rating: 4.7, duration: 150, level: "Intermediate", instructor: "James Park", lessons: 38, completion: 67 },
  { id: "8", title: "Photography Masterclass", category: "Creative", price: 34.99, students: 4100, rating: 4.6, duration: 90, level: "Beginner", instructor: "Maria Lopez", lessons: 20, completion: 92 },
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
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
          <Search className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black">Browse All Courses</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} courses available</p>
        </div>
      </div>
      
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
            <SelectItem value="Creative">Creative</SelectItem>
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
          <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-all group">
            <div className="h-36 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-amber-500/10 flex items-center justify-center relative">
              <GraduationCap className="w-14 h-14 text-emerald-500/30 group-hover:scale-110 transition-transform" />
              <Badge className="absolute top-2 right-2" variant="secondary">{course.level}</Badge>
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-1 line-clamp-2">{course.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">by {course.instructor}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.students.toLocaleString()}</span>
                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lessons} lessons</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}min</span>
              </div>
              <div className="flex items-center gap-1 mb-3">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-sm font-bold">{course.rating}</span>
                <span className="text-xs text-muted-foreground ml-1">({course.students} reviews)</span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Completion rate</span>
                  <span className="font-semibold">{course.completion}%</span>
                </div>
                <Progress value={course.completion} className="h-1.5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-emerald-600">€{course.price}</span>
                <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" onClick={() => navigate(`/course/${course.id}`)}>Enroll Now</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}