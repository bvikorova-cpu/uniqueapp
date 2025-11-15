import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, GraduationCap, Star, Users, BookOpen, PlusCircle, Award, Download, Brain, Send, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CourseForm } from "@/components/course-creator/CourseForm";
import { CoursesList } from "@/components/course-creator/CoursesList";
import { CreatorEarnings } from "@/components/course-creator/CreatorEarnings";
import QuizList from "@/components/education/QuizList";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

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

const quizCategories = [
  { id: "math", name: "Mathematics", icon: "📐" },
  { id: "biology", name: "Biology", icon: "🧬" },
  { id: "physics", name: "Physics", icon: "⚛️" },
  { id: "chemistry", name: "Chemistry", icon: "🧪" },
  { id: "geography", name: "Geography", icon: "🌍" },
  { id: "history", name: "History", icon: "📜" },
  { id: "literature", name: "Literature", icon: "📚" },
  { id: "english", name: "English", icon: "🇬🇧" },
  { id: "computer", name: "Computer Science", icon: "💻" },
  { id: "art", name: "Art", icon: "🎨" },
  { id: "celebrity", name: "Celebrities", icon: "⭐" },
  { id: "sport", name: "Sports", icon: "⚽" },
  { id: "movies", name: "Film & TV", icon: "🎬" },
  { id: "music", name: "Music", icon: "🎵" },
  { id: "food", name: "Food & Cooking", icon: "🍳" },
  { id: "travel", name: "Travel", icon: "✈️" },
  { id: "fashion", name: "Fashion", icon: "👗" },
  { id: "nature", name: "Nature", icon: "🌿" },
  { id: "cars", name: "Cars", icon: "🚗" },
  { id: "gaming", name: "Gaming", icon: "🎮" },
  { id: "business", name: "Business", icon: "💼" },
  { id: "psychology", name: "Psychology", icon: "🧠" },
  { id: "health", name: "Health & Fitness", icon: "💪" },
  { id: "technology", name: "Technology", icon: "📱" },
  { id: "science", name: "Science", icon: "🔬" },
  { id: "politics", name: "Politics", icon: "🏛️" },
  { id: "economics", name: "Economics", icon: "💰" },
  { id: "astronomy", name: "Astronomy", icon: "🌟" },
  { id: "animals", name: "Animals", icon: "🦁" },
  { id: "architecture", name: "Architecture", icon: "🏗️" },
  { id: "languages", name: "World Languages", icon: "🗣️" },
  { id: "mythology", name: "Mythology", icon: "⚡" },
  { id: "religion", name: "Religions", icon: "🕉️" },
  { id: "philosophy", name: "Philosophy", icon: "🤔" },
  { id: "law", name: "Law", icon: "⚖️" },
  { id: "medicine", name: "Medicine", icon: "⚕️" },
  { id: "environment", name: "Environment", icon: "♻️" },
  { id: "beauty", name: "Beauty & Care", icon: "💄" },
  { id: "photography", name: "Photography", icon: "📷" },
  { id: "dance", name: "Dance", icon: "💃" },
  { id: "cooking", name: "Culinary Arts", icon: "👨‍🍳" },
  { id: "wine", name: "Wine & Gastronomy", icon: "🍷" },
  { id: "coffee", name: "Coffee", icon: "☕" },
  { id: "pets", name: "Pets", icon: "🐕" },
  { id: "gardening", name: "Gardening", icon: "🌱" },
  { id: "diy", name: "DIY & Crafts", icon: "🔨" },
  { id: "magic", name: "Magic & Illusions", icon: "🎩" },
  { id: "comics", name: "Comics", icon: "💥" },
  { id: "anime", name: "Anime & Manga", icon: "🎌" },
  { id: "socialMedia", name: "Social Media", icon: "📲" },
  { id: "brands", name: "Brands & Logos", icon: "™️" },
  { id: "flags", name: "Flags & Countries", icon: "🏁" },
];

