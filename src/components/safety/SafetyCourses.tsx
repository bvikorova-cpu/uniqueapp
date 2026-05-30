import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { GraduationCap, CheckCircle, ArrowRight, Trophy } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const courses = [
  {
    id: "recognizing-bullying",
    title: "Recognizing Bullying",
    description: "Learn to identify different forms of bullying behavior",
    lessons: [
      {
        id: "types",
        title: "Types of Bullying",
        content: `Bullying comes in many forms:\n\n**Physical Bullying**: Hitting, kicking, pushing, or damaging property\n\n**Verbal Bullying**: Name-calling, insults, teasing, threats\n\n**Social Bullying**: Spreading rumors, exclusion, embarrassing someone publicly\n\n**Cyberbullying**: Online harassment, sharing embarrassing content, impersonation`,
        quiz: {
          question: "Which of the following is an example of social bullying?",
          options: ["Pushing someone", "Sending mean texts", "Spreading rumors about someone", "Taking someone's lunch money"],
          correct: 2
        }
      },
      {
        id: "signs",
        title: "Warning Signs",
        content: `How to recognize if someone is being bullied:\n\n• Unexplained injuries or damaged belongings\n• Changes in eating or sleeping habits\n• Declining grades or interest in school\n• Loss of friends or avoiding social situations\n• Feelings of helplessness or low self-esteem\n• Self-destructive behaviors`,
        quiz: {
          question: "What might indicate someone is being bullied?",
          options: ["Getting better grades", "Making new friends", "Sudden loss of interest in activities they loved", "Eating more"],
          correct: 2
        }
      }
    ]
  },
  {
    id: "responding-to-bullying",
    title: "Responding to Bullying",
    description: "Safe and effective ways to respond when bullied",
    lessons: [
      {
        id: "immediate",
        title: "Immediate Response",
        content: `When being bullied:\n\n1. **Stay Calm**: Don't show anger or fear - bullies want a reaction\n2. **Walk Away**: Remove yourself from the situation when safe\n3. **Use Confident Body Language**: Stand tall, make eye contact\n4. **Use Assertive Responses**: "Stop. That's not okay." then walk away\n5. **Find Safety**: Go to a trusted adult or crowded area`,
        quiz: {
          question: "What is the best immediate response to verbal bullying?",
          options: ["Fight back physically", "Cry to make them feel bad", "Stay calm and walk away", "Insult them back"],
          correct: 2
        }
      },
      {
        id: "reporting",
        title: "Reporting & Documentation",
        content: `Building your case:\n\n• **Document Everything**: Dates, times, what happened, witnesses\n• **Save Evidence**: Screenshots of cyberbullying, keep damaged items\n• **Report to Adults**: Teachers, parents, counselors, or HR\n• **Follow Up**: If nothing changes, escalate to higher authorities\n• **Know Your Rights**: Schools and workplaces have anti-bullying policies`,
        quiz: {
          question: "Why is documentation important?",
          options: ["To share on social media", "To have evidence when reporting", "To embarrass the bully later", "It's not important"],
          correct: 1
        }
      }
    ]
  },
  {
    id: "self-defense-basics",
    title: "Self-Defense Basics",
    description: "Physical and emotional self-defense strategies",
    lessons: [
      {
        id: "physical",
        title: "Physical Safety",
        content: `Self-defense is about PROTECTION, not fighting:\n\n**Prevention First**:\n• Stay aware of your surroundings\n• Travel in groups when possible\n• Avoid isolated areas\n\n**If Physically Threatened**:\n• Create distance and barriers\n• Make noise to attract attention\n• Target escape, not confrontation\n• If grabbed: stomp feet, elbow strikes, break grip and RUN\n\n**Remember**: Your safety is the priority. Running away is always the right choice.`,
        quiz: {
          question: "What should be your PRIMARY goal in a physical threat?",
          options: ["Win the fight", "Hurt the attacker", "Escape to safety", "Stand your ground"],
          correct: 2
        }
      },
      {
        id: "emotional",
        title: "Emotional Resilience",
        content: `Building inner strength:\n\n• **Self-Worth**: Bullying says nothing about YOU, everything about the BULLY\n• **Support Network**: Connect with friends, family, counselors\n• **Self-Care**: Exercise, hobbies, adequate sleep\n• **Positive Self-Talk**: Replace negative thoughts with affirmations\n• **Professional Help**: Therapy is a sign of strength, not weakness`,
        quiz: {
          question: "What does bullying behavior tell us?",
          options: ["Something is wrong with the victim", "Something is wrong with the bully", "The victim deserved it", "Bullying is normal"],
          correct: 1
        }
      }
    ]
  }
];

