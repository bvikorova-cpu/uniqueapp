import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LessonPlayer } from "@/components/course-creator/LessonPlayer";
import { QuizTaker } from "@/components/student-learning/QuizTaker";
import { useCertificate } from "@/hooks/useCertificate";
import {
  BookOpen,
  CheckCircle,
  Circle,
  Clock,
  Award,
  ChevronRight,
  PlayCircle,
  Download,
} from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Course {
  id: string;
  title: string;
  description: string;
  total_lessons: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
}

interface LessonProgress {
  id: string;
  enrollment_id: string;
  lesson_id: string;
  is_completed: boolean;
  last_watched_at: string | null;
  watch_time_seconds: number | null;
  completed_at: string | null;
}

interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  passing_score: number;
}

export default function CourseLearnPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [enrollmentId, setEnrollmentId] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");
  const [showCertificate, setShowCertificate] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [certificateHtml, setCertificateHtml] = useState<string | null>(null);
  const { generateCertificate, isGenerating } = useCertificate();

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access this course",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      setUserId(user.id);

      // Load user profile for student name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.full_name) {
        setStudentName(profile.full_name);
      }


      // Check enrollment
      const { data: enrollment } = await supabase
        .from("course_enrollments")
        .select("id")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!enrollment) {
        toast({
          title: "Access Denied",
          description: "You need to purchase this course first",
          variant: "destructive",
        });
        navigate(`/course/${courseId}`);
        return;
      }

      setEnrollmentId(enrollment.id);

      // Load course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, description, total_lessons")
        .eq("id", courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Load lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Load progress
      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("enrollment_id", enrollment.id)
        .in("lesson_id", (lessonsData || []).map(l => l.id));

      const progressMap: Record<string, LessonProgress> = {};
      progressData?.forEach((p) => {
        progressMap[p.lesson_id] = p;
      });
      setProgress(progressMap);

      // Set first incomplete lesson or first lesson as current
      const firstIncomplete = lessonsData?.find(
        (l) => !progressMap[l.id]?.is_completed
      );
      setCurrentLesson(firstIncomplete || lessonsData?.[0] || null);

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

  const handleLessonComplete = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from("lesson_progress")
        .upsert({
          enrollment_id: enrollmentId,
          lesson_id: lessonId,
          is_completed: true,
          last_watched_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          watch_time_seconds: 0,
        });

      if (error) throw error;

      // Update local progress
      setProgress({
        ...progress,
        [lessonId]: {
          id: progress[lessonId]?.id || "",
          enrollment_id: enrollmentId,
          lesson_id: lessonId,
          is_completed: true,
          last_watched_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          watch_time_seconds: 0,
        },
      });

      toast({
        title: "Lesson Completed!",
        description: "Great job! Moving to the next lesson.",
      });

      // Move to next lesson
      const currentIndex = lessons.findIndex((l) => l.id === lessonId);
      if (currentIndex < lessons.length - 1) {
        setCurrentLesson(lessons[currentIndex + 1]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStartQuiz = async (lessonId: string) => {
    try {
      const { data: quiz } = await supabase
        .from("course_quizzes")
        .select("*")
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (quiz) {
        setCurrentQuiz(quiz);
        setIsQuizOpen(true);
      } else {
        toast({
          title: "No Quiz Available",
          description: "This lesson doesn't have a quiz yet.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const calculateProgress = () => {
    if (lessons.length === 0) return 0;
    const completed = Object.values(progress).filter((p) => p.is_completed).length;
    return Math.round((completed / lessons.length) * 100);
  };

  const handleGenerateCertificate = () => {
    if (!studentName) {
      setShowNamePrompt(true);
    } else {
      setShowCertificate(true);
    }
  };

  const handleNameSubmit = async () => {
    if (nameInput.trim() && course) {
      setStudentName(nameInput.trim());
      setShowNamePrompt(false);
      
      const result = await generateCertificate(courseId!, course.title, nameInput.trim());
      if (result?.certificateHtml) {
        setCertificateHtml(result.certificateHtml);
        setShowCertificate(true);
      }
    }
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks title="How Course Learn Page works" steps={[
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

  const completedLessons = Object.values(progress).filter((p) => p.is_completed).length;
  const overallProgress = calculateProgress();

  return (
    <div className="min-h-screen bg-background">
      {/* Lesson Player Modal */}
      {currentLesson && (
        <LessonPlayer
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          lessonTitle={currentLesson.title}
          videoUrl={currentLesson.video_url}
          description={currentLesson.description}
        />
      )}

      {/* Quiz Modal */}
      {currentQuiz && currentLesson && (
        <QuizTaker
          isOpen={isQuizOpen}
          onClose={() => {
            setIsQuizOpen(false);
            setCurrentQuiz(null);
          }}
          quiz={currentQuiz}
          userId={userId}
          onComplete={() => {
            handleLessonComplete(currentLesson.id);
            setIsQuizOpen(false);
          }}
        />
      )}

      {/* Header */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-black mb-2">{course.title}</h1>
              <p className="text-muted-foreground">{course.description}</p>
            </div>
            <Button variant="outline" onClick={() => navigate(`/course/${courseId}`)}>
              Course Details
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Course Progress</span>
              <span className="text-muted-foreground">
                {completedLessons} of {lessons.length} lessons completed
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              <span>{overallProgress}% Complete</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Lesson List Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Curriculum
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                {lessons.map((lesson, index) => {
                  const isCompleted = progress[lesson.id]?.is_completed;
                  const isCurrent = currentLesson?.id === lesson.id;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLesson(lesson)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isCurrent
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm mb-1">
                            {index + 1}. {lesson.title}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{lesson.duration_minutes} min</span>
                          </div>
                        </div>
                        {isCurrent && (
                          <ChevronRight className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Current Lesson Content */}
          <div className="lg:col-span-2">
            {currentLesson ? (
              <div className="space-y-6">
                {/* Lesson Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="mb-2">{currentLesson.title}</CardTitle>
                        {currentLesson.description && (
                          <p className="text-muted-foreground">
                            {currentLesson.description}
                          </p>
                        )}
                      </div>
                      {progress[currentLesson.id]?.is_completed && (
                        <Badge className="shrink-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={() => setIsPlayerOpen(true)}
                    >
                      <PlayCircle className="mr-2 h-5 w-5" />
                      {progress[currentLesson.id]?.is_completed
                        ? "Rewatch Lesson"
                        : "Start Lesson"}
                    </Button>

                    {!progress[currentLesson.id]?.is_completed && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleLessonComplete(currentLesson.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Complete
                      </Button>
                    )}

                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleStartQuiz(currentLesson.id)}
                    >
                      <Award className="mr-2 h-4 w-4" />
                      Take Quiz
                    </Button>
                  </CardContent>
                </Card>

                {/* Next Lesson Preview */}
                {(() => {
                  const currentIndex = lessons.findIndex(
                    (l) => l.id === currentLesson.id
                  );
                  const nextLesson = lessons[currentIndex + 1];

                  if (nextLesson) {
                    return (
                      <Card className="bg-muted/30">
                        <CardHeader>
                          <CardTitle className="text-lg">Up Next</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium mb-1">{nextLesson.title}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{nextLesson.duration_minutes} min</span>
                              </div>
                            </div>
                            <Button
                              onClick={() => setCurrentLesson(nextLesson)}
                            >
                              Continue
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }

                  if (overallProgress === 100) {
                    return showCertificate && certificateHtml ? (
                      <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
                        <CardContent className="py-8">
                          <div className="text-center space-y-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                              <Award className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-3xl font-bold">Certificate Earned! 🎉</h3>
                            <p className="text-muted-foreground">
                              Congratulations on completing {course.title}
                            </p>
                            
                            {/* Certificate Preview */}
                            <div className="max-w-4xl mx-auto border rounded-lg overflow-hidden shadow-lg">
                              <div 
                                dangerouslySetInnerHTML={{ __html: certificateHtml }}
                                className="w-full"
                              />
                            </div>
                            
                            <div className="flex gap-4 justify-center">
                              <Button
                                onClick={() => {
                                  const printWindow = window.open('', '_blank');
                                  if (printWindow) {
                                    printWindow.document.write(certificateHtml);
                                    printWindow.document.close();
                                    printWindow.print();
                                  }
                                }}
                                size="lg"
                              >
                                <Download className="mr-2 h-5 w-5" />
                                Download Certificate
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => navigate("/my-learning")}
                                size="lg"
                              >
                                View My Courses
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : showNamePrompt ? (
                      <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="py-8">
                          <h3 className="text-xl font-bold mb-4 text-center">
                            Enter Your Name for Certificate
                          </h3>
                          <p className="text-muted-foreground mb-6 text-center">
                            Please enter your full name as you'd like it to appear on your certificate
                          </p>
                          <div className="max-w-md mx-auto space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="student-name">Full Name</Label>
                              <Input
                                id="student-name"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                placeholder="John Doe"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleNameSubmit();
                                  }
                                }}
                              />
                            </div>
                            <Button
                              onClick={handleNameSubmit}
                              disabled={!nameInput.trim() || isGenerating}
                              className="w-full"
                              size="lg"
                            >
                              <Award className="mr-2 h-5 w-5" />
                              {isGenerating ? "Generating..." : "Generate Certificate"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="text-center py-8">
                          <Award className="h-16 w-16 text-primary mx-auto mb-4" />
                          <h3 className="text-2xl font-black mb-2">
                            Congratulations! 🎉
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            You've completed all lessons in this course!
                          </p>
                          <Button size="lg" onClick={handleGenerateCertificate}>
                            <Award className="mr-2 h-5 w-5" />
                            Get Your Certificate
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  }

                  return null;
                })()}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select a lesson from the curriculum to start learning
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
