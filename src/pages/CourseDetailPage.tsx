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
import { CourseDiscussion } from "@/components/courses/CourseDiscussion";
import { CourseLeaderboard } from "@/components/courses/CourseLeaderboard";
import { LiveLessonRoom } from "@/components/courses/LiveLessonRoom";
import {
  Play,
  Clock,
  Users,
  Star,
  BookOpen,
  CheckCircle,
  Lock,
  Video,
} from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Course {
  id: string;
  creator_id: string;
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
  const [liveLessons, setLiveLessons] = useState<any[]>([]);
  const [selectedLiveLesson, setSelectedLiveLesson] = useState<any>(null);

  useEffect(() => {
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

      // Load live lessons
      const { data: liveLessonsData } = await supabase
        .from("live_lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("scheduled_at", { ascending: true });

      setLiveLessons(liveLessonsData || []);

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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase this course",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke("purchase-course", {
        body: { courseId },
      });

      if (error) throw error;

      // Redirect to Stripe checkout
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
    } else {
      toast({
        title: "Purchase Required",
        description: "You need to purchase this course to access this lesson",
        variant: "destructive",
      });
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
      {/* Course Header */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
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
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Play className="h-16 w-16 text-primary" />
                  </div>
                  <CardTitle className="text-3xl">€{course.price.toFixed(2)}</CardTitle>
                  <CardDescription>One-time purchase • Lifetime access</CardDescription>
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
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handlePurchase}
                      disabled={purchasing}
                    >
                      {purchasing ? "Processing..." : "Buy Now"}
                    </Button>
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
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-6">
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="live-lessons">
              <Video className="w-4 h-4 mr-2" />
              Live Lessons
            </TabsTrigger>
          </TabsList>

          <TabsContent value="curriculum" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>
                  {course.total_lessons} lessons • {course.duration_minutes} minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{lesson.title}</h4>
                          {lesson.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {lesson.duration_minutes} min
                        </span>
                        {lesson.is_preview ? (
                          <Button
                            size="sm"
                            variant="outline"
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

          <TabsContent value="discussion" className="mt-6">
            <CourseDiscussion 
              courseId={courseId!} 
              userHasAccess={isEnrolled}
              isInstructor={isInstructor}
            />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            <CourseLeaderboard courseId={courseId!} />
          </TabsContent>

          <TabsContent value="live-lessons" className="mt-6">
            {selectedLiveLesson ? (
              <div>
                <Button
                  variant="outline"
                  className="mb-4"
                  onClick={() => setSelectedLiveLesson(null)}
                >
                  ← Back to Schedule
                </Button>
                <LiveLessonRoom
                  lessonId={selectedLiveLesson.id}
                  lessonTitle={selectedLiveLesson.title}
                  isInstructor={isInstructor}
                />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Live Lessons</CardTitle>
                  <CardDescription>
                    Interactive real-time classes with screen sharing, whiteboard, and breakout rooms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {liveLessons.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No live lessons scheduled yet</p>
                      {isInstructor && (
                        <p className="text-sm mt-2">
                          Schedule your first live lesson to engage with students in real-time
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {liveLessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{lesson.title}</h4>
                              <Badge
                                variant={
                                  lesson.status === "live"
                                    ? "default"
                                    : lesson.status === "scheduled"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {lesson.status}
                              </Badge>
                            </div>
                            {lesson.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {lesson.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>
                                {new Date(lesson.scheduled_at).toLocaleString()}
                              </span>
                              <span>{lesson.duration_minutes} minutes</span>
                              <span>Max {lesson.max_participants} participants</span>
                            </div>
                          </div>
                          {(isEnrolled || isInstructor) && lesson.status !== "ended" && (
                            <Button
                              onClick={() => setSelectedLiveLesson(lesson)}
                              variant={lesson.status === "live" ? "default" : "outline"}
                            >
                              <Video className="w-4 h-4 mr-2" />
                              {lesson.status === "live" ? "Join Now" : "Enter Room"}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}