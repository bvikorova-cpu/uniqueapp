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
  Download,
  Clock,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CourseForm } from "@/components/course-creator/CourseForm";
import { CoursesList } from "@/components/course-creator/CoursesList";
import { CreatorEarnings } from "@/components/course-creator/CreatorEarnings";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
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

  // My Learning states
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    checkAuthentication();
    loadCourses();
    loadMyLearning();
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

  const loadMyLearning = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [enrolledData, completedData, certsData] = await Promise.all([
        supabase
          .from("course_enrollments")
          .select(`*, courses (title, description, thumbnail_url)`)
          .eq("user_id", user.id)
          .order("enrolled_at", { ascending: false }),
        supabase
          .from("completed_courses")
          .select("*")
          .eq("user_id", user.id)
          .order("completion_date", { ascending: false }),
        supabase
          .from("course_certificates")
          .select(`*, courses (title)`)
          .eq("user_id", user.id)
          .order("issued_at", { ascending: false })
      ]);

      setEnrolledCourses(enrolledData.data || []);
      setCompletedCourses(completedData.data || []);
      setCertificates(certsData.data || []);
    } catch (error) {
      console.error("Error loading my learning:", error);
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
      <>
        <FloatingHowItWorks title="How Courses Hub works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
        <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
      </>
      );
  }

  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="marketplace" className="w-full">
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
              <TabsTrigger value="marketplace" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Browse Courses
              </TabsTrigger>
              <TabsTrigger value="learning" className="gap-2">
                <Award className="h-4 w-4" />
                My Learning
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
              <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
                          <Button size="sm" onClick={() => { window.location.href = `/courses/${course.id}`; }}>View Course</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Creator Benefits Section */}
          <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black mb-4">
                  Ready to Share Your Knowledge?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of instructors teaching millions of students worldwide
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <Card>
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Keep 70% of Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Earn 70% from every course sale. We only take 30% as platform fee to maintain and improve the platform.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Unlimited Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Your courses can be sold unlimited times. Create once, earn forever with lifetime access for students.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Full Creative Control</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Set your own prices, create your curriculum, and maintain complete control over your content.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-card border rounded-lg p-8 mb-8">
                <h3 className="text-2xl font-black mb-4">How It Works</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex gap-3 mb-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Create Your Course</h4>
                        <p className="text-sm text-muted-foreground">
                          Upload videos, add lessons, quizzes, and resources. Our platform supports rich multimedia content.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 mb-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Set Your Price</h4>
                        <p className="text-sm text-muted-foreground">
                          You decide the value of your knowledge. Price your courses competitively and adjust anytime.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex gap-3 mb-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Publish & Earn</h4>
                        <p className="text-sm text-muted-foreground">
                          Once published, your course is instantly available to millions of learners worldwide.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 mb-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">4</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Track & Grow</h4>
                        <p className="text-sm text-muted-foreground">
                          Monitor your earnings, student engagement, and course performance through our creator dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/become-creator")}
                >
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Become a Course Creator
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  No subscription fees • No upfront costs • Start earning today
                </p>
              </div>
            </div>
          </section>
        </TabsContent>

        {/* Creator Dashboard Tab */}
        <TabsContent value="creator" className="mt-0">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-black mb-2">Creator Dashboard</h1>
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
                  <div className="text-2xl font-bold">30%</div>
                  <p className="text-xs text-muted-foreground">
                    You keep 70% of all sales
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

        {/* My Learning Tab */}
        <TabsContent value="learning" className="mt-0">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-black mb-2">My Learning</h1>
              <p className="text-muted-foreground">Track your progress and achievements</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{enrolledCourses.length}</p>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <Award className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{completedCourses.length}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Award className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{certificates.length}</p>
                      <p className="text-sm text-muted-foreground">Certificates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {enrolledCourses.length > 0
                          ? Math.round(enrolledCourses.reduce((acc: number, c: any) => acc + (c.progress_percentage || 0), 0) / enrolledCourses.length)
                          : 0}%
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="in-progress" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="certificates">Certificates</TabsTrigger>
              </TabsList>

              <TabsContent value="in-progress" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium">No courses in progress</p>
                      <p className="text-muted-foreground mb-4">Browse our marketplace to get started</p>
                      <Button onClick={() => document.querySelector('[value="marketplace"]')?.dispatchEvent(new Event('click', { bubbles: true }))}>
                        Browse Courses
                      </Button>
                    </div>
                  ) : (
                    enrolledCourses.map((enrollment: any) => (
                      <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="line-clamp-2">{enrollment.courses?.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {enrollment.courses?.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{enrollment.progress_percentage || 0}%</span>
                            </div>
                            <Progress value={enrollment.progress_percentage || 0} className="h-2" />
                          </div>
                          <Button 
                            onClick={() => navigate(`/course/${enrollment.course_id}/learn`)} 
                            className="w-full"
                          >
                            Continue Learning
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedCourses.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium">No completed courses yet</p>
                      <p className="text-muted-foreground">Complete your first course to see it here</p>
                    </div>
                  ) : (
                    completedCourses.map((completed: any) => (
                      <Card key={completed.id}>
                        <CardHeader>
                          <CardTitle>{completed.course_name}</CardTitle>
                          <CardDescription>
                            Completed on {new Date(completed.completion_date).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {completed.test_score && (
                            <div className="mb-4">
                              <p className="text-sm text-muted-foreground">Test Score</p>
                              <p className="text-2xl font-bold">{completed.test_score}%</p>
                            </div>
                          )}
                          <Badge variant="default" className="w-full justify-center py-2">
                            <Award className="mr-2 h-4 w-4" />
                            Completed
                          </Badge>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="certificates" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium">No certificates yet</p>
                      <p className="text-muted-foreground">Complete courses to earn certificates</p>
                    </div>
                  ) : (
                    certificates.map((cert: any) => (
                      <Card key={cert.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-yellow-500" />
                            {cert.courses?.title}
                          </CardTitle>
                          <CardDescription>
                            Issued on {new Date(cert.issued_at).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-4">Student: {cert.student_name}</p>
                          <Button variant="outline" className="w-full" onClick={() => {
                            const certWindow = window.open("", "_blank");
                            if (certWindow) {
                              certWindow.document.write(`
                                <html><head><title>Certificate - ${cert.courses?.title}</title><style>
                                  body{font-family:Georgia,serif;text-align:center;padding:60px;background:#fafafa}
                                  .cert{border:3px double #333;padding:60px;max-width:700px;margin:auto;background:#fff}
                                  h1{color:#333;font-size:2em}h2{color:#666}p{color:#888;font-size:1.1em}
                                  .date{margin-top:40px;color:#999}
                                </style></head><body><div class="cert">
                                  <h2>Certificate of Completion</h2>
                                  <h1>${cert.courses?.title || "Course"}</h1>
                                  <p>Awarded to <strong>${cert.student_name}</strong></p>
                                  <p class="date">Issued on ${new Date(cert.issued_at).toLocaleDateString()}</p>
                                </div></body></html>
                              `);
                              certWindow.document.close();
                              certWindow.print();
                            }
                          }}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Certificate
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        {/* Creator Dashboard Tab */}
      </Tabs>
    </div>
  );
}
