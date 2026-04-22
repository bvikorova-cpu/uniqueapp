import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  BookOpen,
  Search,
  Clock,
  Users,
  Star,
  Play,
  GraduationCap,
  TrendingUp,
  Sparkles,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  price: number;
  thumbnail_url: string;
  duration_minutes: number;
  total_lessons: number;
  total_enrollments: number;
  average_rating: number;
}

const categories = [
  "All Categories",
  "Programming",
  "Design",
  "Business",
  "Marketing",
  "Photography",
  "Music",
  "Health & Fitness",
  "Cooking",
  "Language",
  "Personal Development",
];

export default function CourseMarketplace() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchTerm, selectedCategory, selectedDifficulty, courses]);

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCourses(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter((course) => course.category === selectedCategory);
    }

    if (selectedDifficulty !== "all") {
      filtered = filtered.filter((course) => course.difficulty_level === selectedDifficulty);
    }

    setFilteredCourses(filtered);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Professional Course Marketplace</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            Learn Anything, Anytime
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            From 5-minute mini-lessons to complete masterclasses. Buy once, access forever.
          </p>

          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
            <div className="p-6 rounded-lg bg-card border">
              <div className="text-3xl font-bold text-primary mb-1">20%</div>
              <div className="text-sm text-muted-foreground">Platform Fee</div>
            </div>
            <div className="p-6 rounded-lg bg-card border">
              <div className="text-3xl font-bold text-primary mb-1">80%</div>
              <div className="text-sm text-muted-foreground">To Creators</div>
            </div>
            <div className="p-6 rounded-lg bg-card border">
              <div className="text-3xl font-bold text-primary mb-1">∞</div>
              <div className="text-sm text-muted-foreground">Lifetime Access</div>
            </div>
            <div className="p-6 rounded-lg bg-card border">
              <div className="text-3xl font-bold text-primary mb-1">{courses.length}+</div>
              <div className="text-sm text-muted-foreground">Courses</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Difficulty level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="container mx-auto px-4 pb-16">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              {searchTerm || selectedCategory !== "All Categories"
                ? "No courses found matching your filters"
                : "No courses available yet"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate(`/course/${course.id}`)}>
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-16 w-16 text-primary" />
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className={getDifficultyColor(course.difficulty_level)}>
                      {course.difficulty_level}
                    </Badge>
                    <Badge variant="secondary">{course.category}</Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration_minutes} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      <span>{course.total_lessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{course.total_enrollments} students</span>
                    </div>
                    {course.average_rating > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-primary">
                    €{course.price.toFixed(2)}
                  </div>
                  <Button size="sm" onClick={() => toast.info("View Course — coming soon")}>
                    View Course
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center bg-muted/30 rounded-lg">
        <h2 className="text-3xl font-black mb-4">Want to Teach?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Share your knowledge and earn 80% from every course sale. Start creating today!
        </p>
        <Button size="lg" onClick={() => toast.info("Become an Instructor — coming soon")}>
          <TrendingUp className="mr-2 h-5 w-5" />
          Become an Instructor
        </Button>
      </section>
    </div>
  );
}