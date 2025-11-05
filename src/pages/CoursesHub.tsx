import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  TrendingUp,
  GraduationCap,
  Star,
  Users,
  BookOpen,
  PlusCircle,
  DollarSign,
  Award,
} from "lucide-react";
import { CourseForm } from "@/components/course-creator/CourseForm";
import { CoursesList } from "@/components/course-creator/CoursesList";
import { CreatorEarnings } from "@/components/course-creator/CreatorEarnings";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string | null;
  category: string;
  difficulty_level: string;
  is_published: boolean;
  created_at: string;
  average_rating: number | null;
  total_enrollments?: number;
  instructor?: {
    full_name: string;
  };
}

const CATEGORIES = [
  "All Categories",
  "Programming",
  "Business",
  "Design",
  "Marketing",
  "Photography",
  "Music",
  "Health & Fitness",
  "Cooking",
  "Language",
  "Personal Development",
];

export default function CoursesHub() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Marketplace states
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  
  // Creator dashboard states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkAuthentication();
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchTerm, selectedCategory, selectedDifficulty, courses]);

  const checkAuthentication = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      navigate("/auth");
    } finally {
      setAuthLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const coursesWithData = (data || []).map((course) => ({
        ...course,
        total_enrollments: 0, // We'll calculate this separately if needed
      }));

      setCourses(coursesWithData);
      setFilteredCourses(coursesWithData);
    } catch (error) {
      console.error("Error loading courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses",
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
      filtered = filtered.filter(
        (course) => course.difficulty_level === selectedDifficulty
      );
    }

    setFilteredCourses(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/10 text-green-500";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-500";
      case "advanced":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const handleCourseCreated = () => {
    setShowCourseForm(false);
    setSelectedCourseId(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleEditCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setShowCourseForm(true);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="marketplace" className="w-full">
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="marketplace" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Course Marketplace
              </TabsTrigger>
              <TabsTrigger value="creator" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Creator Dashboard
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="mt-0">
          {/* Hero Section */}
          <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
            <div className="container mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Learn Anything, Anytime
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Discover world-class courses from expert instructors
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
                <Card>
                  <CardContent className="pt-6">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{courses.length}</p>
                    <p className="text-sm text-muted-foreground">Available Courses</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <GraduationCap className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {courses.reduce((sum, c) => sum + (c.total_enrollments || 0), 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Students Enrolled</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <Star className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">4.8</p>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Filters Section */}
          <section className="py-8 px-4 bg-card/50">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Courses Grid */}
          <section className="py-12 px-4">
            <div className="container mx-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : filteredCourses.length === 0 ? (
                <Card className="max-w-md mx-auto">
                  <CardContent className="pt-6 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">No courses found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <Card
                      key={course.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <GraduationCap className="h-16 w-16 text-primary/50" />
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge variant="secondary">{course.category}</Badge>
                          <Badge className={getDifficultyColor(course.difficulty_level)}>
                            {course.difficulty_level}
                          </Badge>
                        </div>
                        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {course.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">
                              {course.average_rating?.toFixed(1) || "New"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">{course.total_enrollments || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">
                            ${course.price.toFixed(2)}
                          </span>
                          <Button size="sm">View Course</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="container mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Share Your Knowledge?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of instructors teaching millions of students worldwide
              </p>
              <Button
                size="lg"
                onClick={() => {
                  const tabsTrigger = document.querySelector('[value="creator"]');
                  if (tabsTrigger instanceof HTMLElement) {
                    tabsTrigger.click();
                  }
                }}
              >
                <GraduationCap className="mr-2 h-5 w-5" />
                Become a Course Creator
              </Button>
            </div>
          </section>
        </TabsContent>

        {/* Creator Dashboard Tab */}
        <TabsContent value="creator" className="mt-0">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Creator Dashboard</h1>
              <p className="text-muted-foreground">
                Create and manage your courses, track earnings, and grow your student base
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Platform Fee</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">10%</div>
                  <p className="text-xs text-muted-foreground">
                    On all course sales
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Your Earnings</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">90%</div>
                  <p className="text-xs text-muted-foreground">
                    You keep the majority
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Support</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24/7</div>
                  <p className="text-xs text-muted-foreground">
                    Creator support available
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Create Course Button */}
            {!showCourseForm && (
              <div className="mb-6">
                <Button onClick={() => setShowCourseForm(true)} size="lg">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create New Course
                </Button>
              </div>
            )}

            {/* Course Form or Courses Management */}
            {showCourseForm ? (
              <CourseForm
                courseId={selectedCourseId}
                onSuccess={handleCourseCreated}
                onCancel={() => {
                  setShowCourseForm(false);
                  setSelectedCourseId(null);
                }}
              />
            ) : (
              <Tabs defaultValue="courses" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="courses">My Courses</TabsTrigger>
                  <TabsTrigger value="earnings">Earnings</TabsTrigger>
                </TabsList>
                <TabsContent value="courses" className="mt-6">
                  <CoursesList
                    key={refreshKey}
                    onEditCourse={handleEditCourse}
                  />
                </TabsContent>
                <TabsContent value="earnings" className="mt-6">
                  <CreatorEarnings />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
