import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LessonPlayer } from "@/components/course-creator/LessonPlayer";
import { CourseReviews } from "@/components/courses/CourseReviews";
import { Play,
  Clock,
  Users,
  Star,
  BookOpen,
  CheckCircle,
  Lock,
  Video,
  ArrowLeft } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { CourseChatDialog } from "@/components/tutorial-platform/CourseChatDialog";
interface Course {
  id: string;
  creator_id: string;
  thumbnail_url?: string | null;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  price: number;
  duration_minutes: number;
  total_lessons: number;
  total_enrollments: number;
  average_rating: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
  is_preview: boolean;
}

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!courseId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseId)) {
      setLoading(false);
      return;
    }
    loadCourseDetails();
  }, [courseId]);

  const loadCourseDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Load course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Load lessons
      const { data: lessonsData } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      setLessons(lessonsData || []);

      // Check if user is enrolled
      if (user) {
        const { data: enrollment } = await supabase
          .from("course_enrollments")
          .select("id")
          .eq("course_id", courseId)
          .eq("user_id", user.id)
          .maybeSingle();

        setIsEnrolled(!!enrollment);
        
        // Check if user is the course creator
        setIsInstructor(courseData.creator_id === user.id);
      }
    } catch (error: any) { toast({
        title: "Error",
        description: error.message,
        variant: "destructive" });
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to request access to this course",
        variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!course) return;

    setPurchasing(true);
    try {
      await (supabase as any)
        .from("course_access_requests")
        .upsert(
          { course_id: course.id, buyer_id: user.id, creator_id: course.creator_id },
          { onConflict: "course_id,buyer_id", ignoreDuplicates: true },
        );
      setChatOpen(true);
    } finally {
      setPurchasing(false);
    }
  };

  const handlePlayLesson = (lesson: Lesson) => {
    // Allow preview lessons to be played by anyone
    // Only enrolled users can play non-preview lessons
    if (lesson.is_preview || isEnrolled) {
      setSelectedLesson(lesson);
      setIsPlayerOpen(true);
    } else { toast({
        title: "Purchase Required",
        description: "You need to purchase this course to access this lesson",
        variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks title="How Course Detail Page works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
        <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading course...</p>
        </div>
      </div>
      </>
      );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Lesson Player Modal */}
      {selectedLesson && (
        <LessonPlayer
          key={selectedLesson.id}
          isOpen={isPlayerOpen}
          onClose={() => {
            setIsPlayerOpen(false);
            setSelectedLesson(null);
          }}
          lessonTitle={selectedLesson.title}
          videoUrl={selectedLesson.video_url || ""}
          description={selectedLesson.description || ""}
        />
      )}
      {course && (
        <CourseChatDialog
          open={chatOpen}
          onOpenChange={setChatOpen}
          courseId={course.id}
          courseTitle={course.title}
          coursePrice={course.price}
          otherId={course.creator_id}
          prefillInterest
        />
      )}
      {/* Course Header */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {course.thumbnail_url && (
                  <div className="mb-6 aspect-video max-h-[420px] overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={course.thumbnail_url}
                      alt={`${course.title} course cover`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              <div className="flex gap-2 mb-4">
                <Badge>{course.category}</Badge>
                <Badge variant="outline">{course.difficulty_level}</Badge>
              </div>
              <h1 className="text-4xl font-black mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{course.description}</p>
              
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{course.duration_minutes} minutes total</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span>{course.total_lessons} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>{course.total_enrollments} students</span>
                </div>
                {course.average_rating > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span>{course.average_rating.toFixed(1)} rating</span>
                  </div>
                )}
              </div>
            </div>

            {/* Purchase Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                   <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                     {course.thumbnail_url ? (
                       <img src={course.thumbnail_url} alt="" className="h-full w-full object-cover" />
                     ) : (
                       <Play className="h-16 w-16 text-primary" />
                     )}
                   </div>
                  <CardTitle className="text-3xl">€{course.price.toFixed(2)}</CardTitle>
                  <CardDescription>Pay the creator directly • Lifetime access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEnrolled ? (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => navigate(`/tutorial-course/${courseId}/learn`)}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Continue Learning
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleRequestAccess}
                        disabled={purchasing || isInstructor}
                      >
                         {purchasing ? "Opening chat..." : "Request access · 3 CR"}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                         Review the course description, full curriculum and free preview lesson before requesting access. Your first message costs 3 credits once per course; course payment is arranged directly with the creator.
                      </p>

                    </>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>All {course.total_lessons} video lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Downloadable resources</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Community discussions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="container mx-auto px-4 py-16">
        <Tabs defaultValue="curriculum">
          <TabsList className="flex w-full overflow-x-auto md:overflow-visible h-auto p-1 gap-1">
            <TabsTrigger value="curriculum" className="whitespace-nowrap px-4 py-2">Curriculum</TabsTrigger>
            <TabsTrigger value="about" className="whitespace-nowrap px-4 py-2">About</TabsTrigger>
            <TabsTrigger value="reviews" className="whitespace-nowrap px-4 py-2">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="curriculum" className="mt-6">
            <Card>
              <CardHeader>
                 <CardTitle>Course Preview & Curriculum</CardTitle>
                <CardDescription>
                   See every lesson before requesting access. The first lesson is available as a free preview.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm sm:text-base break-words">{lesson.title}</h4>
                          {lesson.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                              {lesson.description}
                            </p>
                          )}
                          <span className="mt-1 block text-xs text-muted-foreground sm:hidden">
                            {lesson.duration_minutes} min
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3 shrink-0">
                        <span className="hidden sm:inline text-sm text-muted-foreground whitespace-nowrap">
                          {lesson.duration_minutes} min
                        </span>
                        {lesson.is_preview ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => handlePlayLesson(lesson)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        ) : !isEnrolled ? (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full sm:w-auto"
                            onClick={() => handlePlayLesson(lesson)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{course.description}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <CourseReviews courseId={courseId!} userHasAccess={isEnrolled} />
          </TabsContent>

        </Tabs>
      </section>
    </div>
  );
}