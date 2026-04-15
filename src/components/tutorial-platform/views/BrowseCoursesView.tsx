import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Users, Star, GraduationCap, Clock, BookOpen, TrendingUp, Sparkles, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const mockCourses = [
  { id: "1", title: "Complete Web Development Bootcamp", category: "Technology", price: 49.99, students: 3420, rating: 4.8, duration: 240, level: "Beginner", instructor: "John Smith", lessons: 48, completion: 72, hot: true },
  { id: "2", title: "Machine Learning Fundamentals", category: "Data Science", price: 79.99, students: 1850, rating: 4.9, duration: 180, level: "Intermediate", instructor: "Sarah Chen", lessons: 36, completion: 65, hot: true },
  { id: "3", title: "Digital Marketing Mastery", category: "Marketing", price: 39.99, students: 5200, rating: 4.7, duration: 120, level: "Beginner", instructor: "Mike Johnson", lessons: 28, completion: 81, hot: false },
  { id: "4", title: "Advanced Python Programming", category: "Technology", price: 59.99, students: 2100, rating: 4.6, duration: 160, level: "Advanced", instructor: "Emily Davis", lessons: 42, completion: 58, hot: false },
  { id: "5", title: "UX/UI Design Principles", category: "Design", price: 44.99, students: 1900, rating: 4.8, duration: 100, level: "Beginner", instructor: "Alex Turner", lessons: 22, completion: 89, hot: false },
  { id: "6", title: "Business Strategy & Planning", category: "Business", price: 89.99, students: 980, rating: 4.5, duration: 200, level: "Advanced", instructor: "Lisa Wang", lessons: 55, completion: 45, hot: false },
  { id: "7", title: "React Native Mobile Development", category: "Technology", price: 69.99, students: 2800, rating: 4.7, duration: 150, level: "Intermediate", instructor: "James Park", lessons: 38, completion: 67, hot: false },
  { id: "8", title: "Photography Masterclass", category: "Creative", price: 34.99, students: 4100, rating: 4.6, duration: 90, level: "Beginner", instructor: "Maria Lopez", lessons: 20, completion: 92, hot: false },
];

interface Props { onBack: () => void; }

export function BrowseCoursesView({ onBack }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = mockCourses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || c.category === category;
    const matchLevel = level === "all" || c.level === level;
    return matchSearch && matchCat && matchLevel;
  });

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard</Button>
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Browse All Courses</h2>
            <p className="text-sm text-muted-foreground">{filtered.length} courses available</p>
          </div>
        </div>

        {/* Tips Banner */}
        <Card className="p-3 mb-4 bg-gradient-to-r from-violet-500/10 to-purple-500/5 border-violet-500/20">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground">
              <strong className="text-foreground">💡 Tip:</strong> Sort by rating to find the highest-quality courses. Filter by level to match your experience. Courses with 🔥 are trending this week!
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Search & Filters */}
      <div className="space-y-2 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search courses or instructors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-11" />
          </div>
          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4" />
          </Button>
        </div>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Category" /></SelectTrigger>
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
              <SelectTrigger className="flex-1"><SelectValue placeholder="Level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="overflow-hidden hover:shadow-xl transition-all group border-violet-500/10 hover:border-violet-500/30">
              <div className="h-32 bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-rose-500/10 flex items-center justify-center relative">
                <GraduationCap className="w-12 h-12 text-violet-500/20 group-hover:scale-110 transition-transform" />
                <Badge className="absolute top-2 right-2 text-[10px]" variant="secondary">{course.level}</Badge>
                {course.hot && (
                  <Badge className="absolute top-2 left-2 text-[10px] bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                    🔥 Trending
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-1 line-clamp-2 text-sm">{course.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">by {course.instructor}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2 flex-wrap">
                  <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{course.students.toLocaleString()}</span>
                  <span className="flex items-center gap-0.5"><BookOpen className="w-3 h-3" />{course.lessons} lessons</span>
                  <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{course.duration}min</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-bold">{course.rating}</span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-semibold">{course.completion}%</span>
                  </div>
                  <Progress value={course.completion} className="h-1.5" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">€{course.price}</span>
                  <Button size="sm" className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-xs" onClick={() => navigate(`/course/${course.id}`)}>Enroll Now</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
