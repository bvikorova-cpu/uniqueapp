import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Award, Clock, TrendingUp, Download } from "lucide-react";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface EnrolledCourse {
  id: string;
  course_id: string;
  progress_percentage: number;
  enrolled_at: string;
  courses: {
    title: string;
    description: string;
    thumbnail_url: string | null;
  };
}

interface CompletedCourse {
  id: string;
  course_name: string;
  completion_date: string;
  test_score: number | null;
}

interface Certificate {
  id: string;
  course_id: string;
  student_name: string;
  issued_at: string;
  courses: {
    title: string;
  };
}

export default function MyLearning() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
  };

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load enrolled courses
      const { data: enrolled } = await supabase
        .from("course_enrollments")
        .select(`
          *,
          courses (
            title,
            description,
            thumbnail_url
          )
        `)
        .eq("user_id", user.id)
        .order("enrolled_at", { ascending: false });

      // Load completed courses
      const { data: completed } = await supabase
        .from("completed_courses")
        .select("*")
        .eq("user_id", user.id)
        .order("completion_date", { ascending: false });

      // Load certificates
      const { data: certs } = await supabase
        .from("course_certificates")
        .select(`
          *,
          courses (
            title
          )
        `)
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });

      setEnrolledCourses(enrolled || []);
      setCompletedCourses(completed || []);
      setCertificates(certs || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load your learning data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    inProgress: enrolledCourses.length,
    completed: completedCourses.length,
    certificates: certificates.length,
    avgProgress: enrolledCourses.length > 0
      ? Math.round(enrolledCourses.reduce((acc, c) => acc + (c.progress_percentage || 0), 0) / enrolledCourses.length)
      : 0,
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks title="How My Learning works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
        <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading your learning journey...</p>
      </div>
      </>
      );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
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
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
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
                  <p className="text-2xl font-bold">{stats.completed}</p>
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
                  <p className="text-2xl font-bold">{stats.certificates}</p>
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
                  <p className="text-2xl font-bold">{stats.avgProgress}%</p>
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
              {enrolledCourses.map((enrollment) => (
                <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{enrollment.courses.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {enrollment.courses.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{enrollment.progress_percentage || 0}%</span>
                      </div>
                      <Progress value={enrollment.progress_percentage || 0} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Enrolled on {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      onClick={() => navigate(`/course/${enrollment.course_id}/learn`)}
                      className="w-full"
                    >
                      Continue Learning
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {enrolledCourses.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No courses in progress</p>
                  <Button onClick={() => navigate("/courses")} className="mt-4">
                    Browse Courses
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="space-y-4">
              {completedCourses.map((completed) => (
                <Card key={completed.id}>
                  <CardHeader>
                  <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{completed.course_name}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                        Completed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Completed on {new Date(completed.completion_date).toLocaleDateString()}</span>
                      {completed.test_score !== null && (
                        <span>Score: {completed.test_score}%</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {completedCourses.length === 0 && (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No completed courses yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="certificates" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-4 bg-primary/10 rounded-full">
                        <Award className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-center line-clamp-2">{cert.courses.title}</CardTitle>
                    <CardDescription className="text-center">
                      {cert.student_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center text-sm text-muted-foreground">
                      Issued on {new Date(cert.issued_at).toLocaleDateString()}
                    </div>
                    <Button variant="outline" className="w-full gap-2" onClick={() => {
                      const text = `Certificate of Completion\n\n${(cert as any).course_title || "Course"}\nIssued: ${new Date(cert.issued_at).toLocaleDateString()}\nID: ${cert.id}`;
                      const blob = new Blob([text], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `certificate-${cert.id}.txt`;
                      document.body.appendChild(a); a.click(); a.remove();
                      URL.revokeObjectURL(url);
                      toast({ description: "Certificate downloaded" });
                    }}>
                      <Download className="h-4 w-4" />
                      Download Certificate
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {certificates.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No certificates earned yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Complete courses to earn certificates
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