const SafetyCourses = () => {
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number>(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const { data: progress } = useQuery({
    queryKey: ["safety-course-progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("safety_course_progress")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    }
  });

  const completeLesson = useMutation({
    mutationFn: async ({ courseId, lessonId, score }: { courseId: string; lessonId: string; score: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to track progress");

      const { error } = await supabase
        .from("safety_course_progress")
        .upsert({
          user_id: user.id,
          course_id: courseId,
          lesson_id: lessonId,
          completed: true,
          quiz_score: score,
          completed_at: new Date().toISOString()
        }, { onConflict: "user_id,course_id,lesson_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety-course-progress"] });
      queryClient.invalidateQueries({ queryKey: ["safety-badges"] });
      toast.success("Lesson completed! Great job!");
    }
  });

  const isLessonCompleted = (courseId: string, lessonId: string) => {
    return progress?.some((p: any) => p.course_id === courseId && p.lesson_id === lessonId && p.completed);
  };

  const getCourseProgress = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return 0;
    const completed = course.lessons.filter(l => isLessonCompleted(courseId, l.id)).length;
    return (completed / course.lessons.length) * 100;
  };

  const currentCourse = courses.find(c => c.id === selectedCourse);
  const currentLesson = currentCourse?.lessons[selectedLesson];

  const handleQuizSubmit = () => {
    if (selectedAnswer === null || !currentCourse || !currentLesson) return;
    
    setQuizSubmitted(true);
    const score = selectedAnswer === currentLesson.quiz.correct ? 100 : 0;
    
    completeLesson.mutate({
      courseId: currentCourse.id,
      lessonId: currentLesson.id,
      score
    });
  };

  const nextLesson = () => {
    if (!currentCourse) return;
    if (selectedLesson < currentCourse.lessons.length - 1) {
      setSelectedLesson(selectedLesson + 1);
      setShowQuiz(false);
      setSelectedAnswer(null);
      setQuizSubmitted(false);
    } else {
      setSelectedCourse(null);
      toast.success("Course completed! 🎉");
    }
  };

  if (selectedCourse && currentCourse) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedCourse(null)}>
          ← Back to Courses
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{currentCourse.title}</CardTitle>
                <CardDescription>
                  Lesson {selectedLesson + 1} of {currentCourse.lessons.length}: {currentLesson?.title}
                </CardDescription>
              </div>
              <Progress value={getCourseProgress(currentCourse.id)} className="w-32" />
            </div>
          </CardHeader>
          <CardContent>
            {!showQuiz ? (
              <div className="space-y-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap">{currentLesson?.content}</div>
                </div>
                <Button onClick={() => setShowQuiz(true)} className="w-full">
                  Take Quiz <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold">{currentLesson?.quiz.question}</h3>
                <RadioGroup 
                  value={selectedAnswer?.toString()} 
                  onValueChange={(v) => !quizSubmitted && setSelectedAnswer(parseInt(v))}
                >
                  {currentLesson?.quiz.options.map((option, i) => (
                    <div key={i} className={`flex items-center space-x-2 p-3 rounded-lg border ${
                      quizSubmitted && i === currentLesson.quiz.correct ? "border-green-500 bg-green-500/10" : 
                      quizSubmitted && i === selectedAnswer && i !== currentLesson.quiz.correct ? "border-red-500 bg-red-500/10" : ""
                    }`}>
                      <RadioGroupItem value={i.toString()} id={`option-${i}`} disabled={quizSubmitted} />
                      <Label htmlFor={`option-${i}`} className="cursor-pointer flex-1">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
                
                {!quizSubmitted ? (
                  <Button onClick={handleQuizSubmit} disabled={selectedAnswer === null}>
                    Submit Answer
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <p className={selectedAnswer === currentLesson?.quiz.correct ? "text-green-500" : "text-red-500"}>
                      {selectedAnswer === currentLesson?.quiz.correct ? "✓ Correct!" : "✗ Incorrect. The correct answer is highlighted above."}
                    </p>
                    <Button onClick={nextLesson}>
                      {selectedLesson < currentCourse.lessons.length - 1 ? "Next Lesson" : "Complete Course"} <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Interactive Courses
          </CardTitle>
          <CardDescription>
            Learn about bullying prevention, safe responses, and self-defense with interactive quizzes.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map(course => {
          const courseProgress = getCourseProgress(course.id);
          const isComplete = courseProgress === 100;
          
          return (
            <Card key={course.id} className={isComplete ? "border-green-500/50" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  {isComplete && <Trophy className="h-5 w-5 text-amber-500" />}
                </div>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Progress value={courseProgress} className="flex-1" />
                    <span className="text-sm font-medium">{Math.round(courseProgress)}%</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {course.lessons.map(lesson => (
                      <Badge 
                        key={lesson.id} 
                        variant={isLessonCompleted(course.id, lesson.id) ? "default" : "outline"}
                        className="text-xs"
                      >
                        {isLessonCompleted(course.id, lesson.id) && <CheckCircle className="h-3 w-3 mr-1" />}
                        {lesson.title}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    onClick={() => {
                      setSelectedCourse(course.id);
                      setSelectedLesson(0);
                      setShowQuiz(false);
                      setSelectedAnswer(null);
                      setQuizSubmitted(false);
                    }} 
                    variant={isComplete ? "outline" : "default"}
                    className="w-full"
                  >
                    {isComplete ? "Review Course" : courseProgress > 0 ? "Continue" : "Start Course"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SafetyCourses;
