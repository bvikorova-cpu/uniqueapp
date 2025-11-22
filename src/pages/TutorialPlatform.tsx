import { useState, useEffect } from "react";
import { GraduationCap, Plus, TrendingUp, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TutorialPlatform = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      // Load all published courses
      const { data: allCourses, error: allError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (allError) throw allError;
      setCourses(allCourses || []);

      // Load my courses if authenticated
      if (user) {
        const { data: userCourses, error: myError } = await supabase
          .from('courses')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });

        if (myError) throw myError;
        setMyCourses(userCourses || []);
      }
    } catch (error: any) {
      console.error("Error loading courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create courses",
        variant: "destructive"
      });
      return;
    }
    navigate('/course-creator');
  };

  const CourseCard = ({ course, isMyCourse = false }: any) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="line-clamp-1">{course.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-2">{course.description}</CardDescription>
          </div>
          {course.price > 0 && (
            <Badge variant="secondary" className="shrink-0">€{course.price}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Video className="w-4 h-4" />
            {course.duration_minutes || 0}min
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {course.enrollment_count || 0} students
          </div>
          {course.average_rating && (
            <div className="flex items-center gap-1">
              ⭐ {course.average_rating.toFixed(1)}
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Badge variant="outline">{course.category}</Badge>
          {course.difficulty_level && (
            <Badge variant="outline">{course.difficulty_level}</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() => navigate(`/course/${course.id}`)}
        >
          {isMyCourse ? "Edit Course" : course.price > 0 ? "Enroll Now" : "Start Learning"}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="h-24" />
          <GraduationCap className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-6">Tutorial & Course Platform</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Share your expertise and earn money by creating educational courses and tutorials. Build a learning business with our comprehensive course creation tools.
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            <strong>How it works:</strong> Create structured courses with video lessons, quizzes, and downloadable resources. Set your own price in euros. Students enroll and pay to access your content - you earn 70% per enrollment (30% platform fee). Track student progress, engagement, and course performance. Build your reputation as an educator and grow your audience. Courses can be free or paid. Perfect for professionals, educators, and experts wanting to monetize their knowledge.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Create Courses</h3>
            <p className="text-muted-foreground">Build comprehensive tutorials</p>
          </Card>
          <Card className="p-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Earn Revenue</h3>
            <p className="text-muted-foreground">70% from each enrollment</p>
          </Card>
          <Card className="p-6 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Build Audience</h3>
            <p className="text-muted-foreground">Grow your student base</p>
          </Card>
        </div>

        {userId && (
          <div className="mb-8">
            <Button size="lg" onClick={handleCreateCourse}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Course
            </Button>
          </div>
        )}

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Courses ({courses.length})</TabsTrigger>
            {userId && (
              <TabsTrigger value="mycourses">My Courses ({myCourses.length})</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="all">
            {loading ? (
              <div className="text-center py-12">Loading courses...</div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No courses available yet</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </TabsContent>

          {userId && (
            <TabsContent value="mycourses">
              {loading ? (
                <div className="text-center py-12">Loading your courses...</div>
              ) : myCourses.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">You haven't created any courses yet</p>
                  <Button onClick={handleCreateCourse}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Course
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myCourses.map((course) => (
                    <CourseCard key={course.id} course={course} isMyCourse />
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default TutorialPlatform;