export default function Education() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Authentication and loading states
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  // Tutoring states
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Marketplace states (moved to Learning tab)
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

  // Current tab state, default to 'tutoring' or from query param
  const [currentTab, setCurrentTab] = useState<string>(searchParams.get("tab") || "tutoring");

  useEffect(() => {
    checkAuthentication();
    loadCourses();
    loadMyLearning();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchTerm, selectedCategory, selectedDifficulty, courses]);

  useEffect(() => {
    // Update current tab if URL param changes
    const tab = searchParams.get("tab");
    if (tab) setCurrentTab(tab);
  }, [searchParams]);

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
        total_enrollments: 0,
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

      const [enrolledData, completedData, certificatesData] = await Promise.all([
        supabase
          .from("course_enrollments")
          .select(`*, courses (title, description, thumbnail_url)`)
          .eq("user_id", user.id),
        supabase
          .from("completed_courses")
          .select("*")
          .eq("user_id", user.id),
        supabase
          .from("course_certificates")
          .select(`*, courses (title)`)
          .eq("user_id", user.id)
      ]);

      setEnrolledCourses(enrolledData.data || []);
      setCompletedCourses(completedData.data || []);
      setCertificates(certificatesData.data || []);
    } catch (error) {
      console.error("Error loading my learning:", error);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(course => course.difficulty_level === selectedDifficulty);
    }

    setFilteredCourses(filtered);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
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

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("tutoring-chat", {
        body: { message: userMessage, history: chatHistory }
      });

      if (error) throw error;

      setChatHistory(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = (categoryId: string) => {
    navigate(`/quiz?category=${categoryId}`);
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
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5">
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="learning" className="gap-2">
            <Award className="h-4 w-4" />
            My Learning
          </TabsTrigger>
          <TabsTrigger value="creator" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Creator Dashboard
          </TabsTrigger>
          <TabsTrigger value="tutoring" className="gap-2">
            <Brain className="h-4 w-4" />
            Tutoring
          </TabsTrigger>
          <TabsTrigger value="quiz" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Quiz
          </TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="mt-6">
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
        </TabsContent>

        {/* My Learning Tab */}
        <TabsContent value="learning" className="mt-6">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">My Learning</h1>
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
                    </div>
                  ) : (
                    enrolledCourses.map((enrollment) => (
                      <Card
                        key={enrollment.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/course/${enrollment.course_id}/learn`)}
                      >
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                          {enrollment.courses.thumbnail_url ? (
                            <img
                              src={enrollment.courses.thumbnail_url}
                              alt={enrollment.courses.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <GraduationCap className="h-16 w-16 text-primary/50" />
                            </div>
                          )}
                        </div>
                        <CardHeader>
                          <CardTitle className="line-clamp-2">{enrollment.courses.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {enrollment.courses.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Progress value={enrollment.progress_percentage || 0} />
                          <p className="text-sm mt-2 text-muted-foreground">
                            Progress: {enrollment.progress_percentage || 0}%
                          </p>
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
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium">No completed courses</p>
                    </div>
                  ) : (
                    completedCourses.map((completed) => (
                      <Card
                        key={completed.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/course/${completed.course_id}/learn`)}
                      >
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                          {completed.thumbnail_url ? (
                            <img
                              src={completed.thumbnail_url}
                              alt={completed.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <GraduationCap className="h-16 w-16 text-primary/50" />
                            </div>
                          )}
                        </div>
                        <CardHeader>
                          <CardTitle className="line-clamp-2">{completed.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            Completed on {new Date(completed.completion_date).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
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
                      <p className="text-lg font-medium">No certificates earned</p>
                    </div>
                  ) : (
                    certificates.map((cert) => (
                      <Card key={cert.id}>
                        <CardHeader>
                          <CardTitle>{cert.courses.title}</CardTitle>
                          <CardDescription>
                            Issued on {new Date(cert.issued_at).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button
                            size="sm"
                            onClick={() => {
                              // Download certificate logic here
                              window.open(cert.certificate_url, "_blank");
                            }}
                          >
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
        <TabsContent value="creator" className="mt-6">
          <div className="container mx-auto px-4 py-8">
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
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
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
                  <Star className="h-4 w-4 text-muted-foreground" />
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

        {/* Tutoring Tab */}
        <TabsContent value="tutoring" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Online Tutoring</CardTitle>
              <CardDescription>
                Ask anything and get an instant answer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="min-h-[300px] max-h-[500px] overflow-y-auto space-y-4 p-4 bg-muted/50 rounded-lg">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Start a conversation by asking a question</p>
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground ml-12"
                          : "bg-background mr-12"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p>Teacher is thinking...</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Write your question..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[80px]"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !chatMessage.trim()}
                  size="icon"
                  className="h-[80px] w-[80px]"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quiz Tab */}
        <TabsContent value="quiz" className="mt-6">
          <div className="space-y-8">
            {/* Custom Quizzes Section */}
            <QuizList />
            
            {/* Original Quiz Categories Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">AI-Generated Quizzes by Category</CardTitle>
                <CardDescription>20 questions with instant AI feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quizCategories.map((category) => (
                    <Card key={category.id} className="hover:shadow-lg transition-shadow hover-scale">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <span className="text-3xl">{category.icon}</span>
                          {category.name}
                        </CardTitle>
                        <CardDescription>20 questions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => handleStartQuiz(category.id)}
                          className="w-full"
                        >
                          Start
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
