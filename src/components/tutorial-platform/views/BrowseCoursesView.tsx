import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Users, Star, GraduationCap, Clock, BookOpen, TrendingUp, Sparkles, Filter, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Course {
  id: string;
  title: string;
  category: string;
  price: number;
  total_enrollments: number;
  average_rating: number;
  duration_minutes: number;
  difficulty_level: string;
  creator_id: string;
  total_lessons: number;
  description: string;
  is_published: boolean;
}

interface Props { onBack: () => void; }

export function BrowseCoursesView({ onBack }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("total_enrollments", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
      
      // Extract unique categories
      const cats = [...new Set((data || []).map(c => c.category).filter(Boolean))];
      setCategories(cats as string[]);
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || c.category === category;
    const matchLevel = level === "all" || c.difficulty_level === level;
    return matchSearch && matchCat && matchLevel;
  });

  // Top 3 by enrollments are "hot"
  const topIds = new Set(courses.slice(0, 3).map(c => c.id));

  return (
    <>
      <FloatingHowItWorks title={"Browse Courses View - How it works"} steps={[{ title: 'Open', desc: 'Access the Browse Courses View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Browse Courses View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard</Button>
      
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

        <Card className="p-3 mb-4 bg-gradient-to-r from-violet-500/10 to-purple-500/5 border-violet-500/20">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground">
              <strong className="text-foreground">💡 Tip:</strong> Courses with 🔥 are the most popular. Use filters to find the perfect match for your skill level.
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Search & Filters */}
      <div className="space-y-2 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-11" />
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
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-bold mb-2">No courses found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </Card>
      ) : (
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
                  {course.difficulty_level && (
                    <Badge className="absolute top-2 right-2 text-[10px]" variant="secondary">{course.difficulty_level}</Badge>
                  )}
                  {topIds.has(course.id) && (
                    <Badge className="absolute top-2 left-2 text-[10px] bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                      🔥 Trending
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-1 line-clamp-2 text-sm">{course.title}</h3>
                  {course.category && <p className="text-xs text-muted-foreground mb-2">{course.category}</p>}
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2 flex-wrap">
                    <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{(course.total_enrollments || 0).toLocaleString()}</span>
                    {course.total_lessons && <span className="flex items-center gap-0.5"><BookOpen className="w-3 h-3" />{course.total_lessons} lessons</span>}
                    {course.duration_minutes && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{course.duration_minutes}min</span>}
                  </div>
                  {course.average_rating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-bold">{Number(course.average_rating).toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      {course.price > 0 ? `€${Number(course.price).toFixed(2)}` : 'Free'}
                    </span>
                    <Button size="sm" className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-xs" onClick={() => navigate(`/tutorial-course/${course.id}`)}>
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
